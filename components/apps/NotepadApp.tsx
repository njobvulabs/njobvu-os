
import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Save, FileText, Type, WrapText, Undo, Redo, Search, X, ChevronDown, FolderOpen, FilePlus, Copy, Scissors, Clipboard, ZoomIn, ZoomOut, List, CheckSquare } from 'lucide-react';
import { FSNode } from '../../types';

export const NotepadApp: React.FC<{ windowId: string; fileId?: string }> = ({ windowId, fileId }) => {
  const { addNotification, fs, updateFileContent, createFile, closeWindow, theme, updateWindowContext } = useOS();
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled');
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  
  // Theme helpers
  const isDark = theme.mode === 'dark';
  const colors = {
    bg: isDark ? 'bg-[#1e1e1e]' : 'bg-[#fcfcfc]',
    text: isDark ? 'text-gray-200' : 'text-[#2e3436]',
    barBg: isDark ? 'bg-[#252525]' : 'bg-[#e8e8e7]',
    barBorder: isDark ? 'border-[#3c3c3c]' : 'border-[#c8c8c7]',
    toolBg: isDark ? 'bg-[#2b2b2b]' : 'bg-[#f6f6f6]',
    toolBorder: isDark ? 'border-[#3c3c3c]' : 'border-[#dcdcdc]',
    editorBg: isDark ? 'bg-[#1a1a1a]' : 'bg-white',
    editorText: isDark ? 'text-gray-300' : 'text-[#2e3436]',
    gutterBg: isDark ? 'bg-[#202020] border-[#3c3c3c] text-gray-500' : 'bg-[#f0f0f0] border-[#dcdcdc] text-gray-400',
    menuHover: isDark ? 'hover:bg-[#3c3c3c]' : 'hover:bg-[#cfcfcf]',
    menuActive: isDark ? 'bg-[#3c3c3c]' : 'bg-[#cfcfcf]',
    dropdownBg: isDark ? 'bg-[#2b2b2b] border-[#3c3c3c] text-gray-200' : 'bg-white border-gray-300 text-gray-800',
    dropdownHover: isDark ? 'hover:bg-[#4a90d9] hover:text-white' : 'hover:bg-[#4a90d9] hover:text-white',
  };

  // Menu State
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Undo/Redo State
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  // Style States
  const [fontSize, setFontSize] = useState(13);
  const [wordWrap, setWordWrap] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  // Cursor State
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [findText, setFindText] = useState('');
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // AI Context Update
  useEffect(() => {
      const timeout = setTimeout(() => {
          updateWindowContext(windowId, `Editing File: ${fileName}\n\nContent Preview:\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}`);
      }, 1000);
      return () => clearTimeout(timeout);
  }, [content, fileName, windowId, updateWindowContext]);

  // Load file content if opened from File Manager
  useEffect(() => {
    if (fileId && fs.nodes[fileId]) {
        const node = fs.nodes[fileId];
        setContent(node.content || '');
        setFileName(node.name);
        setCurrentFileId(fileId);
        setHistory([node.content || '']);
    }
  }, [fileId, fs.nodes]);

  // Sync scroll between text area and line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
      }
  };

  // Update Cursor Position for Status Bar
  const handleKeyUpMouse = (e: any) => {
      if (textAreaRef.current) {
          const val = textAreaRef.current.value;
          const sel = textAreaRef.current.selectionStart;
          const line = val.substr(0, sel).split("\n").length;
          const col = sel - val.lastIndexOf("\n", sel - 1);
          setCursorPos({ line, col });
      }
  };

  // History Management
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     const newContent = e.target.value;
     setContent(newContent);
     
     if (!isUndoRedoRef.current) {
         const newHistory = history.slice(0, historyIndex + 1);
         newHistory.push(newContent);
         if (newHistory.length > 50) newHistory.shift();
         setHistory(newHistory);
         setHistoryIndex(newHistory.length - 1);
     }
     isUndoRedoRef.current = false;
  };

  const undo = () => {
     if (historyIndex > 0) {
        isUndoRedoRef.current = true;
        const prev = history[historyIndex - 1];
        setContent(prev);
        setHistoryIndex(historyIndex - 1);
     }
  };

  const redo = () => {
     if (historyIndex < history.length - 1) {
        isUndoRedoRef.current = true;
        const next = history[historyIndex + 1];
        setContent(next);
        setHistoryIndex(historyIndex + 1);
     }
  };

  const handleSave = () => {
    setActiveMenu(null);
    if (currentFileId) {
        updateFileContent(currentFileId, content);
        addNotification('Notepad', `Saved ${fileName}`, 'success');
    } else {
        const name = prompt("Save file as:", fileName);
        if (name) {
            const guestHome = (Object.values(fs.nodes) as FSNode[]).find(n => n.name === 'guest');
            if (guestHome) {
                createFile(guestHome.id, name, content);
                setFileName(name);
                addNotification('Notepad', `Saved ${name}`, 'success');
            }
        }
    }
  };

  const handleNew = () => {
      setContent('');
      setFileName('Untitled');
      setCurrentFileId(null);
      setHistory(['']);
      setHistoryIndex(0);
      setActiveMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const execCommand = async (cmd: string) => {
      setContextMenu(null);
      if (!textAreaRef.current) return;
      
      switch(cmd) {
          case 'cut':
              // Simulate Cut: Copy selection then remove it
              const start = textAreaRef.current.selectionStart;
              const end = textAreaRef.current.selectionEnd;
              const textToCut = content.substring(start, end);
              if (textToCut) {
                  try {
                      await navigator.clipboard.writeText(textToCut);
                      const newContent = content.substring(0, start) + content.substring(end);
                      setContent(newContent); // Need to trigger undo history update ideally
                  } catch (e) {
                      addNotification('Clipboard', 'Permission denied', 'error');
                  }
              }
              break;
          case 'copy':
              const textToCopy = content.substring(textAreaRef.current.selectionStart, textAreaRef.current.selectionEnd);
              if (textToCopy) {
                  try {
                      await navigator.clipboard.writeText(textToCopy);
                  } catch (e) {
                      addNotification('Clipboard', 'Permission denied', 'error');
                  }
              }
              break;
          case 'paste':
              try {
                  const textToPaste = await navigator.clipboard.readText();
                  if (textToPaste) {
                      const start = textAreaRef.current.selectionStart;
                      const end = textAreaRef.current.selectionEnd;
                      const newContent = content.substring(0, start) + textToPaste + content.substring(end);
                      setContent(newContent);
                  }
              } catch (e) {
                  addNotification('Clipboard', 'Permission denied for reading clipboard. Use Ctrl+V', 'warning');
              }
              break;
          case 'select_all':
              textAreaRef.current.select();
              break;
      }
      textAreaRef.current.focus();
  };

  const menus = {
      File: [
          { label: 'New', icon: <FilePlus size={14}/>, action: handleNew },
          { label: 'Open...', icon: <FolderOpen size={14}/>, action: () => { setActiveMenu(null); addNotification('Notepad', 'Please use File Manager to open files', 'info'); } },
          { label: 'Save', icon: <Save size={14}/>, action: handleSave },
          { separator: true },
          { label: 'Close', icon: <X size={14}/>, action: () => closeWindow(windowId) }
      ],
      Edit: [
          { label: 'Undo', icon: <Undo size={14}/>, action: () => { undo(); setActiveMenu(null); } },
          { label: 'Redo', icon: <Redo size={14}/>, action: () => { redo(); setActiveMenu(null); } },
          { separator: true },
          { label: 'Find...', icon: <Search size={14}/>, action: () => { setShowSearch(true); setActiveMenu(null); } }
      ],
      View: [
          { label: `Word Wrap: ${wordWrap ? 'On' : 'Off'}`, icon: <WrapText size={14}/>, action: () => { setWordWrap(!wordWrap); setActiveMenu(null); } },
          { label: `Line Numbers: ${showLineNumbers ? 'On' : 'Off'}`, icon: <List size={14}/>, action: () => { setShowLineNumbers(!showLineNumbers); setActiveMenu(null); } },
          { separator: true },
          { label: 'Zoom In', icon: <ZoomIn size={14}/>, action: () => { setFontSize(s => Math.min(s + 2, 32)); setActiveMenu(null); } },
          { label: 'Zoom Out', icon: <ZoomOut size={14}/>, action: () => { setFontSize(s => Math.max(s - 2, 8)); setActiveMenu(null); } },
      ],
      Document: [
          { label: 'Word Count', icon: <FileText size={14}/>, action: () => { alert(`Words: ${content.split(/\s+/).filter(w => w).length}\nLines: ${content.split('\n').length}`); setActiveMenu(null); } }
      ]
  };

  const lineCount = content.split('\n').length;

  return (
    <div className={`flex flex-col h-full ${colors.bg} ${colors.text} font-sans`} onClick={() => { setActiveMenu(null); setContextMenu(null); }}>
      {/* Menu Bar (XFCE Style) */}
      <div className={`flex items-center gap-1 px-1 py-0.5 ${colors.barBg} border-b ${colors.barBorder} text-sm select-none relative z-20`}>
        {Object.entries(menus).map(([name, items]) => (
            <div key={name} className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === name ? null : name); }}
                    className={`px-2 py-1 rounded-sm transition-colors focus:outline-none ${activeMenu === name ? colors.menuActive : colors.menuHover}`}
                >
                    {name}
                </button>
                {activeMenu === name && (
                    <div className={`absolute top-full left-0 w-48 shadow-xl rounded-sm border py-1 ${colors.dropdownBg}`}>
                        {items.map((item, i) => (
                            item.separator ? (
                                <div key={i} className={`h-[1px] my-1 ${isDark ? 'bg-[#3c3c3c]' : 'bg-gray-200'}`}></div>
                            ) : (
                                <button 
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); item.action && item.action(); }}
                                    className={`w-full text-left px-4 py-2 flex items-center gap-2 ${colors.dropdownHover}`}
                                >
                                    <span className="opacity-70">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            )
                        ))}
                    </div>
                )}
            </div>
        ))}
      </div>
      
      {/* Toolbar */}
      <div className={`flex items-center gap-1 px-1 py-1 ${colors.toolBg} border-b ${colors.toolBorder}`}>
         <ToolButton icon={<FilePlus size={16} />} title="New" onClick={handleNew} isDark={isDark} />
         <ToolButton icon={<FolderOpen size={16} />} title="Open" isDark={isDark} onClick={() => addNotification('Notepad', 'Use File Manager', 'info')} />
         <ToolButton icon={<Save size={16} />} title="Save" onClick={handleSave} isDark={isDark} />
         <div className={`w-[1px] h-5 ${isDark ? 'bg-[#3c3c3c]' : 'bg-[#dcdcdc]'} mx-1`}></div>
         <ToolButton icon={<Undo size={16} />} title="Undo" onClick={undo} disabled={historyIndex === 0} isDark={isDark} />
         <ToolButton icon={<Redo size={16} />} title="Redo" onClick={redo} disabled={historyIndex === history.length - 1} isDark={isDark} />
         <div className={`w-[1px] h-5 ${isDark ? 'bg-[#3c3c3c]' : 'bg-[#dcdcdc]'} mx-1`}></div>
         <ToolButton icon={<Scissors size={16} />} title="Cut" isDark={isDark} />
         <ToolButton icon={<Copy size={16} />} title="Copy" isDark={isDark} />
         <ToolButton icon={<Clipboard size={16} />} title="Paste" isDark={isDark} />
         <div className={`w-[1px] h-5 ${isDark ? 'bg-[#3c3c3c]' : 'bg-[#dcdcdc]'} mx-1`}></div>
         <ToolButton icon={<Search size={16} />} title="Find" onClick={() => setShowSearch(!showSearch)} isDark={isDark} />
         <div className={`w-[1px] h-5 ${isDark ? 'bg-[#3c3c3c]' : 'bg-[#dcdcdc]'} mx-1`}></div>
         <ToolButton icon={<Type size={16} />} title="Font Size" onClick={() => setFontSize(s => s === 13 ? 16 : 13)} isDark={isDark} />
         <ToolButton icon={<WrapText size={16} />} title="Word Wrap" active={wordWrap} onClick={() => setWordWrap(!wordWrap)} isDark={isDark} />
      </div>

      {/* Find Bar */}
      {showSearch && (
         <div className={`${isDark ? 'bg-[#252525] border-[#3c3c3c]' : 'bg-[#f0f0f0] border-[#dcdcdc]'} p-2 border-b text-sm flex items-center gap-2 animate-in slide-in-from-top-1`}>
             <span className="font-bold text-xs uppercase opacity-70">Find:</span>
             <input 
                className={`border px-2 py-0.5 rounded-sm outline-none focus:border-blue-500 ${isDark ? 'bg-[#1a1a1a] border-[#3c3c3c] text-white' : 'bg-white border-gray-400 text-black'}`}
                value={findText} 
                onChange={e => setFindText(e.target.value)} 
                autoFocus 
             />
             <button className={`px-2 py-0.5 border rounded-sm ${isDark ? 'bg-[#333] border-[#444] hover:bg-[#444]' : 'bg-gray-200 border-gray-400 hover:bg-gray-300'}`}><ChevronDown size={14}/></button>
             <button onClick={() => setShowSearch(false)} className="ml-auto hover:opacity-70 p-1 rounded"><X size={14}/></button>
         </div>
      )}

      {/* Editor Area */}
      <div className={`flex-1 flex overflow-hidden relative ${colors.editorBg}`}>
          {/* Line Numbers */}
          {showLineNumbers && (
              <div 
                ref={lineNumbersRef}
                className={`w-10 border-r text-right py-1 pr-1 select-none font-mono overflow-hidden ${colors.gutterBg}`}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
              >
                  {Array.from({length: Math.max(lineCount, 20)}).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                  ))}
              </div>
          )}
          
          <textarea
            ref={textAreaRef}
            className={`flex-1 w-full h-full p-1 resize-none outline-none font-mono leading-[1.5] selection:bg-[#b0c4de] bg-transparent ${colors.editorText}`}
            style={{ fontSize: `${fontSize}px`, whiteSpace: wordWrap ? 'pre-wrap' : 'pre' }}
            value={content}
            onChange={handleContentChange}
            onScroll={handleScroll}
            onKeyUp={handleKeyUpMouse}
            onMouseUp={handleKeyUpMouse}
            onContextMenu={handleContextMenu}
            spellCheck={false}
          />
      </div>
      
      {/* Status Bar */}
      <div className={`px-2 py-0.5 ${colors.barBg} border-t ${colors.barBorder} text-xs opacity-80 flex justify-between select-none font-sans`}>
        <div className="flex gap-4">
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
            <span>{fileName}</span>
        </div>
        <div className="flex gap-4">
           <span>{wordWrap ? 'Wrap' : 'No Wrap'}</span>
           <span>UTF-8</span>
           <span>Text File</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
          <>
            <div className="fixed inset-0 z-[99998]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}></div>
            <div 
                className={`fixed z-[99999] w-48 ${colors.dropdownBg} border shadow-xl rounded-sm py-1 text-sm animate-in fade-in duration-75`}
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('undo')}>
                    <Undo size={16} /> Undo
                </button>
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('redo')}>
                    <Redo size={16} /> Redo
                </button>
                <div className={`h-[1px] my-1 ${isDark ? 'bg-[#3c3c3c]' : 'bg-gray-200'}`}></div>
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('cut')}>
                    <Scissors size={16} /> Cut
                </button>
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('copy')}>
                    <Copy size={16} /> Copy
                </button>
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('paste')}>
                    <Clipboard size={16} /> Paste
                </button>
                <div className={`h-[1px] my-1 ${isDark ? 'bg-[#3c3c3c]' : 'bg-gray-200'}`}></div>
                <button className={`w-full text-left px-4 py-2 ${colors.dropdownHover} flex items-center gap-3`} onClick={() => execCommand('select_all')}>
                    <CheckSquare size={16} /> Select All
                </button>
            </div>
          </>
      )}
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ReactNode; title: string; onClick?: () => void; disabled?: boolean; active?: boolean; isDark: boolean }> = ({ icon, title, onClick, disabled, active, isDark }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded-sm transition-colors border border-transparent 
            ${disabled ? 'opacity-30 cursor-default' : isDark ? 'hover:bg-[#3c3c3c] active:bg-[#2b2b2b]' : 'hover:bg-[#e0e0e0] hover:border-[#dcdcdc] active:bg-[#d0d0d0]'}
            ${active ? (isDark ? 'bg-[#3c3c3c] border-[#444]' : 'bg-[#d0d0d0] border-[#b0b0b0] shadow-inner') : ''}
        `}
    >
        {icon}
    </button>
);
