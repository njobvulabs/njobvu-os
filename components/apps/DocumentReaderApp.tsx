import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Printer, ZoomIn, ZoomOut, Search, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Copy, Scissors, Clipboard, Plus, Save, Download, 
  X, Sparkles, Loader2, FilePlus, Share2, Type, Image as ImageIcon,
  Layout as LayoutIcon, Columns, FileSearch, HelpCircle, Settings2,
  Table as TableIcon, Link, StickyNote, List, ListOrdered, Monitor,
  FileDown, BookOpen, Compass, Layers, Smartphone, MoveHorizontal,
  Maximize, Minimize, Type as TextIcon, Palette
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

type RibbonTab = 'File' | 'Home' | 'Insert' | 'Layout' | 'References' | 'AI' | 'View';

export const DocumentReaderApp: React.FC<{ windowId: string; fileId?: string }> = ({ windowId, fileId }) => {
  const { fs, updateFileContent, createFile, addNotification, closeWindow } = useOS();
  
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState('Untitled Document');
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  const [activeTab, setActiveTab] = useState<RibbonTab>('Home');
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileId && fs.nodes[fileId]) {
      const node = fs.nodes[fileId];
      setFileName(node.name);
      setCurrentFileId(fileId);
      const safeContent = node.content || '<p>Start typing...</p>';
      setContent(safeContent);
      if (editorRef.current) editorRef.current.innerHTML = safeContent;
    }
  }, [fileId, fs.nodes]);

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
    editorRef.current?.focus();
  };

  const handleManualSave = () => {
      if (!editorRef.current) return;
      setIsSaving(true);
      const html = editorRef.current.innerHTML;
      if (currentFileId) {
        updateFileContent(currentFileId, html);
        addNotification('Writer', 'Document saved', 'success');
      } else {
          const name = prompt("Filename:", fileName);
          if (name) {
              createFile('root', name, html);
              setFileName(name);
              addNotification('Writer', `Created ${name}`, 'success');
          }
      }
      setTimeout(() => setIsSaving(false), 500);
  };

  const aiAction = (action: 'summarize' | 'polish' | 'expand') => {
      if (!editorRef.current) return;
      setIsAiLoading(true);
      const text = editorRef.current.innerText;
      
      setTimeout(() => {
          if (action === 'summarize') {
              alert("AI Summary:\nThis document outlines the core operational goals and infrastructure vision of Njobvu OS, focusing on user experience and AI integration.");
          } else if (action === 'polish') {
              if(editorRef.current) {
                  editorRef.current.innerHTML = `<div style="color:#2563eb; font-style:italic">[AI Optimized Tone]</div>` + editorRef.current.innerHTML;
              }
          } else {
              execCmd('insertHTML', '<p>Additionally, the modular nature of the kernel allows for rapid deployment of new virtualized services across the cluster...</p>');
          }
          setIsAiLoading(false);
      }, 1500);
  };

  const insertPlaceholder = (type: string) => {
      if (type === 'image') {
          execCmd('insertHTML', '<div style="width:100%; height:200px; background:#f0f0f0; border:2px dashed #ccc; display:flex; align-items:center; justify-content:center; color:#999; margin:10px 0;">[IMAGE PLACEHOLDER]</div>');
      } else if (type === 'table') {
          execCmd('insertHTML', '<table border="1" style="width:100%; border-collapse:collapse;"><tr><td>Header 1</td><td>Header 2</td></tr><tr><td>Data A</td><td>Data B</td></tr></table>');
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] text-gray-800 font-sans overflow-hidden">
      <div className="h-10 bg-white border-b border-gray-300 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded text-white shadow-sm shadow-blue-200"><FileText size={16} /></div>
              <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{fileName}</span>
              <div className="w-[1px] h-4 bg-gray-300 mx-2"></div>
              <div className="flex gap-0.5">
                  <ToolBtn icon={<Undo size={14}/>} onClick={() => execCmd('undo')} />
                  <ToolBtn icon={<Redo size={14}/>} onClick={() => execCmd('redo')} />
                  <ToolBtn icon={<Save size={14} className="text-blue-600"/>} onClick={handleManualSave} />
                  <ToolBtn icon={<Printer size={14}/>} onClick={() => window.print()} />
              </div>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{isSaving ? 'Synching...' : 'Disk Stable'}</span>
              <button className="text-gray-400 hover:text-gray-600"><Settings2 size={16}/></button>
          </div>
      </div>

      <div className="bg-white border-b border-gray-300 flex flex-col z-20 shrink-0 shadow-sm">
          <div className="flex px-2 pt-1 gap-1">
              {(['File', 'Home', 'Insert', 'Layout', 'References', 'AI', 'View'] as RibbonTab[]).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    {tab}
                  </button>
              ))}
          </div>
          <div className="h-28 bg-[#F9F9F9] border-t border-gray-200/50 flex items-center px-4 gap-2 overflow-x-auto no-scrollbar">
              {activeTab === 'File' && <>
                <RibbonGroup label="New"><RibbonBtn icon={<FilePlus size={24}/>} label="Blank Doc" onClick={() => { if(editorRef.current) { editorRef.current.innerHTML = ""; setFileName("Untitled"); setCurrentFileId(null); } }} /></RibbonGroup>
                <RibbonGroup label="Management"><RibbonBtn icon={<Save size={24}/>} label="Save Content" onClick={handleManualSave} /><RibbonBtn icon={<Download size={24}/>} label="Export PDF" onClick={() => window.print()} /><RibbonBtn icon={<Share2 size={24}/>} label="Collab" onClick={() => {}} /></RibbonGroup>
                <RibbonGroup label="Exit"><RibbonBtn icon={<X size={24} className="text-red-500"/>} label="Exit Writer" onClick={() => closeWindow(windowId)} /></RibbonGroup>
              </>}
              {activeTab === 'Home' && <>
                <RibbonGroup label="Clipboard"><RibbonBtn icon={<Copy size={20}/>} label="Copy" onClick={() => execCmd('copy')} /><RibbonBtn icon={<Scissors size={20}/>} label="Cut" onClick={() => execCmd('cut')} /><RibbonBtn icon={<Clipboard size={20}/>} label="Paste" onClick={() => execCmd('paste')} /></RibbonGroup>
                <RibbonGroup label="Font"><div className="flex flex-col gap-2"><div className="flex gap-1"><select className="h-7 border rounded text-xs px-1 w-24"><option>Arial</option><option>Sans</option></select><select className="h-7 border rounded text-xs px-1"><option>11</option><option>12</option></select></div><div className="flex gap-1.5 justify-center"><ToolBtn icon={<Bold size={14}/>} onClick={() => execCmd('bold')} /><ToolBtn icon={<Italic size={14}/>} onClick={() => execCmd('italic')} /><ToolBtn icon={<Underline size={14}/>} onClick={() => execCmd('underline')} /></div></div></RibbonGroup>
                <RibbonGroup label="Alignment"><div className="flex gap-1.5"><ToolBtn icon={<AlignLeft size={16}/>} onClick={() => execCmd('justifyLeft')} /><ToolBtn icon={<AlignCenter size={16}/>} onClick={() => execCmd('justifyCenter')} /><ToolBtn icon={<AlignRight size={16}/>} onClick={() => execCmd('justifyRight')} /><ToolBtn icon={<AlignJustify size={16}/>} onClick={() => execCmd('justifyFull')} /></div></RibbonGroup>
                <RibbonGroup label="Lists"><div className="flex gap-1.5"><ToolBtn icon={<List size={16}/>} onClick={() => execCmd('insertUnorderedList')} /><ToolBtn icon={<ListOrdered size={16}/>} onClick={() => execCmd('insertOrderedList')} /></div></RibbonGroup>
              </>}
              {activeTab === 'Insert' && <>
                <RibbonGroup label="Objects"><RibbonBtn icon={<ImageIcon size={24}/>} label="Image" onClick={() => insertPlaceholder('image')} /><RibbonBtn icon={<TableIcon size={24}/>} label="Table" onClick={() => insertPlaceholder('table')} /></RibbonGroup>
                <RibbonGroup label="Links"><RibbonBtn icon={<Link size={24}/>} label="Hyperlink" onClick={() => {}} /></RibbonGroup>
              </>}
              {activeTab === 'Layout' && <>
                <RibbonGroup label="Page Setup"><RibbonBtn icon={<LayoutIcon size={24}/>} label="Margins" onClick={() => {}} /><RibbonBtn icon={<MoveHorizontal size={24}/>} label="Orientation" onClick={() => {}} /><RibbonBtn icon={<Maximize size={24}/>} label="Size" onClick={() => {}} /></RibbonGroup>
                <RibbonGroup label="Columns"><RibbonBtn icon={<Columns size={24}/>} label="Columns" onClick={() => {}} /></RibbonGroup>
                <RibbonGroup label="Breaks"><RibbonBtn icon={<Plus size={24}/>} label="Page Break" onClick={() => execCmd('insertHTML', '<hr/>')} /></RibbonGroup>
              </>}
              {activeTab === 'References' && <>
                <RibbonGroup label="Table of Contents"><RibbonBtn icon={<List size={24}/>} label="TOC" onClick={() => {}} /></RibbonGroup>
                <RibbonGroup label="Footnotes"><RibbonBtn icon={<FileSearch size={24}/>} label="Footnote" onClick={() => {}} /><RibbonBtn icon={<TextIcon size={24}/>} label="Endnote" onClick={() => {}} /></RibbonGroup>
              </>}
              {activeTab === 'AI' && <>
                <RibbonGroup label="Generative"><button onClick={() => aiAction('expand')} disabled={isAiLoading} className="bg-blue-600 text-white flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-28 shadow-lg hover:bg-blue-700 transition-all">{isAiLoading ? <Loader2 size={24} className="animate-spin"/> : <Sparkles size={24}/>}<span className="text-[8px] font-bold">EXPAND</span></button></RibbonGroup>
                <RibbonGroup label="Edit"><button onClick={() => aiAction('polish')} disabled={isAiLoading} className="bg-slate-800 text-white flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-28 shadow hover:bg-black transition-all">{isAiLoading ? <Loader2 size={24} className="animate-spin"/> : <TextIcon size={24}/>}<span className="text-[8px] font-bold">OPTIMIZE</span></button><button onClick={() => aiAction('summarize')} disabled={isAiLoading} className="bg-purple-600 text-white flex flex-col items-center justify-center gap-1 p-2 rounded-xl w-28 shadow hover:bg-purple-700 transition-all">{isAiLoading ? <Loader2 size={24} className="animate-spin"/> : <Search size={24}/>}<span className="text-[8px] font-bold">SUMMARY</span></button></RibbonGroup>
              </>}
              {activeTab === 'View' && <>
                <RibbonGroup label="Zoom"><div className="flex items-center gap-4"><button onClick={() => setZoom(z => Math.max(25, z-10))} className="p-1.5 hover:bg-gray-200 rounded border border-gray-300"><ZoomOut size={18}/></button><span className="text-xs font-bold w-12 text-center bg-white border border-gray-300 py-1 rounded">{zoom}%</span><button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-1.5 hover:bg-gray-200 rounded border border-gray-300"><ZoomIn size={18}/></button></div></RibbonGroup>
              </>}
          </div>
      </div>

      <div className="flex-1 flex justify-center bg-[#e2e2e2] overflow-auto p-10 custom-scrollbar">
          <div ref={editorRef} className="bg-white shadow-[0_10px_50px_rgba(0,0,0,0.1)] min-h-[1056px] w-[816px] p-24 outline-none cursor-text transition-transform origin-top shrink-0 relative leading-relaxed prose prose-slate max-w-none" style={{ transform: `scale(${zoom / 100})` }} contentEditable suppressContentEditableWarning />
      </div>

      <div className="h-6 bg-white border-t border-gray-300 flex items-center justify-between px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">
          <div className="flex gap-4"><span>{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length} Words</span><span>Writer Pro v4.0</span></div>
          <div className="flex gap-4 items-center"><span className="flex items-center gap-1.5"><Monitor size={10}/> Protocol Valid</span><span className="text-blue-600">Stable</span></div>
      </div>
    </div>
  );
};

const RibbonGroup = ({ label, children }: any) => (<div className="flex flex-col items-center px-4 h-full justify-between py-2 border-r border-gray-200/60 min-w-max last:border-r-0"><div className="flex items-center gap-4 flex-1">{children}</div><span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{label}</span></div>);
const RibbonBtn = ({ icon, label, onClick, className }: any) => (<button onClick={onClick} className={`flex flex-col items-center justify-center p-1 rounded-xl hover:bg-blue-50 transition-all group active:scale-95 min-w-[70px] ${className}`}><div className="group-hover:scale-110 transition-transform text-gray-600 group-hover:text-blue-600">{icon}</div><span className="text-[9px] font-bold uppercase tracking-tighter text-gray-500 group-hover:text-gray-800 mt-1">{label}</span></button>);
const ToolBtn = ({ icon, active, onClick, className }: any) => (<button onClick={onClick} className={`p-1.5 rounded transition-all flex items-center justify-center border border-transparent ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:border-gray-200'} ${className}`}>{icon}</button>);
