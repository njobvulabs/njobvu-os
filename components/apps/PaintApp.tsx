
import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Download, Trash2, Undo, Palette, Type, Square, Circle } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { FSNode } from '../../types';

export const PaintApp: React.FC = () => {
  const { createFile, fs, addNotification } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High DPI fix
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    contextRef.current = ctx;

    // Fill white background for saving
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, tool]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.fillStyle = '#ffffff';
      contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `drawing_${Date.now()}.png`;
      // Find guest/pictures folder if possible, else root
      let destId = fs.rootId;
      const guest = (Object.values(fs.nodes) as FSNode[]).find(n => n.name === 'guest');
      if (guest && guest.children) {
         const pics = guest.children.find(cid => fs.nodes[cid].name === 'Pictures');
         if (pics) destId = pics;
         else destId = guest.id;
      }

      createFile(destId, filename, dataUrl);
      addNotification('Paint', `Saved ${filename}`, 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] text-gray-800">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-2 bg-[#e0e0e0] border-b border-[#c0c0c0] shadow-sm select-none">
        
        {/* Colors */}
        <div className="flex items-center gap-1">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => { setColor(e.target.value); setTool('brush'); }}
            className="w-8 h-8 cursor-pointer rounded overflow-hidden border border-gray-400"
          />
        </div>

        <div className="w-[1px] h-6 bg-gray-400"></div>

        {/* Tools */}
        <button 
          onClick={() => setTool('brush')}
          className={`p-1.5 rounded ${tool === 'brush' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-300'}`}
          title="Brush"
        >
           <Palette size={18} />
        </button>
        <button 
          onClick={() => setTool('eraser')}
          className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-300'}`}
          title="Eraser"
        >
           <Eraser size={18} />
        </button>

        <div className="w-[1px] h-6 bg-gray-400"></div>

        {/* Size */}
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold">Size:</span>
           <input 
             type="range" 
             min="1" 
             max="50" 
             value={brushSize} 
             onChange={(e) => setBrushSize(Number(e.target.value))}
             className="w-24 accent-blue-600"
           />
           <span className="text-xs w-4">{brushSize}</span>
        </div>

        <div className="flex-1"></div>

        <button onClick={clearCanvas} className="p-1.5 hover:bg-red-200 hover:text-red-600 rounded" title="Clear All">
           <Trash2 size={18} />
        </button>
        <button onClick={saveImage} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-bold">
           <Download size={16} /> Save
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden bg-gray-300 p-4 flex items-center justify-center cursor-crosshair relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          onMouseMove={draw}
          className="bg-white shadow-xl touch-none max-w-full max-h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
