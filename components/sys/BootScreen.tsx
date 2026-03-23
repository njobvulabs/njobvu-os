import React, { useEffect, useState } from 'react';

export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const bootSequence = [
      "[  OK  ] Started Kernel.",
      "[  OK  ] Found device /dev/sda1.",
      "[  OK  ] Mounted /root filesystem.",
      "[  OK  ] Started System Logging Service.",
      "[  OK  ] Started React Runtime Environment.",
      "[  OK  ] Initializing Njobvu Graphical Interface...",
      "[  OK  ] Loading XFCE4 Window Manager Simulation...",
      "[  OK  ] Starting User Session Manager...",
      "[  OK  ] Reached target Graphical Interface."
    ];

    let delay = 0;
    bootSequence.forEach((log, index) => {
      delay += Math.random() * 400 + 100;
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === bootSequence.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
    });

    return () => {};
  }, [onComplete]);

  return (
    <div className="h-screen w-screen bg-black text-gray-400 font-mono text-sm p-8 flex flex-col justify-end overflow-hidden">
      <div className="mb-4">
        <h1 className="text-white font-bold mb-2">Njobvu OS Bootloader v2.0</h1>
        <div className="w-full h-[1px] bg-gray-700 mb-4"></div>
      </div>
      <div className="flex-1 flex flex-col justify-end">
        {logs.map((log, i) => (
          <div key={i} className="mb-1">
             <span className="text-green-500">{log.substring(0, 8)}</span>
             <span className="text-white">{log.substring(8)}</span>
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};