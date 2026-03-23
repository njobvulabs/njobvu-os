
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, BrainCircuit, Search, Bot, Monitor, Paperclip, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { streamGeminiResponse, Part } from '../../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  content: string;
  attachments?: string[];
}

type CopilotMode = 'balanced' | 'think' | 'research';

// Simple Markdown Renderer
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const formatText = (input: string) => {
    // Bold
    let formatted = input.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Code blocks (simple)
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<div class="bg-black/30 p-2 rounded-md my-2 font-mono text-xs overflow-x-auto border border-white/10">$1</div>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<span class="bg-black/30 px-1 rounded font-mono text-xs border border-white/10">$1</span>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  };

  return <div dangerouslySetInnerHTML={{ __html: formatText(text) }} />;
};

export const SystemCopilot: React.FC = () => {
  const { isCopilotOpen, toggleCopilot, windows, activeWindowId, currentUser, systemSettings } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello ${currentUser.username}. I am your system copilot. I can see your open applications and help with your current tasks.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<CopilotMode>('balanced');
  
  // Attachments
  const [attachments, setAttachments] = useState<Part[]>([]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCopilotOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isCopilotOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // File Attachments
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const base64 = (ev.target?.result as string).split(',')[1];
              const mimeType = file.type;
              
              if (mimeType.startsWith('image/')) {
                  setAttachments(prev => [...prev, { inlineData: { mimeType, data: base64 } }]);
              } else {
                  // Text file fallback
                  const textReader = new FileReader();
                  textReader.onload = (tev) => {
                      const textContent = tev.target?.result as string;
                      setAttachments(prev => [...prev, { text: `[File: ${file.name}]\n${textContent}` }]);
                  };
                  textReader.readAsText(file);
                  return;
              }
              setAttachmentNames(prev => [...prev, file.name]);
          };
          reader.readAsDataURL(file);
      });
  };

  // Explicit Context Attachment Button (Manual)
  const attachContext = () => {
      const activeWindow = windows.find(w => w.id === activeWindowId);
      if (activeWindow && activeWindow.context) {
          setAttachments(prev => [...prev, { text: `[System Context: ${activeWindow.title}]\n${activeWindow.context}` }]);
          setAttachmentNames(prev => [...prev, "App Context"]);
      } else {
          fileInputRef.current?.click();
      }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = { 
        role: 'user', 
        content: input,
        attachments: attachmentNames 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachmentNames([]);
    const currentAttachments = [...attachments]; // Capture current state
    setAttachments([]); // Clear for next
    setIsLoading(true);

    const aiMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'ai', content: '' }]);

    // Advanced Context Building
    const activeWindow = windows.find(w => w.id === activeWindowId);
    
    // Explicitly grab context from the active window if it exists
    let explicitContext = "";
    if (activeWindow && activeWindow.context) {
        explicitContext = `\n\n[Active Application Context - ${activeWindow.title}]:\n${activeWindow.context}\n`;
    }

    const openAppsList = windows.map(w => w.title).join(', ');
    
    let systemContext = `SYSTEM STATUS:
    - User: ${currentUser.username}
    - Active Window: ${activeWindow ? `"${activeWindow.title}" (${activeWindow.appId})` : "Desktop"}
    - Running Apps: ${openAppsList || "None"}
    ${explicitContext}
    `;

    // Construct Parts
    const parts: Part[] = [
        { text: systemContext },
        ...currentAttachments,
        { text: userMsg.content }
    ];

    // Configure Gemini based on Mode
    let model = 'gemini-2.5-flash';
    let config: any = {};

    if (mode === 'think') {
        model = 'gemini-3-pro-preview';
        config = {
            thinkingConfig: { thinkingBudget: 32768 } // Max reasoning
        };
    } else if (mode === 'research') {
        model = 'gemini-2.5-flash';
        config = {
            tools: [{ googleSearch: {} }] // Enable Grounding
        };
    }

    let accumulatedText = "";

    await streamGeminiResponse(parts, (chunk) => {
      accumulatedText += chunk;
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[aiMsgIndex]) {
           newMsgs[aiMsgIndex] = { role: 'ai', content: accumulatedText };
        }
        return newMsgs;
      });
    }, { model, config });

    setIsLoading(false);
  };

  if (!isCopilotOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-[#1a1a1a]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-[1000] flex flex-col animate-in slide-in-from-right duration-300 font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#202020] to-[#1a1a1a]">
            <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="text-blue-400" size={20} />
                <span>System Copilot</span>
            </div>
            <button onClick={() => toggleCopilot(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={18} />
            </button>
        </div>

        {/* Mode Selector */}
        <div className="px-4 py-4 border-b border-white/5 bg-[#151515]">
            <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-white/5">
                <button 
                    onClick={() => setMode('balanced')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${mode === 'balanced' ? 'bg-[#222] text-blue-400 shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Bot size={14} /> Balanced
                </button>
                <button 
                    onClick={() => setMode('think')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${mode === 'think' ? 'bg-[#222] text-purple-400 shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <BrainCircuit size={14} /> Think
                </button>
                <button 
                    onClick={() => setMode('research')}
                    className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${mode === 'research' ? 'bg-[#222] text-green-400 shadow-sm border border-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Search size={14} /> Research
                </button>
            </div>
            
            {/* Active Context Indicator */}
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 px-1">
                <Monitor size={10} className="text-blue-500" />
                <span className="truncate">Context: {activeWindowId ? windows.find(w => w.id === activeWindowId)?.title : 'Desktop'}</span>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Attachments Preview */}
                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1 justify-end">
                            {msg.attachments.map((name, idx) => (
                                <div key={idx} className="text-[10px] bg-white/10 px-2 py-1 rounded flex items-center gap-1 text-gray-300">
                                    <Paperclip size={10} /> {name}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex gap-2 max-w-[90%]">
                        <div 
                            className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-[#2a2a2a] text-gray-200 rounded-bl-sm border border-white/5'
                            }`}
                        >
                            {msg.role === 'ai' ? <MarkdownText text={msg.content} /> : msg.content}
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-[#2a2a2a] px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-2 items-center text-xs text-gray-400">
                        {mode === 'think' ? (
                            <>
                                <BrainCircuit size={14} className="animate-pulse text-purple-400"/> Reasoning...
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} className="animate-pulse text-blue-400"/> Thinking...
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#202020]">
            {/* Attachment Staging Area */}
            {attachmentNames.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                    {attachmentNames.map((name, i) => (
                        <div key={i} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded flex items-center gap-2 border border-blue-500/30">
                            <FileText size={10} /> {name}
                            <button onClick={() => {
                                setAttachmentNames(prev => prev.filter((_, idx) => idx !== i));
                                setAttachments(prev => prev.filter((_, idx) => idx !== i));
                            }}><X size={10} /></button>
                        </div>
                    ))}
                </div>
            )}

            <div className="relative group flex items-center gap-2 bg-[#111] border border-[#333] rounded-xl p-2 shadow-inner focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} multiple />
                
                <button 
                    onClick={attachContext}
                    className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${attachmentNames.length > 0 ? 'text-blue-400' : ''}`}
                    title="Attach Context / File"
                >
                    <Paperclip size={18} />
                </button>

                <input
                    ref={inputRef}
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-600 focus:outline-none focus:ring-0"
                    placeholder={mode === 'think' ? "Ask complex question..." : "Message Copilot..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                />
                
                <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:bg-transparent disabled:text-gray-600"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};
