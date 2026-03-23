
import React, { useRef, useState, useEffect } from 'react';
import { X, Minus, Square, Maximize2, ChevronUp, ChevronDown, Pin, Monitor, LayoutGrid } from 'lucide-react';
import { WindowState } from '../../types';
import { useOS } from '../../context/OSContext';

interface WindowFrameProps {
  windowState: WindowState;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowState }) => {
  const {
    closeWindow, minimizeWindow, maximizeWindow, shadeWindow, toggleStickyWindow,
    focusWindow, updateWindowPosition, updateWindowSize,
    activeWindowId, theme, currentDesktop, systemSettings
  } = useOS();

  const isActive = activeWindowId === windowState.id;
  const isMaximized = windowState.isMaximized || (typeof window !== 'undefined' && window.innerWidth < 640);
  const isShaded = windowState.isShaded;
  const isPanelTop = systemSettings.panelPosition === 'top';
  const panelHeight = systemSettings.panelSize || 48;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);
  
  const dragStartRef = useRef<{ x: number; y: number; width: number; height: number; clientX: number; clientY: number } | null>(null);

  const isVisible = windowState.desktopId === currentDesktop || windowState.isSticky;
  if (!isVisible && !windowState.isMinimized) return null; 
  if (windowState.isMinimized) return null;

  const isDark = theme.mode === 'dark';
  const targetOpacity = isActive ? systemSettings.windowOpacity : systemSettings.inactiveWindowOpacity;
  
  const windowBgStyle = {
      backgroundColor: isDark 
        ? `rgba(32, 32, 32, ${targetOpacity / 100})` 
        : `rgba(250, 250, 250, ${targetOpacity / 100})`,
      backdropFilter: systemSettings.enableBlur && targetOpacity < 100 ? 'blur(10px)' : 'none',
  };
  
  const borderColor = isDark ? 'border-white/10' : 'border-gray-300';
  const headerColor = isDark ? (isActive ? 'text-white' : 'text-gray-400') : (isActive ? 'text-gray-900' : 'text-gray-600');
  const headerBg = isDark ? (isActive ? `bg-${theme.accentColor}-600/90` : 'bg-[#222]/90') : (isActive ? `bg-${theme.accentColor}-500/90` : 'bg-gray-200/90');
  const shadowClass = isActive ? 'shadow-2xl ring-1 ring-white/5' : 'shadow-lg';

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMaximized) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    focusWindow(windowState.id);
    setIsDragging(true);
    dragStartRef.current = { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height, clientX: e.clientX, clientY: e.clientY };
  };

  const handleResizeStart = (e: React.PointerEvent, dir: ResizeDirection) => {
    if (isMaximized || isShaded) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    focusWindow(windowState.id);
    setIsResizing(dir);
    dragStartRef.current = { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height, clientX: e.clientX, clientY: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { x, y, width, height, clientX, clientY } = dragStartRef.current;
    const deltaX = e.clientX - clientX;
    const deltaY = e.clientY - clientY;

    if (isDragging) {
      const newX = x + deltaX;
      const newY = y + deltaY;
      updateWindowPosition(windowState.id, newX, newY);
      if (systemSettings.enableSnap) {
          if (e.clientY < 10) setSnapPreview('top');
          else if (e.clientX < 10) setSnapPreview('left');
          else if (e.clientX > window.innerWidth - 10) setSnapPreview('right');
          else setSnapPreview(null);
      }
    } else if (isResizing) {
      let nX = x, nY = y, nW = width, nH = height;
      const minW = 280, minH = 200;
      
      if (isResizing.includes('e')) nW = Math.max(minW, width + deltaX);
      if (isResizing.includes('w')) { 
        const w = Math.max(minW, width - deltaX); 
        if (w !== minW) nX = x + (width - w);
        nW = w; 
      }
      if (isResizing.includes('s')) nH = Math.max(minH, height + deltaY);
      if (isResizing.includes('n')) { 
        const h = Math.max(minH, height - deltaY); 
        if (h !== minH) nY = y + (height - h);
        nH = h; 
      }
      
      updateWindowPosition(windowState.id, nX, nY);
      updateWindowSize(windowState.id, nW, nH);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging && snapPreview) applySnap(snapPreview);
    setIsDragging(false); 
    setIsResizing(null); 
    setSnapPreview(null); 
    dragStartRef.current = null;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
  };

  const applySnap = (type: 'left' | 'right' | 'top') => {
      const screenW = window.innerWidth, screenH = window.innerHeight - panelHeight, startY = isPanelTop ? panelHeight : 0;
      if (type === 'top') { maximizeWindow(windowState.id); return; }
      updateWindowPosition(windowState.id, type === 'left' ? 0 : screenW/2, startY);
      updateWindowSize(windowState.id, screenW / 2, screenH);
  };

  const radiusClass = isMaximized ? 'rounded-none' : theme.windowRadius === 'none' ? 'rounded-none' : theme.windowRadius === 'lg' ? 'rounded-xl' : theme.windowRadius === 'sm' ? 'rounded-sm' : 'rounded-md';
  const frameHeight = isShaded ? '30px' : isMaximized ? `calc(100vh - ${panelHeight}px)` : windowState.height;
  const maximizedTop = isPanelTop ? panelHeight : 0;

  const frameStyle: React.CSSProperties = isMaximized
    ? { ...windowBgStyle, zIndex: windowState.zIndex, top: maximizedTop, left: 0, width: '100vw', height: frameHeight, borderRadius: 0, border: 'none' }
    : { ...windowBgStyle, zIndex: windowState.zIndex, top: windowState.y, left: windowState.x, width: windowState.width, height: frameHeight };

  const Buttons = () => (
    <div className="flex items-center gap-0.5" onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => shadeWindow(windowState.id)} className="p-1 hover:bg-white/20 rounded-sm">{isShaded ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</button>
        <button onClick={() => minimizeWindow(windowState.id)} className="p-1 hover:bg-white/20 rounded-sm"><Minus size={14}/></button>
        <button onClick={() => maximizeWindow(windowState.id)} className="p-1 hover:bg-white/20 rounded-sm">{isMaximized ? <Square size={10}/> : <Maximize2 size={10}/>}</button>
        <button onClick={() => closeWindow(windowState.id)} className="p-1 hover:bg-red-500 rounded-sm active:bg-red-600 transition-colors"><X size={14}/></button>
    </div>
  );

  const getResizeCursor = (dir: ResizeDirection) => {
    if (!dir) return 'default';
    if (dir === 'n' || dir === 's') return 'ns-resize';
    if (dir === 'e' || dir === 'w') return 'ew-resize';
    if (dir === 'ne' || dir === 'sw') return 'nesw-resize';
    if (dir === 'nw' || dir === 'se') return 'nwse-resize';
    return 'default';
  };

  return (
    <>
      <div
        className={`absolute flex flex-col ${shadowClass} ${isMaximized ? '' : 'border'} transition-all duration-75 touch-none ${radiusClass} ${borderColor}`}
        style={frameStyle}
        onPointerDown={() => focusWindow(windowState.id)}
      >
        {/* Resize Handles (Hitboxes) - Visible but transparent edges */}
        {!isMaximized && !isShaded && (
          <>
            <div className="absolute top-[-6px] left-0 w-full h-[12px] cursor-ns-resize z-[100]" onPointerDown={e => handleResizeStart(e, 'n')} />
            <div className="absolute bottom-[-6px] left-0 w-full h-[12px] cursor-ns-resize z-[100]" onPointerDown={e => handleResizeStart(e, 's')} />
            <div className="absolute top-0 right-[-6px] h-full w-[12px] cursor-ew-resize z-[100]" onPointerDown={e => handleResizeStart(e, 'e')} />
            <div className="absolute top-0 left-[-6px] h-full w-[12px] cursor-ew-resize z-[100]" onPointerDown={e => handleResizeStart(e, 'w')} />
            
            <div className="absolute top-[-8px] left-[-8px] w-[16px] h-[16px] cursor-nwse-resize z-[101]" onPointerDown={e => handleResizeStart(e, 'nw')} />
            <div className="absolute top-[-8px] right-[-8px] w-[16px] h-[16px] cursor-nesw-resize z-[101]" onPointerDown={e => handleResizeStart(e, 'ne')} />
            <div className="absolute bottom-[-8px] left-[-8px] w-[16px] h-[16px] cursor-nesw-resize z-[101]" onPointerDown={e => handleResizeStart(e, 'sw')} />
            <div className="absolute bottom-[-8px] right-[-8px] w-[16px] h-[16px] cursor-nwse-resize z-[101]" onPointerDown={e => handleResizeStart(e, 'se')} />
          </>
        )}

        {/* Global Interaction Overlay while dragging/resizing */}
        {(isDragging || isResizing) && (
            <div 
              className="fixed inset-0 z-[10000] opacity-0" 
              style={{ cursor: isDragging ? 'move' : getResizeCursor(isResizing) }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
        )}

        <div
          className={`h-[30px] min-h-[30px] flex items-center justify-between px-2 select-none touch-none ${headerBg} ${headerColor}`}
          onDoubleClick={() => maximizeWindow(windowState.id)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {systemSettings.titleBarLayout === 'left' && <Buttons />}
          <div className="flex items-center gap-2 overflow-hidden flex-1 px-2 pointer-events-none">
            <span className="text-[11px] font-bold truncate tracking-tight flex items-center gap-1.5 uppercase">
              {windowState.isSticky && <Pin size={10} className="rotate-45 text-yellow-400" />}
              {windowState.title}
            </span>
          </div>
          {systemSettings.titleBarLayout === 'right' && <Buttons />}
        </div>

        <div className={`flex-1 overflow-hidden relative bg-transparent ${isShaded ? 'hidden' : 'block'}`}>
          {windowState.content}
        </div>
      </div>

      {snapPreview && !isShaded && (
        <div className="fixed z-[9999] bg-blue-500/10 backdrop-blur-sm border-2 border-blue-400/30 rounded-lg pointer-events-none transition-all duration-200"
          style={{ top: isPanelTop ? panelHeight + 5 : 5, left: snapPreview === 'right' ? window.innerWidth / 2 + 5 : 5, width: snapPreview === 'top' ? window.innerWidth - 10 : window.innerWidth / 2 - 10, height: window.innerHeight - panelHeight - 10 }}
        />
      )}
    </>
  );
};
