
import React, { useEffect, useState } from 'react';
import { Power, Loader2 } from 'lucide-react';

export const ShutdownScreen: React.FC = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1000);
    const timer2 = setTimeout(() => setStage(2), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white animate-fade-out">
      <div className="flex flex-col items-center gap-6">
        <Power size={64} className={`${stage >= 2 ? 'text-gray-800' : 'text-red-500'} transition-colors duration-1000 animate-pulse`} />
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
                {stage === 0 && "Saving session state..."}
                {stage === 1 && "Stopping system services..."}
                {stage === 2 && "System halted."}
            </h1>
            <p className="text-gray-500 text-sm">
                {stage < 2 ? "Please wait while the compositor exits." : "It is now safe to close your browser tab."}
            </p>
        </div>
        {stage < 2 && <Loader2 className="animate-spin text-blue-500" size={24} />}
      </div>
    </div>
  );
};
