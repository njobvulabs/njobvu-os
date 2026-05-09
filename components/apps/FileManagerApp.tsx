import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    Folder, FileText, Search, Grid, List as ListIcon, 
    ArrowUp, ArrowLeft, ArrowRight, Home, Trash2,
    FilePlus, FolderPlus, Copy, Scissors, Clipboard, Upload,
    X, Edit, Eye, Download, Info, CheckSquare, MousePointer2,
    Layout, Image as ImageIcon, ChevronRight, FileCode, MoreVertical,
    FileWarning, ExternalLink, HardDrive, Clock, Star, User
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { getFullPath } from '../../services/fileSystem';
import { AppId, FSNode } from '../../types';

export const FileManagerApp: React.FC<{ windowId: string; initialId?: string }> = ({ windowId, initialId }) => {
  const { fs, openApp, createDir, createFile, deleteNode, renameNode, setFsClipboard, pasteFsClipboard, addNotification, theme, moveNode, currentUser } = useOS();
  const [currentId, setCurrentId] = useState<string>(initialId || 'root');
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');
  
  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<{ startX: number, startY: number, currX: number, currY: number } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string | null } | null>(null);

  const isDark = theme.mode === 'dark';
  const currentNode = fs.nodes[currentId];
  
  // Breadcrumb logic
  const breadcrumbs = useMemo(() => {
    const path: { id: string, name: string }[] = [];
    let curr = fs.nodes[currentId];
    while (curr) {
      path.unshift({ id: curr.id, name: curr.name });
      if (!curr.parentId) break;
      curr = fs.nodes[curr.parentId];
    }
    return path;
  }, [currentId, fs.nodes]);

  const items = useMemo(() => {
    if (!currentNode || !currentNode.children) return [];
    let nodes = currentNode.children.map(id => fs.nodes[id]).filter(Boolean);
    if (searchQuery) nodes = nodes.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return nodes.sort((a, b) => {
        if (a.type === 'dir' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
    });
  }, [currentNode, fs.nodes, searchQuery]);

  const canModify = (nodeId: string) => {
    const node = fs.nodes[nodeId];
    if (!node) return false;
    // System folders are root-only
    if (['root', 'home', 'bin'].includes(node.id)) return false;
    // Guest can only modify their own stuff or things they created
    return node.owner === currentUser.username || currentUser.type === 'admin';
  };

  // Drag and Drop Handling
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    const node = fs.nodes[id];
    if (node && node.type === 'dir') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== targetId) {
      moveNode(sourceId, targetId);
      addNotification('File Manager', 'Item moved successfully', 'success');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = contentAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    if (!e.ctrlKey && !e.shiftKey) setSelectedIds(new Set());
    setContextMenu(null);

    const startX = e.clientX - rect.left + contentAreaRef.current!.scrollLeft;
    const startY = e.clientY - rect.top + contentAreaRef.current!.scrollTop;
    setMarquee({ startX, startY, currX: startX, currY: startY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!marquee || !contentAreaRef.current) return;
    const rect = contentAreaRef.current.getBoundingClientRect();
    const currX = e.clientX - rect.left + contentAreaRef.current.scrollLeft;
    const currY = e.clientY - rect.top + contentAreaRef.current.scrollTop;
    setMarquee(prev => prev ? { ...prev, currX, currY } : null);

    const mRect = {
      l: Math.min(marquee.startX, currX),
      r: Math.max(marquee.startX, currX),
      t: Math.min(marquee.startY, currY),
      b: Math.max(marquee.startY, currY)
    };

    const newSelected = new Set(e.ctrlKey ? selectedIds : []);
    items.forEach(node => {
      const el = contentAreaRef.current!.querySelector(`[data-fs-id="${node.id}"]`) as HTMLElement;
      if (el) {
        const itemRect = {
          l: el.offsetLeft,
          r: el.offsetLeft + el.offsetWidth,
          t: el.offsetTop,
          b: el.offsetTop + el.offsetHeight
        };
        if (!(mRect.r < itemRect.l || mRect.l > itemRect.r || mRect.b < itemRect.t || mRect.t > itemRect.b)) {
          newSelected.add(node.id);
        }
      }
    });
    setSelectedIds(newSelected);
  };

  const handleAction = (action: string) => {
      const ids = Array.from(selectedIds);
      setContextMenu(null);
      if (action === 'paste') { pasteFsClipboard(currentId); return; }
      if (ids.length === 0) return;
      
      switch(action) {
          case 'cut': setFsClipboard(ids[0], 'cut'); break;
          case 'copy': setFsClipboard(ids[0], 'copy'); break;
          case 'rename':
             const newName = prompt("New Name:", fs.nodes[ids[0]].name);
             if (newName) renameNode(ids[0], newName);
             break;
          case 'delete': 
             if(confirm(`Move ${ids.length} item(s) to Trash?`)) {
                 ids.forEach(id => deleteNode(id));
                 setSelectedIds(new Set());
             }
             break;
          case 'open':
             if (fs.nodes[ids[0]]) {
                 const node = fs.nodes[ids[0]];
                 if (node.type === 'dir') setCurrentId(node.id);
                 else openApp(AppId.NOTEPAD, { fileId: node.id });
             }
             break;
          case 'preview': setPreviewId(ids[0]); break;
      }
  };

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = e.ctrlKey ? new Set(selectedIds) : new Set();
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
    setPreviewId(id);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string | null) => {
      e.preventDefault();
      e.stopPropagation();
      if (nodeId && !selectedIds.has(nodeId)) setSelectedIds(new Set([nodeId]));
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
  };

  const menuBg = isDark ? 'bg-[#2b2b2b] text-gray-200 border-[#3c3c3c]' : 'bg-white text-gray-800 border-gray-300';
  const menuHover = 'hover:bg-blue-600 hover:text-white';

  const previewNode = previewId ? fs.nodes[previewId] : null;

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-800'} font-sans select-none overflow-hidden relative`}>
      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                createFile(currentId, file.name, ev.target?.result as string);
                addNotification('File Manager', `Imported ${file.name}`, 'success');
            };
            if (file.type.startsWith('image/')) reader.readAsDataURL(file);
            else reader.readAsText(file);
          });
      }} />
      
      {/* Toolbar */}
      <div className={`flex flex-col border-b shrink-0 ${isDark ? 'bg-[#252525] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
        <div className="flex items-center gap-2 p-2">
          <div className="flex gap-1 mr-2">
            <button 
              onClick={() => currentNode.parentId && setCurrentId(currentNode.parentId)} 
              disabled={!currentNode.parentId}
              className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ArrowUp size={18}/>
            </button>
            <button className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-30 transition-colors"><ArrowLeft size={18}/></button>
            <button className="p-1.5 hover:bg-black/5 rounded-lg disabled:opacity-30 transition-colors"><ArrowRight size={18}/></button>
          </div>

          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black transition-all shadow-md active:scale-95 uppercase tracking-widest">
            <Upload size={14}/> Import
          </button>
          
          <div className="h-6 w-[1px] bg-gray-500/20 mx-1"></div>
          
          <button onClick={() => { const n = prompt("Folder Name:"); if(n) createDir(currentId, n); }} className="p-2 hover:bg-black/5 rounded-lg transition-colors"><FolderPlus size={18}/></button>
          <button onClick={() => { const n = prompt("File Name:"); if(n) createFile(currentId, n, ""); }} className="p-2 hover:bg-black/5 rounded-lg transition-colors"><FilePlus size={18}/></button>
          
          <div className="flex-1 px-2">
            <div className={`flex items-center rounded-lg border px-3 h-8 transition-all focus-within:ring-2 focus-within:ring-blue-500/30 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200 shadow-inner'}`}>
                <Search size={14} className="opacity-40 mr-2"/><input className="bg-transparent border-none outline-none w-full text-xs" placeholder="Search files..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
            </div>
          </div>
          
          <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`p-1 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-black/5'}`}><Grid size={16}/></button>
              <button onClick={() => setViewMode('detailed')} className={`p-1 rounded transition-all ${viewMode === 'detailed' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-black/5'}`}><ListIcon size={16}/></button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className={`flex items-center gap-1 px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-black/10' : 'bg-gray-50'}`}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.id}>
              {i > 0 && <ChevronRight size={10} className="opacity-30" />}
              <button 
                onClick={() => setCurrentId(crumb.id)}
                className={`hover:text-blue-500 transition-colors ${i === breadcrumbs.length - 1 ? 'text-blue-600' : 'opacity-60'}`}
              >
                {crumb.name === 'root' ? 'System' : crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-48 border-r shrink-0 flex flex-col p-2 gap-1 ${isDark ? 'bg-[#222] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
          <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 opacity-60">Places</div>
          <SidebarItem icon={<Home size={16}/>} label="Home" active={currentId === currentUser.username} onClick={() => setCurrentId(currentUser.username)} isDark={isDark} />
          <SidebarItem icon={<FileText size={16}/>} label="Documents" active={currentId === 'docs'} onClick={() => setCurrentId('docs')} isDark={isDark} />
          <SidebarItem icon={<ImageIcon size={16}/>} label="Pictures" active={currentId === 'pics'} onClick={() => setCurrentId('pics')} isDark={isDark} />
          <SidebarItem icon={<Trash2 size={16}/>} label="Trash" active={currentId === 'trash'} onClick={() => setCurrentId('trash')} isDark={isDark} />
          
          <div className="px-3 py-2 mt-4 text-[9px] font-black uppercase tracking-widest text-gray-500 opacity-60">Devices</div>
          <SidebarItem icon={<HardDrive size={16}/>} label="System Root" active={currentId === 'root'} onClick={() => setCurrentId('root')} isDark={isDark} />
          
          <div className="mt-auto p-3 bg-black/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">G</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase leading-none">Guest User</span>
                <span className="text-[8px] opacity-50 uppercase">Limited Access</span>
              </div>
            </div>
            <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[15%]"></div>
            </div>
            <div className="flex justify-between mt-1 text-[7px] font-bold uppercase opacity-40">
              <span>Disk Usage</span>
              <span>15%</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div 
          ref={contentAreaRef} 
          className="flex-1 overflow-auto relative p-4 custom-scrollbar"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setMarquee(null)}
          onMouseLeave={() => setMarquee(null)}
          onContextMenu={(e) => handleContextMenu(e, null)}
        >
          {marquee && (
            <div className="absolute bg-blue-500/10 border border-blue-500/50 z-50 pointer-events-none rounded-sm" style={{ left: Math.min(marquee.startX, marquee.currX), top: Math.min(marquee.startY, marquee.currY), width: Math.abs(marquee.startX - marquee.currX), height: Math.abs(marquee.startY - marquee.currY) }} />
          )}

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {items.map(node => (
                <div 
                  key={node.id} 
                  data-fs-id={node.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  onDragOver={(e) => handleDragOver(e, node.id)}
                  onDrop={(e) => handleDrop(e, node.id)}
                  onClick={(e) => handleItemClick(e, node.id)}
                  onDoubleClick={() => node.type === 'dir' ? setCurrentId(node.id) : openApp(AppId.NOTEPAD, { fileId: node.id })}
                  onContextMenu={(e) => handleContextMenu(e, node.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all border-2 group relative ${selectedIds.has(node.id) ? 'bg-blue-600/10 border-blue-500 shadow-md' : 'border-transparent hover:bg-black/5'}`}
                >
                  <div className={`w-16 h-16 flex items-center justify-center relative ${selectedIds.has(node.id) ? 'drop-shadow-md' : ''}`}>
                    {node.type === 'dir' ? (
                      <Folder size={48} className="text-blue-500 fill-blue-500/10 group-hover:scale-110 transition-transform duration-200" />
                    ) : (
                      <div className="relative">
                        <FileText size={48} className="text-gray-400 group-hover:text-gray-500 transition-all duration-200 group-hover:scale-110" />
                        {node.name.endsWith('.txt') && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white bg-blue-600 px-1 rounded-sm opacity-80">TXT</span>}
                      </div>
                    )}
                    {selectedIds.has(node.id) && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-full p-0.5 shadow-md ring-2 ring-white/10 z-10">
                        <CheckSquare size={10}/>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight w-full uppercase tracking-tight transition-colors group-hover:text-blue-600 line-clamp-2 px-1 break-all">
                    {node.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col min-w-full">
                <div className={`flex items-center px-4 py-2 border-b border-white/5 font-black text-[10px] uppercase tracking-widest text-gray-500 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                    <div className="w-8"></div>
                    <div className="flex-1 px-4">Name</div>
                    <div className="w-24 px-4">Size</div>
                    <div className="w-32 px-4">Modified</div>
                </div>
                {items.map(node => (
                    <div 
                        key={node.id}
                        data-fs-id={node.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node.id)}
                        onDragOver={(e) => handleDragOver(e, node.id)}
                        onDrop={(e) => handleDrop(e, node.id)}
                        onClick={(e) => handleItemClick(e, node.id)}
                        onDoubleClick={() => node.type === 'dir' ? setCurrentId(node.id) : openApp(AppId.NOTEPAD, { fileId: node.id })}
                        onContextMenu={(e) => handleContextMenu(e, node.id)}
                        className={`flex items-center px-4 py-2 text-xs transition-all border-b border-white/5 group ${selectedIds.has(node.id) ? 'bg-blue-600/10 text-blue-400 font-bold' : 'hover:bg-black/5 text-gray-400'}`}
                    >
                        <div className="w-8 flex justify-center shrink-0">
                            {node.type === 'dir' ? <Folder size={18} className="text-blue-500" /> : <FileText size={18} />}
                        </div>
                        <div className="flex-1 px-4 truncate uppercase tracking-tighter font-black">{node.name}</div>
                        <div className="w-24 px-4 text-[10px] opacity-60">{node.type === 'dir' ? '-' : `${Math.ceil((node.content?.length || 0) / 1024)} KB`}</div>
                        <div className="w-32 px-4 text-[10px] opacity-60">{new Date(node.createdAt).toLocaleDateString()}</div>
                    </div>
                ))}
            </div>
          )}

          {items.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none opacity-20">
                  <Folder size={80} strokeWidth={1} />
                  <span className="text-sm font-black uppercase mt-6 tracking-[0.3em]">No items in this directory</span>
              </div>
          )}
        </div>

        {/* Preview Sidebar */}
        {previewNode && (
            <div className={`w-72 border-l animate-in slide-in-from-right duration-300 flex flex-col shrink-0 ${isDark ? 'bg-[#222] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">File Info</span>
                    <button onClick={() => setPreviewId(null)} className="p-1 hover:bg-black/10 rounded transition-colors"><X size={14}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center">
                    <div className="mb-6 p-4 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                        {previewNode.type === 'dir' ? <Folder size={64} className="text-blue-500" /> : <FileText size={64} className="text-gray-400" />}
                    </div>
                    <h3 className="font-black uppercase tracking-tighter text-sm mb-1 break-all px-2">{previewNode.name}</h3>
                    <p className="text-[10px] opacity-50 uppercase font-black mb-8 tracking-widest">{previewNode.type === 'dir' ? 'Directory' : 'Document'}</p>
                    
                    <div className="w-full space-y-4 text-left">
                        <div className="p-3 bg-black/5 rounded-lg border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Created On</span>
                            <span className="text-[11px] font-mono">{new Date(previewNode.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-black/5 rounded-lg border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Owner</span>
                            <span className="text-[11px] font-bold uppercase text-blue-500">{previewNode.owner || 'System'}</span>
                        </div>
                    </div>

                    {previewNode.type === 'file' && (
                        <div className="mt-8 w-full">
                            <button 
                                onClick={() => openApp(AppId.NOTEPAD, { fileId: previewNode.id })}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                            >
                                Open Editor
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`p-2 px-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 border-t flex justify-between shrink-0 ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
         <div>{selectedIds.size > 0 ? `${selectedIds.size} items selected` : `${items.length} items total`}</div>
         <div className="flex gap-6">
             <span className="flex items-center gap-1"><ExternalLink size={10}/> Drag and Drop Enabled</span>
             <span className="text-blue-600">Thunar Core v3.5</span>
         </div>
      </div>

        {contextMenu && (
          <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)} onContextMenu={e => { e.preventDefault(); setContextMenu(null); }}>
            <div 
                className={`absolute z-[101] w-52 ${menuBg} border shadow-2xl rounded-xl py-1.5 text-[11px] font-black animate-in zoom-in-95 duration-75`}
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={e => e.stopPropagation()}
            >
                {contextMenu.nodeId ? (
                    <>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => handleAction('open')}><Eye size={16}/> OPEN ITEM</button>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => handleAction('preview')}><Info size={16}/> PREVIEW INFO</button>
                        <div className="h-[1px] bg-gray-500/10 my-1"></div>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => handleAction('copy')}><Copy size={16}/> DUPLICATE</button>
                        <button 
                          className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors disabled:opacity-30`} 
                          onClick={() => handleAction('rename')}
                          disabled={!canModify(contextMenu.nodeId)}
                        >
                          <Edit size={16}/> RENAME
                        </button>
                        <div className="h-[1px] bg-gray-500/10 my-1"></div>
                        <button 
                          className={`w-full text-left px-5 py-3 hover:bg-red-600 hover:text-white text-red-500 flex items-center gap-4 transition-colors disabled:opacity-30`} 
                          onClick={() => handleAction('delete')}
                          disabled={!canModify(contextMenu.nodeId)}
                        >
                          <Trash2 size={16}/> MOVE TO TRASH
                        </button>
                    </>
                ) : (
                    <>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => fileInputRef.current?.click()}><Upload size={16}/> IMPORT LOCAL</button>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => { const n = prompt("Folder Name:"); if(n) createDir(currentId, n); }}><FolderPlus size={16}/> NEW FOLDER</button>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => { const n = prompt("File Name:"); if(n) createFile(currentId, n, ""); }}><FilePlus size={16}/> NEW DOCUMENT</button>
                        <div className="h-[1px] bg-gray-500/10 my-1"></div>
                        <button className={`w-full text-left px-5 py-3 ${menuHover} flex items-center gap-4 transition-colors`} onClick={() => handleAction('paste')}><Clipboard size={16}/> PASTE FROM CLIPBOARD</button>
                    </>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isDark: boolean }> = ({ icon, label, active, onClick, isDark }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all ${active ? 'bg-blue-600 text-white shadow-md' : `hover:bg-black/5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}`}
  >
    <div className={active ? 'text-white' : 'text-blue-500'}>{icon}</div>
    {label}
  </button>
);
