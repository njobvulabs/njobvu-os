
import React, { useState, useEffect, useRef } from 'react';
import { Cpu, CircuitBoard, Wifi, HardDrive, List, XOctagon } from 'lucide-react';
import { useOS } from '../../context/OSContext';

export const SystemMonitorApp: React.FC = () => {
  const { processes, killProcess } = useOS();
  const [activeTab, setActiveTab] = useState<'resources' | 'processes'>('resources');
  
  // Real Resource State calculated from processes
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const [cpuUsage, setCpuUsage] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [networkIn, setNetworkIn] = useState(0);
  const [networkOut, setNetworkOut] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate RAM
      const totalRam = processes.reduce((acc, p) => acc + p.memoryUsage, 0) + 1024; // Base overhead
      setRamUsage(totalRam);

      // Simulate CPU load
      const baseLoad = 5;
      const processLoad = processes.reduce((acc) => acc + (Math.random() * 8 + 2), 0); // Less aggressive variance
      const totalLoad = Math.min(100, baseLoad + processLoad + (Math.random() * 5 - 2)); // Add jitter
      
      setCpuUsage(totalLoad);
      setCpuHistory(prev => [...prev.slice(1), totalLoad]);

      // Network traffic
      const hasNetworkApp = processes.some(p => p.name.includes('Browser'));
      if (hasNetworkApp) {
          setNetworkIn(Math.floor(Math.random() * 500) + 50);
          setNetworkOut(Math.floor(Math.random() * 100) + 10);
      } else {
          setNetworkIn(0);
          setNetworkOut(0);
      }

    }, 1000);
    return () => clearInterval(interval);
  }, [processes]);

  // Draw Graph
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=0; i<width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
      for(let i=0; i<height; i+=20) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
      ctx.stroke();

      // Line
      ctx.strokeStyle = '#3b82f6'; // Blue-500
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const step = width / (cpuHistory.length - 1);
      
      cpuHistory.forEach((val, i) => {
          const x = i * step;
          const y = height - (val / 100) * height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fill();

  }, [cpuHistory]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-200 font-mono text-sm">
      {/* Tab Header */}
      <div className="flex bg-[#252525] border-b border-[#3c3c3c]">
         <button 
           onClick={() => setActiveTab('resources')}
           className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'resources' ? 'bg-[#3c3c3c] text-blue-400 font-bold border-b-2 border-blue-400' : 'hover:bg-[#333]'}`}
         >
            <Cpu size={16} /> Resources
         </button>
         <button 
           onClick={() => setActiveTab('processes')}
           className={`px-4 py-2 flex items-center gap-2 ${activeTab === 'processes' ? 'bg-[#3c3c3c] text-blue-400 font-bold border-b-2 border-blue-400' : 'hover:bg-[#333]'}`}
         >
            <List size={16} /> Processes ({processes.length})
         </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'resources' ? (
          <div className="space-y-6">
            {/* CPU Section */}
            <div className="bg-[#2b2b2b] p-4 rounded border border-[#3c3c3c]">
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Cpu size={20} />
                    <span className="font-bold text-lg">CPU History</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round(cpuUsage)}%</div>
              </div>
              <div className="h-32 w-full bg-[#1a1a1a] rounded overflow-hidden border border-[#333] relative">
                  <canvas ref={canvasRef} width={500} height={128} className="w-full h-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Memory Section */}
                <div className="bg-[#2b2b2b] p-4 rounded border border-[#3c3c3c]">
                    <div className="flex items-center gap-2 mb-4 text-purple-400">
                        <CircuitBoard size={20} />
                        <span className="font-bold">Memory</span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-gray-400">4.0 GB Total</span>
                        <span className="text-xl font-bold text-purple-200">{(ramUsage / 1024).toFixed(1)} GB</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min(100, (ramUsage / 4096) * 100)}%` }} />
                    </div>
                </div>

                {/* Swap/Storage */}
                <div className="bg-[#2b2b2b] p-4 rounded border border-[#3c3c3c]">
                    <div className="flex items-center gap-2 mb-4 text-orange-400">
                        <HardDrive size={20} />
                        <span className="font-bold">Storage / Swap</span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1"><span>Swap</span><span>0%</span></div>
                            <div className="h-1 bg-[#1a1a1a] rounded-full"><div className="h-full bg-orange-500" style={{ width: '0%' }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1"><span>Disk (/)</span><span>81%</span></div>
                            <div className="h-1 bg-[#1a1a1a] rounded-full"><div className="h-full bg-orange-500" style={{ width: '81%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Network Section */}
            <div className="bg-[#2b2b2b] p-4 rounded border border-[#3c3c3c]">
                <div className="flex items-center gap-2 mb-4 text-green-400">
                    <Wifi size={20} />
                    <span className="font-bold">Network Activity</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Download</span>
                        <span className="text-xl font-mono font-bold">{networkIn} <span className="text-sm text-gray-400">KB/s</span></span>
                    </div>
                    <div className="flex flex-col items-center border-l border-[#3c3c3c]">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Upload</span>
                        <span className="text-xl font-mono font-bold">{networkOut} <span className="text-sm text-gray-400">KB/s</span></span>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
             <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2 py-1 border-b border-[#3c3c3c] mb-2 sticky top-0 bg-[#1e1e1e]">
                <div className="col-span-5">Process Name</div>
                <div className="col-span-2 text-right">PID</div>
                <div className="col-span-2 text-right">CPU</div>
                <div className="col-span-2 text-right">Mem</div>
                <div className="col-span-1"></div>
             </div>
             <div className="flex-1 overflow-y-auto">
                {processes.map(proc => (
                  <div key={proc.pid} className="grid grid-cols-12 gap-2 items-center text-sm px-2 py-2 hover:bg-[#2b2b2b] rounded border border-transparent hover:border-[#3c3c3c] group transition-colors">
                     <div className="col-span-5 font-bold flex items-center gap-2 text-gray-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                        {proc.name}
                     </div>
                     <div className="col-span-2 text-right text-gray-500 font-mono">{proc.pid}</div>
                     <div className="col-span-2 text-right font-mono text-blue-300">{proc.cpuUsage}%</div>
                     <div className="col-span-2 text-right font-mono text-purple-300">{proc.memoryUsage} MB</div>
                     <div className="col-span-1 flex justify-end">
                        <button 
                          onClick={() => killProcess(proc.pid)}
                          className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-600 transition-colors"
                          title="End Task"
                        >
                           <XOctagon size={14} />
                        </button>
                     </div>
                  </div>
                ))}
                {processes.length === 0 && <div className="text-center text-gray-500 mt-10 italic">No active processes</div>}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
