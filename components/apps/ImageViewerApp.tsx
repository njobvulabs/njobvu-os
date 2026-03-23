
import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronLeft, ChevronRight, Download, Move, Image as ImageIcon, Play, Pause, X } from 'lucide-react';
import { useOS } from '../../context/OSContext';

export const ImageViewerApp: React.FC<{ windowId: string; fileId?: string }> = ({ windowId, fileId }) => {
  const { fs, addNotification, closeWindow } = useOS();
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFit, setIsFit] = useState(true);
  const [isSlideshow, setIsSlideshow] = useState(false);
  
  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Navigation Logic
  const currentNode = currentFileId ? fs.nodes[currentFileId] : null;
  const parentId = currentNode?.parentId;
  
  const getSiblingImages = () => {
    if (!parentId) return [];
    const parent = fs.nodes[parentId];
    if (!parent?.children) return [];
    
    return parent.children.filter(id => {
      const node = fs.nodes[id];
      const ext = node.name.split('.').pop()?.toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '');
    });
  };

  const images = getSiblingImages();
  const currentIndex = currentFileId ? images.indexOf(currentFileId) : -1;

  const navigate = (direction: 'next' | 'prev') => {
    if (currentIndex === -1 || images.length <= 1) return;
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;
    
    setCurrentFileId(images[newIndex]);
    resetView();
  };

  // Slideshow Effect
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSlideshow) {
          interval = setInterval(() => {
              navigate('next');
          }, 3000);
      }
      return () => clearInterval(interval);
  }, [isSlideshow, currentFileId]); 

  const resetView = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsFit(true);
  };

  // Pan Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
    setIsFit(false);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
       e.preventDefault();
       const delta = e.deltaY > 0 ? -0.1 : 0.1;
       setScale(s => Math.max(0.1, Math.min(5, s + delta)));
       setIsFit(false);
    }
  };

  const currentImage = currentNode ? {
      name: currentNode.name,
      src: currentNode.content || '' // Base64 content from FS
  } : null;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-[#252525] border-b border-[#333]">
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold truncate max-w-[200px]">{currentImage?.name || 'No Image'}</span>
                <span className="text-xs text-gray-400">{Math.round(scale * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1.5 hover:bg-white/10 rounded" title="Zoom Out"><ZoomOut size={18}/></button>
                <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="p-1.5 hover:bg-white/10 rounded" title="Zoom In"><ZoomIn size={18}/></button>
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                <button onClick={() => setRotation(r => r + 90)} className="p-1.5 hover:bg-white/10 rounded" title="Rotate"><RotateCw size={18}/></button>
                <button onClick={() => { setIsFit(!isFit); setScale(1); setPosition({x:0, y:0}); }} className="p-1.5 hover:bg-white/10 rounded" title={isFit ? "Actual Size" : "Fit to Window"}><Maximize2 size={18} className={isFit ? 'text-blue-400' : ''} /></button>
                <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                <button onClick={() => setIsSlideshow(!isSlideshow)} className={`p-1.5 hover:bg-white/10 rounded ${isSlideshow ? 'text-green-400' : ''}`} title="Slideshow">
                    {isSlideshow ? <Pause size={18} /> : <Play size={18} />}
                </button>
            </div>
        </div>

        {/* Main Viewport */}
        <div 
            className="flex-1 relative overflow-hidden bg-checkered flex items-center justify-center cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            {currentImage ? (
                <img 
                    src={currentImage.src} 
                    alt={currentImage.name}
                    className="transition-transform duration-100 ease-out select-none pointer-events-none"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                        maxWidth: isFit ? '100%' : 'none',
                        maxHeight: isFit ? '100%' : 'none',
                        objectFit: 'contain'
                    }}
                    draggable={false}
                />
            ) : (
                <div className="text-gray-500 flex flex-col items-center">
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <span>No image selected</span>
                </div>
            )}

            {/* Nav Overlays */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={() => navigate('prev')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all opacity-0 hover:opacity-100"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button 
                        onClick={() => navigate('next')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all opacity-0 hover:opacity-100"
                    >
                        <ChevronRight size={32} />
                    </button>
                </>
            )}
        </div>
        
        {/* Footer info */}
        <div className="px-2 py-1 bg-[#252525] border-t border-[#333] text-xs text-gray-500 flex justify-between">
            <span>{currentIndex + 1} of {images.length} items</span>
            <span>{isDragging ? 'Panning' : 'Ready'}</span>
        </div>
    </div>
  );
};
