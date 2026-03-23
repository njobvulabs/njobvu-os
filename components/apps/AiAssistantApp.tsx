import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, BrainCircuit, Search, Sparkles, Paperclip, 
  X, Loader2, Mic, MicOff, Plus, MessageSquare, 
  Trash2, FileText, Terminal, Play, RotateCcw
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { streamGeminiResponse, Part } from '../../services/geminiService';
import { AppId } from '../../types';

interface Message {
  role: 'user' | 'ai';
  content: string;
  attachments?: string[];
  isCommand?: boolean;
}

interface ChatTab {
  id: string;
  title: string;
  messages: Message[];
  mode: 'balanced' | 'think' | 'research';
}

const SUGGESTIONS = [
  "What's in my Documents folder?",
  "Analyze README.txt",
  "How much RAM is free?",
  "Open Terminal and run neofetch",
];

export const AiAssistantApp: React.FC<{ windowId: string }> = () => {
  const { fs, addNotification } = useOS();
  const [tabs, setTabs] = useState<ChatTab[]>(() => {
    const saved = localStorage.getItem('njobvu_ai_chats');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'New Chat', messages: [{ role: 'ai', content: 'Hello! I am Njobvu AI. How can I help you today?' }], mode: 'balanced' }
    ];
  });
  const [activeTabId, setActiveTabId] = useState('1');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [attachments, setAttachments] = useState<Part[]>([]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    localStorage.setItem('njobvu_ai_chats', JSON.stringify(tabs));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tabs]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onresult = (event: any) => {
        setInput(prev => prev + event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && attachments.length === 0) || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend, attachments: attachmentNames };
    if (textToSend.startsWith('/run ')) userMsg.isCommand = true;

    const updatedMessages = [...activeTab.messages, userMsg];
    const currentActiveId = activeTabId;

    setTabs(prev => prev.map(t => t.id === currentActiveId ? { ...t, messages: updatedMessages } : t));
    
    const parts: Part[] = [...attachments, { text: textToSend }];
    setInput('');
    setAttachments([]);
    setAttachmentNames([]);
    setIsLoading(true);

    const aiMsgIndex = updatedMessages.length;
    let accumulatedText = "";

    setTabs(prev => prev.map(t => t.id === currentActiveId ? { ...t, messages: [...updatedMessages, { role: 'ai', content: '' }] } : t));

    await streamGeminiResponse(parts, (chunk) => {
      accumulatedText += chunk;
      setTabs(prev => prev.map(t => t.id === currentActiveId ? { 
        ...t, 
        messages: t.messages.map((m, idx) => idx === aiMsgIndex ? { ...m, content: accumulatedText } : m)
      } : t));
    }, { 
      model: activeTab.mode === 'think' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash'
    });

    setIsLoading(false);
  };

  const clearChat = () => {
      if (confirm('Clear this chat?')) {
          setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, messages: [{ role: 'ai', content: 'Chat history cleared. How can I help?' }] } : t));
      }
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-gray-200 overflow-hidden font-sans">
      <div className="w-16 md:w-56 bg-[#181818] border-r border-[#333] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#333] space-y-2">
              <button onClick={() => { const id = Math.random().toString(36).substr(2,9); setTabs([...tabs, { id, title: 'New Chat', messages: [{ role: 'ai', content: 'New session started.' }], mode: 'balanced' }]); setActiveTabId(id); }} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center gap-2 text-xs font-bold shadow-lg uppercase tracking-widest"><Plus size={16}/> New</button>
              <button onClick={clearChat} className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><RotateCcw size={12}/> Clear Session</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {tabs.map(tab => (
                  <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`group p-2.5 rounded-lg flex items-center justify-between cursor-pointer ${activeTabId === tab.id ? 'bg-[#333] text-white border border-white/5 shadow-inner' : 'hover:bg-[#252525] text-gray-500'}`}>
                      <div className="flex items-center gap-2 truncate text-xs"><MessageSquare size={14}/> <span className="truncate">{tab.title}</span></div>
                      {tabs.length > 1 && <button onClick={(e) => { e.stopPropagation(); setTabs(tabs.filter(x => x.id !== tab.id)); if(activeTabId === tab.id) setActiveTabId(tabs[0].id); }} className="opacity-0 group-hover:opacity-100 hover:text-red-400"><Trash2 size={12}/></button>}
                  </div>
              ))}
          </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#1e1e1e]">
        <div className="p-2 border-b border-[#333] bg-[#222] flex items-center justify-between">
            <div className="flex gap-1">
                {(['balanced', 'think', 'research'] as const).map(m => (
                    <button key={m} onClick={() => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, mode: m } : t))} className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${activeTab.mode === m ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-[#333] text-gray-500'}`}>{m}</button>
                ))}
            </div>
            <div className="flex gap-1">
                <button onClick={() => { const id = prompt("File ID:"); if(id) setAttachmentNames([...attachmentNames, fs.nodes[id]?.name || id]); }} className="p-1.5 hover:bg-white/10 rounded text-gray-400"><FileText size={18}/></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar" ref={scrollRef}>
          {activeTab.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'ai' ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-blue-600'}`}>{msg.role === 'ai' ? <Sparkles size={16} className="text-blue-400" /> : <User size={18} />}</div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#2a2a2a] text-gray-100 border border-white/5'}`}>
                      {msg.isCommand && <div className="text-[10px] font-black text-blue-200 uppercase mb-1 opacity-50 flex items-center gap-1"><Play size={10}/> RUN COMMAND</div>}
                      {msg.content}
                  </div>
              </div>
            </div>
          ))}
          {!isLoading && activeTab.messages.length < 3 && (
              <div className="flex flex-wrap gap-2 px-10">
                  {SUGGESTIONS.map(s => <button key={s} onClick={() => handleSend(s)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-xs px-3 py-1.5 rounded-full transition-all">"{s}"</button>)}
              </div>
          )}
          {isLoading && <div className="flex justify-start ml-11"><div className="bg-[#2a2a2a] p-3 rounded-2xl text-xs text-gray-400 flex items-center gap-3 border border-white/5"><Loader2 size={16} className="animate-spin text-blue-500" /><span className="font-bold uppercase tracking-widest">Processing...</span></div></div>}
        </div>
        
        <div className="p-4 bg-[#222] border-t border-[#333]">
          <div className="flex gap-3 bg-[#181818] p-1.5 rounded-2xl border border-[#333] shadow-inner focus-within:border-blue-500/50">
              <input className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-white placeholder-gray-600 outline-none" placeholder="Message AI Assistant..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={isLoading} />
              <button onClick={() => { if(isListening) recognitionRef.current?.stop(); else { setIsListening(true); recognitionRef.current?.start(); } }} className={`p-3 rounded-xl ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}><Mic size={20}/></button>
              <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all shadow-lg"><Send size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
