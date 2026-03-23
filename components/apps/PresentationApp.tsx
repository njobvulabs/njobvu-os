import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation, Plus, Trash2, Save, Play, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Type, 
  Monitor, Palette, X, Sparkles, ZoomIn, ZoomOut, FilePlus, Printer,
  Layers, Zap, Bold, Italic, Underline, Square, Circle, ArrowRight, MousePointer,
  Maximize2, List, Settings2, Eye, Layout as LayoutIcon, Wand2, Loader2, PlayCircle, Clock,
  Database, Table, MoveHorizontal, Maximize
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface Slide {
  id: string;
  title: string;
  content: string;
  background: string;
  textColor: string;
  transition: 'none' | 'fade' | 'push' | 'wipe';
  transitionSpeed: 'fast' | 'normal' | 'slow';
  animateElements: boolean;
}

const TEMPLATES = [
  { name: 'Professional White', bg: '#ffffff', text: '#1a1a1a', accent: '#EB5D12' },
  { name: 'Dark Executive', bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8' },
  { name: 'Njobvu Premium', bg: '#111', text: '#fef3c7', accent: '#EB5D12' },
  { name: 'Modern Sky', bg: 'linear-gradient(to bottom right, #4f46e5, #9333ea)', text: '#ffffff', accent: '#ffffff' },
];

type TabId = 'File' | 'Home' | 'Insert' | 'Layout' | 'Design' | 'Transitions' | 'Animation' | 'Data' | 'AI' | 'View';

export const PresentationApp: React.FC<{ windowId: string; fileId?: string }> = ({ windowId, fileId }) => {
  const { fs, updateFileContent, createFile, addNotification, theme, closeWindow } = useOS();
  
  const [slides, setSlides] = useState<Slide[]>([{ 
    id: '1', title: 'Presentation Title', content: 'Double click to edit subtitle.', 
    background: '#ffffff', textColor: '#1a1a1a', transition: 'fade', transitionSpeed: 'normal', animateElements: true 
  }]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fileName, setFileName] = useState('New Presentation');
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  const [activeTab, setActiveTab] = useState<TabId>('Home');
  const [isPreview, setIsPreview] = useState(false);
  const [zoom, setZoom] = useState(70);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (fileId && fs.nodes[fileId]) {
      try {
        const parsed = JSON.parse(fs.nodes[fileId].content || '[]');
        if (parsed.length > 0) {
          setSlides(parsed);
          setFileName(fs.nodes[fileId].name);
        }
      } catch (e) { console.error("Load failed", e); }
    }
  }, [fileId, fs.nodes]);

  const addSlide = () => {
    const last = slides[currentIndex];
    setSlides([...slides, { 
      id: Math.random().toString(36).substr(2, 9), title: 'New Slide', content: 'Add bullet points...', 
      background: last.background, textColor: last.textColor, transition: last.transition, transitionSpeed: last.transitionSpeed, animateElements: last.animateElements 
    }]);
    setCurrentIndex(slides.length);
  };

  const updateCurrentSlide = (updates: Partial<Slide>) => {
    const ns = [...slides];
    ns[currentIndex] = { ...ns[currentIndex], ...updates };
    setSlides(ns);
  };

  const handleSave = () => {
    setIsSaving(true);
    const content = JSON.stringify(slides);
    if (currentFileId) {
      updateFileContent(currentFileId, content);
      addNotification('Slides', 'Deck Saved', 'success');
    } else {
        const n = prompt("Deck Name:", fileName);
        if (n) {
            createFile('root', n.endsWith('.nppt') ? n : n + '.nppt', content);
            setFileName(n);
        }
    }
    setTimeout(() => setIsSaving(false), 600);
  };

  const aiGenerate = () => {
      const topic = prompt("Enter topic for AI content generation:");
      if (!topic) return;
      setIsGenerating(true);
      setTimeout(() => {
          updateCurrentSlide({
              title: topic.toUpperCase(),
              content: `1. Core Analysis of ${topic}\n2. Strategic Implementation Roadmap\n3. Future Outlook and Scalability\n4. Key Performance Indicators`
          });
          setIsGenerating(false);
          addNotification('AI Slides', 'Content generated', 'success');
      }, 1500);
  };

  const activeSlide = slides[currentIndex];

  if (isPreview) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black flex flex-col group/show overflow-hidden select-none animate-in fade-in duration-700">
        <button onClick={() => setIsPreview(false)} className="absolute top-8 right-8 z-[10001] p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all active:scale-95"><X size={28} strokeWidth={3} /></button>
        <div className="flex-1 flex items-center justify-center p-12">
          <div key={activeSlide.id} className="w-full h-full max-w-7xl aspect-video shadow-[0_0_100px_rgba(0,0,0,0.5)] p-24 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000 relative rounded-md" style={{ background: activeSlide.background, color: activeSlide.textColor }}>
            <h1 className={`text-8xl font-black mb-14 tracking-tight drop-shadow-sm ${activeSlide.animateElements ? 'animate-in slide-in-from-top-12 duration-1000' : ''}`}>{activeSlide.title}</h1>
            <div className="w-40 h-1 bg-current opacity-10 mx-auto mb-14 rounded-full"></div>
            <p className={`text-4xl opacity-80 whitespace-pre-wrap leading-relaxed max-w-5xl ${activeSlide.animateElements ? 'animate-in slide-in-from-bottom-12 duration-1000 delay-500' : ''}`}>{activeSlide.content}</p>
          </div>
        </div>
        <div className="h-20 bg-black/50 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between px-16 text-white z-10 translate-y-24 group-hover/show:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-10 font-black uppercase text-[11px] tracking-[0.4em] opacity-50"><span className="text-orange-500">NJOBVU SHOWCASE</span><span>SLIDE {currentIndex + 1} / {slides.length}</span></div>
          <div className="flex gap-20 items-center">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="p-4 hover:bg-white/10 rounded-full transition-all hover:scale-125 disabled:opacity-5" disabled={currentIndex === 0}><ChevronLeft size={64} strokeWidth={1} /></button>
            <button onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))} className="p-4 hover:bg-white/10 rounded-full transition-all hover:scale-125 disabled:opacity-5" disabled={currentIndex === slides.length - 1}><ChevronRight size={64} strokeWidth={1} /></button>
          </div>
          <button onClick={() => setIsPreview(false)} className="px-8 py-2 bg-white/10 border border-white/20 rounded-full font-bold hover:bg-red-600 transition-all">EXIT SHOW</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] text-gray-800 font-sans overflow-hidden">
      <div className="h-10 bg-white border-b border-gray-300 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-3">
              <div className="bg-[#EB5D12] p-1.5 rounded text-white shadow-sm shadow-orange-200"><Presentation size={16} /></div>
              <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{fileName}</span>
              <div className="w-[1px] h-4 bg-gray-300 mx-2"></div>
              <div className="flex gap-0.5">
                  <ToolBtn icon={<Save size={14} className="text-orange-600"/>} onClick={handleSave} />
                  <ToolBtn icon={<Printer size={14}/>} onClick={() => window.print()} />
              </div>
          </div>
          <div className="flex items-center gap-4">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{isSaving ? 'Synching...' : 'Disk Stable'}</span>
          </div>
      </div>

      <div className="bg-white border-b border-gray-300 flex flex-col z-20 shrink-0 shadow-sm">
          <div className="flex px-2 pt-1 gap-1">
              {(['File', 'Home', 'Insert', 'Layout', 'Design', 'Transitions', 'Animation', 'Data', 'AI', 'View'] as TabId[]).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#EB5D12] border-b-2 border-[#EB5D12] bg-orange-50/30' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    {tab}
                  </button>
              ))}
          </div>
          
          <div className="h-28 bg-[#F9F9F9] border-t border-gray-200 flex items-center px-4 gap-2 overflow-x-auto no-scrollbar">
              {activeTab === 'File' && <>
                <RibbonGroup label="Presentation"><RibbonBtn icon={<FilePlus size={24}/>} label="New Deck" onClick={() => setSlides([{ id:'1', title:'Title', content:'Subtitle', background:'#FFF', textColor:'#1a1a1a', transition:'fade', transitionSpeed:'normal', animateElements:true }])} /><RibbonBtn icon={<Save size={24}/>} label="Snapshot" onClick={handleSave} /></RibbonGroup>
                <RibbonGroup label="System"><RibbonBtn icon={<X size={24} className="text-red-500"/>} label="Exit Slides" onClick={() => closeWindow(windowId)} /></RibbonGroup>
              </>}
              {activeTab === 'Home' && <>
                <RibbonGroup label="Manage"><RibbonBtn icon={<Plus size={24} className="text-[#EB5D12]"/>} label="New Slide" onClick={addSlide} /><RibbonBtn icon={<Trash2 size={24}/>} label="Delete" onClick={() => slides.length > 1 && setSlides(slides.filter((_, i) => i !== currentIndex))} /></RibbonGroup>
                <RibbonGroup label="Show"><button onClick={() => setIsPreview(true)} className="bg-[#EB5D12] text-white flex flex-col items-center justify-center gap-1 p-3 rounded-xl w-24 shadow-lg hover:bg-[#D14F0F] active:scale-95 transition-all"><PlayCircle size={28}/><span className="text-[9px] font-black">PLAY</span></button></RibbonGroup>
                <RibbonGroup label="Font"><div className="flex flex-col gap-2"><div className="flex gap-1.5 justify-center"><ToolBtn icon={<Bold size={14}/>}/><ToolBtn icon={<Italic size={14}/>}/><ToolBtn icon={<Underline size={14}/>}/></div></div></RibbonGroup>
              </>}
              {activeTab === 'Insert' && <>
                <RibbonGroup label="Media"><RibbonBtn icon={<ImageIcon size={24}/>} label="Graphic" onClick={() => updateCurrentSlide({ content: activeSlide.content + '\n[Gfx Placeholder]' })} /><RibbonBtn icon={<Square size={24}/>} label="Shape" onClick={() => updateCurrentSlide({ content: activeSlide.content + '\n[Rectangle Shape]' })} /><RibbonBtn icon={<Type size={24}/>} label="Text Box" onClick={() => updateCurrentSlide({ content: activeSlide.content + '\n[New Text Element]' })} /></RibbonGroup>
              </>}
              {activeTab === 'Layout' && <>
                <RibbonGroup label="Slide Setup"><RibbonBtn icon={<LayoutIcon size={24}/>} label="Layout" onClick={() => {}} /><RibbonBtn icon={<MoveHorizontal size={24}/>} label="Margins" onClick={() => {}} /><RibbonBtn icon={<Maximize size={24}/>} label="Size" onClick={() => {}} /></RibbonGroup>
              </>}
              {activeTab === 'Design' && <>
                <RibbonGroup label="Themes"><div className="flex gap-3">{TEMPLATES.map(tpl => (<div key={tpl.name} onClick={() => setSlides(prev => prev.map(s => ({ ...s, background: tpl.bg, textColor: tpl.text })))} className="w-20 h-14 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden relative" style={{ background: tpl.bg }}><div className="absolute bottom-0 h-2 w-full" style={{ background: tpl.accent }}></div></div>))}</div></RibbonGroup>
              </>}
              {activeTab === 'Transitions' && <>
                <RibbonGroup label="Motion"><div className="flex gap-2">{(['none', 'fade', 'push', 'wipe'] as const).map(t => (<button key={t} onClick={() => updateCurrentSlide({ transition: t })} className={`px-4 py-1.5 border rounded text-[10px] font-bold uppercase ${activeSlide.transition === t ? 'bg-[#EB5D12] text-white' : 'bg-white'}`}>{t}</button>))}</div></RibbonGroup>
              </>}
              {activeTab === 'Animation' && <>
                <RibbonGroup label="Entrance"><label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase cursor-pointer"><input type="checkbox" checked={activeSlide.animateElements} onChange={e => updateCurrentSlide({ animateElements: e.target.checked })} className="w-5 h-5 rounded-lg text-orange-600 focus:ring-orange-500"/> ELEMENT ANIM</label></RibbonGroup>
              </>}
              {activeTab === 'Data' && <>
                <RibbonGroup label="Chart Data"><RibbonBtn icon={<Database size={24}/>} label="Manage Data" onClick={() => {}} /><RibbonBtn icon={<Table size={24}/>} label="Spreadsheet" onClick={() => {}} /></RibbonGroup>
              </>}
              {activeTab === 'AI' && <>
                <RibbonGroup label="GenAI Author"><button onClick={aiGenerate} disabled={isGenerating} className="bg-purple-600 text-white flex flex-col items-center justify-center gap-1 p-3 rounded-xl w-32 shadow-lg hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50">{isGenerating ? <Loader2 size={24} className="animate-spin"/> : <Sparkles size={24}/>}<span className="text-[9px] font-bold uppercase">AI COMPOSE</span></button></RibbonGroup>
              </>}
              {activeTab === 'View' && <>
                <RibbonGroup label="Zoom"><div className="flex items-center gap-4"><button onClick={() => setZoom(z => Math.max(20, z-10))} className="p-1.5 border rounded bg-white"><ZoomOut size={16}/></button><span className="text-xs font-bold">{zoom}%</span><button onClick={() => setZoom(z => Math.min(150, z+10))} className="p-1.5 border rounded bg-white"><ZoomIn size={16}/></button></div></RibbonGroup>
              </>}
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-[#E2E2E2]">
        <div className={`w-56 bg-[#E1E1E1] border-r border-gray-300 flex flex-col gap-4 p-4 overflow-y-auto custom-scrollbar shrink-0 shadow-inner`}>
          {slides.map((s, idx) => (<div key={s.id} onClick={() => setCurrentIndex(idx)} className={`aspect-video bg-white rounded-lg border-2 cursor-pointer overflow-hidden transition-all shrink-0 ${currentIndex === idx ? 'border-[#EB5D12] shadow-xl' : 'border-transparent hover:border-gray-400 opacity-60'}`}><div className="w-full h-full scale-[0.2] origin-top-left p-10" style={{ background: s.background, color: s.textColor }}><h1 className="text-7xl font-black">{s.title || 'Draft'}</h1></div></div>))}
          <button onClick={addSlide} className="w-full aspect-video border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#EB5D12] active:scale-95 transition-all"><Plus size={32}/><span className="text-[10px] font-black mt-2 uppercase">ADD SLIDE</span></button>
        </div>
        <div className="flex-1 relative flex flex-col items-center p-12 overflow-auto custom-scrollbar">
           <div className="bg-white shadow-2xl w-[960px] aspect-video flex flex-col p-20 transition-all shrink-0 relative rounded-sm" style={{ transform: `scale(${zoom / 100})`, background: activeSlide.background, color: activeSlide.textColor }}><input className="bg-transparent border-none outline-none text-7xl font-black mb-10 w-full text-center placeholder:opacity-10 uppercase" value={activeSlide.title} onChange={e => updateCurrentSlide({ title: e.target.value })} placeholder="TITLE"/><textarea className="bg-transparent border-none outline-none flex-1 text-3xl resize-none w-full text-center leading-relaxed placeholder:opacity-10 custom-scrollbar font-medium" value={activeSlide.content} onChange={e => updateCurrentSlide({ content: e.target.value })} placeholder="CONTENT..."/></div>
        </div>
      </div>

      <div className="h-8 border-t border-gray-300 px-6 flex items-center justify-between text-[10px] font-black text-gray-400 bg-white shrink-0 uppercase tracking-widest">
          <div className="flex gap-8 items-center"><span>SLIDE {currentIndex + 1} OF {slides.length}</span><span className="flex items-center gap-2"><Monitor size={14}/> 16:9 HD</span></div>
          <div className="flex items-center gap-4"><span className="text-[#EB5D12]">OnlyOffice Simulation Core v4.0</span></div>
      </div>
    </div>
  );
};

const RibbonGroup = ({ label, children }: any) => (<div className="flex flex-col items-center px-4 h-full justify-between py-2 border-r border-gray-200 min-w-max last:border-r-0"><div className="flex items-center gap-4 flex-1">{children}</div><span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{label}</span></div>);
const RibbonBtn = ({ icon, label, onClick, className }: any) => (<button onClick={onClick} className={`flex flex-col items-center justify-center p-1 rounded-xl hover:bg-orange-50 transition-all group active:scale-95 min-w-[70px] ${className}`}><div className="group-hover:scale-110 transition-transform text-gray-600 group-hover:text-[#EB5D12]">{icon}</div><span className="text-[9px] font-bold uppercase tracking-tighter text-gray-500 group-hover:text-gray-800 mt-1">{label}</span></button>);
const ToolBtn = ({ icon, active, onClick, className }: any) => (<button onClick={onClick} className={`p-1.5 rounded transition-all flex items-center justify-center border border-transparent ${active ? 'bg-[#EB5D12] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:border-gray-200'} ${className}`}>{icon}</button>);
