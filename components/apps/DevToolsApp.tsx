import React, { useState } from 'react';
import { Play, Trash2, Code } from 'lucide-react';

export const DevToolsApp: React.FC = () => {
  const [code, setCode] = useState('// Write JS here\nconsole.log("Hello World");\nreturn 42;');
  const [output, setOutput] = useState<any[]>([]);

  const runCode = () => {
    setOutput([]);
    const originalLog = console.log;
    const logs: any[] = [];
    
    // Intercept logs
    console.log = (...args) => {
      logs.push(args.map(a => JSON.stringify(a)).join(' '));
      setOutput([...logs]);
    };

    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();
      if (result !== undefined) {
         logs.push(`Return: ${result}`);
      }
    } catch (e: any) {
      logs.push(`Error: ${e.message}`);
    }

    setOutput(logs);
    console.log = originalLog;
  };

  return (
    <div className="flex h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm">
      <div className="flex-1 flex flex-col border-r border-[#3c3c3c]">
         <div className="bg-[#252525] p-2 flex justify-between items-center border-b border-[#3c3c3c]">
            <span className="font-bold flex items-center gap-2"><Code size={14} /> Editor.js</span>
            <button onClick={runCode} className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors">
               <Play size={12} /> Run
            </button>
         </div>
         <textarea 
           className="flex-1 w-full bg-[#1e1e1e] p-4 outline-none resize-none text-blue-300"
           value={code}
           onChange={e => setCode(e.target.value)}
           spellCheck={false}
         />
      </div>
      <div className="w-1/3 flex flex-col">
         <div className="bg-[#252525] p-2 flex justify-between items-center border-b border-[#3c3c3c]">
            <span className="font-bold">Console Output</span>
            <button onClick={() => setOutput([])} className="text-gray-400 hover:text-white"><Trash2 size={14} /></button>
         </div>
         <div className="flex-1 p-2 overflow-y-auto bg-[#151515]">
            {output.map((log, i) => (
               <div key={i} className="mb-1 border-b border-gray-800 pb-1 break-words">
                  {log.startsWith('Error') ? <span className="text-red-500">{log}</span> : <span className="text-green-400">{log}</span>}
               </div>
            ))}
            {output.length === 0 && <span className="text-gray-600 italic">No output</span>}
         </div>
      </div>
    </div>
  );
};
