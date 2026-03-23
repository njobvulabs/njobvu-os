
import React, { useEffect, useRef, useState } from 'react';
import { useOS } from '../../context/OSContext';

export const Screensaver: React.FC = () => {
  const { exitScreensaver } = useOS();
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [vel, setVel] = useState({ dx: 2, dy: 2 });
  const [color, setColor] = useState('text-blue-500');
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleInteraction = () => exitScreensaver();
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('mousedown', handleInteraction);
    
    return () => {
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('mousedown', handleInteraction);
    };
  }, [exitScreensaver]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => {
        const nextX = prev.x + vel.dx;
        const nextY = prev.y + vel.dy;
        const bounds = containerRef.current?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
        
        let newDx = vel.dx;
        let newDy = vel.dy;
        let newColor = color;

        if (nextX + 150 >= bounds.width || nextX <= 0) {
            newDx = -vel.dx;
            newColor = getRandomColor();
        }
        if (nextY + 50 >= bounds.height || nextY <= 0) {
            newDy = -vel.dy;
            newColor = getRandomColor();
        }

        if (newDx !== vel.dx || newDy !== vel.dy) {
            setVel({ dx: newDx, dy: newDy });
            setColor(newColor);
        }

        return { x: nextX, y: nextY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [vel, color]);

  const getRandomColor = () => {
      const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-purple-500', 'text-yellow-500', 'text-pink-500'];
      return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100000] bg-black flex overflow-hidden cursor-none">
       <div 
         className={`absolute font-bold text-4xl select-none ${color}`}
         style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
       >
          Njobvu OS
       </div>
    </div>
  );
};
