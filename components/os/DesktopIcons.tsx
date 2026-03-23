import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS } from '../../constants';
import { AppId, DesktopIconState } from '../../types';
import { Trash2, Rocket, FolderOpen, ExternalLink, X, FileText, Info } from 'lucide-react';

export const DesktopIcons: React.FC = () => {
  const { openApp, desktopIcons, updateDesktopIconPosition, theme, addNotification, systemSettings, emptyTrash, fs } = useOS();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, icon: DesktopIconState} | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    if (e.button !== 0) return; // Only left click drags
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(id);
    dragOffset.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY
    };
    setContextMenu(null); // Close context menu on click
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId) {
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // Dynamic boundary checks based on panel position
        const panelHeight = systemSettings.panelSize;
        const isTop = systemSettings.panelPosition === 'top';
        const isBottom = systemSettings.panelPosition === 'bottom';
        
        const minX = 0;
        const maxX = window.innerWidth - 80; 
        
        const minY = isTop ? panelHeight + 10 : 0;
        const maxY = isBottom ? window.innerHeight - panelHeight - 100 : window.innerHeight - 100; 

        updateDesktopIconPosition(draggingId, Math.max(minX, Math.min(newX, maxX)), Math.max(minY, Math.min(newY, maxY)));
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, updateDesktopIconPosition, systemSettings]);

  const handleDoubleClick = (icon: any) => {
    if (icon.appId === 'trash') {
      openApp(AppId.FILE_MANAGER, { initialId: 'trash' });
    } else if (icon.appId === 'launcher' && icon.action) {
        icon.action();
    } else {
      openApp(icon.appId);
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e: React.MouseEvent, icon: DesktopIconState) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, icon });
  };

  const isDark = theme.mode === 'dark';
  const menuBg = isDark ? 'bg-[#2b2b2b] text-gray-200 border-[#3c3c3c]' : 'bg-white text-gray-800 border-gray-300';
  const menuHover = 'hover:bg-[#4a90d9] hover:text-white';

  const isTrashEmpty = fs.nodes['trash']?.children?.length === 0;

  return (
    <>
      <div className="absolute inset-0 z-0 pointer-events-none">
        {desktopIcons.map(icon => {
          let AppIcon = APPS[icon.appId as AppId]?.icon || Rocket;
          if (icon.appId === 'trash') AppIcon = Trash2;
          if (icon.iconOverride) AppIcon = icon.iconOverride;
          
          return (
            <div
              key={icon.id}
              className="absolute w-20 flex flex-col items-center gap-1 p-2 rounded hover:bg-white/10 cursor-pointer group pointer-events-auto transition-colors border border-transparent"
              style={{ left: icon.x, top: icon.y }}
              onMouseDown={(e) => handleMouseDown(e, icon.id, icon.x, icon.y)}
              onDoubleClick={() => handleDoubleClick(icon)}
              onContextMenu={(e) => handleContextMenu(e, icon)}
            >
              <div className="drop-shadow-sm filter text-white">
                <AppIcon size={48} className={icon.appId === AppId.FILE_MANAGER ? 'text-blue-400' : icon.appId === 'trash' ? (isTrashEmpty ? 'text-gray-400' : 'text-blue-300') : 'text-white'} />
              </div>
              <span className="text-[11px] text-white text-center font-medium drop-shadow-md select-none bg-black/30 rounded px-1 group-hover:bg-black/50 line-clamp-2 leading-tight">
                {icon.label}
              </span>
            </div>
          );
        })}
      </div>

      {contextMenu && (
          <>
            <div className="fixed inset-0 z-[99998]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}></div>
            <div 
                className={`fixed z-[99999] w-48 ${menuBg} border shadow-xl rounded py-1 text-sm animate-in fade-in duration-75`}
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                <button className={`w-full text-left px-4 py-2 ${menuHover} flex items-center gap-2`} onClick={() => handleDoubleClick(contextMenu.icon)}>
                    <FolderOpen size={14} /> Open
                </button>
                
                {contextMenu.icon.appId === 'trash' ? (
                    <button className={`w-full text-left px-4 py-2 ${menuHover} flex items-center gap-2 disabled:opacity-50`} onClick={() => { emptyTrash(); setContextMenu(null); }} disabled={isTrashEmpty}>
                        <Trash2 size={14} /> Empty Trash
                    </button>
                ) : (
                    <button className={`w-full text-left px-4 py-2 ${menuHover} flex items-center gap-2 text-red-500`} onClick={() => { addNotification('Desktop', 'Cannot delete system icons', 'warning'); setContextMenu(null); }}>
                        <Trash2 size={14} /> Delete
                    </button>
                )}
                
                <div className={`h-[1px] bg-gray-500/20 my-1`}></div>
                
                <button className={`w-full text-left px-4 py-2 ${menuHover} flex items-center gap-2`} onClick={() => { addNotification('Properties', `Item: ${contextMenu.icon.label}`, 'info'); setContextMenu(null); }}>
                    <Info size={14} /> Properties
                </button>
            </div>
          </>
      )}
    </>
  );
};
