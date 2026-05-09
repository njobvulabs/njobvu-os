import React, { useState, useEffect, useRef } from 'react';
// Fix: Removed MoreVertical from lucide-react import to resolve conflict with local declaration below.
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Lock, Plus, X, Star, Settings, Clock, Globe, EyeOff, Download, Code, Maximize, Minimize, ShieldCheck, Sun, Moon, ZoomIn, ZoomOut } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface Tab {
    id: string;
    title: string;
    url: string;
    inputUrl: string;
    loading: boolean;
    history: string[]; 
    historyIndex: number;
    useProxy: boolean;
}

const DEFAULT_BOOKMARKS = [
    { title: 'Google', url: 'https://www.google.com' },
    { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
];

const PROXY_PREFIX = 'https://corsproxy.io/?';

export const BrowserApp: React.FC<{ windowId: string }> = ({ windowId }) => {
  const { maximizeWindow, updateWindowContext } = useOS();
  const [tabs, setTabs] = useState<Tab[]>([
      { 
        id: '1', 
        title: 'New Tab', 
        url: 'https://www.google.com', 
        inputUrl: 'https://www.google.com', 
        loading: false,
        history: ['https://www.google.com'],
        historyIndex: 0,
        useProxy: true
      }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isIncognito, setIsIncognito] = useState(false);
  const [isKvmMode, setIsKvmMode] = useState(false);
  
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
      updateWindowContext(windowId, `Viewing: ${activeTab.url}\nTabs: ${tabs.length}`);
  }, [activeTab.url, tabs.length, windowId, updateWindowContext]);

  const addTab = (url?: string) => {
      const newId = Math.random().toString(36).substr(2, 9);
      const startUrl = url || 'https://www.google.com';
      setTabs(prev => [...prev, { 
          id: newId, 
          title: 'New Tab', 
          url: startUrl, 
          inputUrl: startUrl, 
          loading: true,
          history: [startUrl],
          historyIndex: 0,
          useProxy: true
      }]);
      setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (tabs.length === 1) return;
      const newTabs = tabs.filter(t => t.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) setActiveTabId(newTabs[newTabs.length - 1].id);
  };

  const navigate = (e?: React.FormEvent, overrideUrl?: string) => {
    e?.preventDefault();
    let target = overrideUrl || activeTab.inputUrl;
    if (!target.includes('.') && !target.includes(' ')) target = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
    else if (!target.startsWith('http')) target = 'https://' + target;
    
    setTabs(prev => prev.map(t => t.id === activeTabId ? { 
        ...t, 
        url: target, 
        inputUrl: target, 
        loading: true,
        history: [...t.history.slice(0, t.historyIndex + 1), target],
        historyIndex: t.historyIndex + 1
    } : t));
  };

  return (
    <div className={`flex flex-col h-full font-sans relative ${isIncognito ? 'bg-gray-900' : 'bg-white'}`}>
      {!isKvmMode && (
      <div className={`flex items-end px-2 pt-1 gap-0.5 border-b ${isIncognito ? 'bg-black border-gray-800' : 'bg-[#dee1e6] border-[#bdc1c6]'}`}>
          {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs min-w-[120px] max-w-[200px] cursor-pointer transition-all border-t border-x relative ${activeTabId === tab.id ? `${isIncognito ? 'bg-gray-800 text-white border-transparent' : 'bg-white text-gray-900 border-transparent shadow-sm'} z-10` : `text-gray-500 border-transparent hover:bg-black/5`}`}
              >
                  <Globe size={10} className={tab.loading ? 'animate-spin' : ''} />
                  <div className="truncate flex-1 font-medium">{tab.title === 'New Tab' ? (tab.url.includes('google') ? 'Google' : tab.url.substring(0, 20)) : tab.title}</div>
                  <button onClick={(e) => closeTab(e, tab.id)} className="p-0.5 rounded-full hover:bg-black/10 opacity-0 group-hover:opacity-100"><X size={10} /></button>
              </div>
          ))}
          <button onClick={() => addTab()} className="p-1.5 rounded-full mb-1 ml-1 hover:bg-black/10 transition-colors"><Plus size={14} /></button>
      </div>
      )}

      {!isKvmMode && (
      <div className="flex items-center gap-2 p-2 border-b bg-white">
        <div className="flex gap-1 text-gray-600">
          <button onClick={() => {}} className="p-1.5 hover:bg-gray-100 rounded-full"><ArrowLeft size={16} /></button>
          <button onClick={() => {}} className="p-1.5 hover:bg-gray-100 rounded-full"><ArrowRight size={16} /></button>
          <button onClick={() => navigate()} className="p-1.5 hover:bg-gray-100 rounded-full"><RotateCw size={14} /></button>
        </div>
        <form onSubmit={navigate} className="flex-1 relative">
           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"><Lock size={12}/></div>
           <input className="w-full bg-[#f1f3f4] border-none rounded-full py-1.5 pl-9 pr-4 text-sm outline-none focus:bg-white focus:shadow-md transition-all text-gray-800" value={activeTab.inputUrl} onChange={e => setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, inputUrl: e.target.value} : t))} />
        </form>
        <div className="flex items-center gap-1">
            <button onClick={() => setIsKvmMode(true)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><Maximize size={18}/></button>
            <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><MoreVertical size={18}/></button>
        </div>
      </div>
      )}

      <div className="flex-1 relative bg-white">
         <iframe 
            src={activeTab.useProxy ? PROXY_PREFIX + encodeURIComponent(activeTab.url) : activeTab.url} 
            className="w-full h-full border-none"
            onLoad={() => setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, loading: false} : t))}
         />
         {isKvmMode && (
             <button onClick={() => setIsKvmMode(false)} className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 hover:bg-black text-white px-4 py-1 rounded-full text-xs font-bold shadow-xl border border-white/20 transition-all opacity-0 hover:opacity-100">Exit Immersive Mode</button>
         )}
      </div>
    </div>
  );
};

const MoreVertical = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
);