import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { X, GripHorizontal, StickyNote } from 'lucide-react';

const WidgetFrame: React.FC<{ id: string; x: number; y: number; children: React.ReactNode }> = ({ id, x, y, children }) => {
  const { updateWidgetPosition, removeWidget } = useOS();
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setOffset({ x: e.clientX - x, y: e.clientY - y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateWidgetPosition(id, e.clientX - offset.x, e.clientY - offset.y);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, id, offset, updateWidgetPosition]);

  return (
    <div 
      className="absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-white flex flex-col group transition-transform active:scale-105"
      style={{ left: x, top: y, zIndex: 0 }}
    >
       <div className="absolute top-0 left-0 w-full h-6 flex justify-end items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="cursor-move text-white/50 hover:text-white mr-auto pl-1" onMouseDown={handleMouseDown}><GripHorizontal size={14} /></div>
          <button onClick={() => removeWidget(id)} className="text-white/50 hover:text-red-400"><X size={14} /></button>
       </div>
       <div className="mt-4 p-4">
         {children}
       </div>
    </div>
  );
};

export const DesktopWidgets: React.FC = () => {
  const { widgets } = useOS();

  return (
    <>
      {widgets.map(widget => {
        if (widget.type === 'clock') return <WidgetFrame key={widget.id} {...widget}><ClockWidget /></WidgetFrame>;
        if (widget.type === 'calendar') return <WidgetFrame key={widget.id} {...widget}><CalendarWidget /></WidgetFrame>;
        if (widget.type === 'notes') return <WidgetFrame key={widget.id} {...widget}><NotesWidget /></WidgetFrame>;
        return null;
      })}
    </>
  );
};

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  return (
    <div className="text-center min-w-[150px]">
       <div className="text-4xl font-bold font-mono">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
       <div className="text-sm opacity-80">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
    </div>
  );
};

const CalendarWidget: React.FC = () => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return (
    <div className="w-[200px]">
      <div className="font-bold mb-2 text-center border-b border-white/10 pb-1">{now.toLocaleString('default', { month: 'long' })}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div key={i} className={`p-1 rounded-full ${i + 1 === now.getDate() ? 'bg-blue-600 font-bold' : ''}`}>{i + 1}</div>
        ))}
      </div>
    </div>
  );
};

const NotesWidget: React.FC = () => {
  return (
    <div className="w-[180px] h-[120px] relative">
      <StickyNote className="absolute -top-1 -left-1 opacity-20" size={40} />
      <textarea 
        className="w-full h-full bg-transparent resize-none outline-none text-sm placeholder-white/50"
        placeholder="Type a note..."
      />
    </div>
  );
};