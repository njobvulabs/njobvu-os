
import React from 'react';
import { Download, Star, Search } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { FSNode } from '../../types';

const FEATURED_APPS = [
  { name: 'VS Code Web', cat: 'Dev', rating: 4.9, size: '50MB' },
  { name: 'Spotify', cat: 'Music', rating: 4.7, size: '120MB' },
  { name: 'Discord', cat: 'Social', rating: 4.8, size: '90MB' },
  { name: 'GIMP', cat: 'Graphics', rating: 4.5, size: '300MB' },
  { name: 'VLC', cat: 'Video', rating: 4.8, size: '40MB' },
  { name: 'Chrome', cat: 'Web', rating: 4.6, size: '200MB' },
];

export const StoreApp: React.FC<{ windowId: string }> = () => {
  const { fs, createFile, addNotification } = useOS();

  const handleInstall = (appName: string) => {
      // Simulate installation by creating a file in bin
      const binId = (Object.values(fs.nodes) as FSNode[]).find(n => n.name === 'bin')?.id;
      if (binId) {
          createFile(binId, `${appName}.app`, `Application executable for ${appName}\nBinary content placeholder.`);
          addNotification('Store', `Successfully installed ${appName}`, 'success');
      } else {
          addNotification('Store', 'Installation failed: System bin not found', 'error');
      }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 font-sans">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
         <h1 className="text-2xl font-bold text-gray-800">Njobvu Store</h1>
         <div className="relative">
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
            <input className="bg-white border rounded-full pl-10 pr-4 py-1 text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Search apps..." />
         </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
         <h2 className="text-3xl font-bold mb-2">Discover the Future</h2>
         <p className="opacity-90">Essential apps for your virtual workspace.</p>
      </div>

      {/* Grid */}
      <div className="p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1">
         {FEATURED_APPS.map((app, i) => (
           <div key={i} className="border rounded-xl p-4 hover:shadow-lg transition-shadow bg-white flex flex-col gap-3">
              <div className="flex gap-4">
                 <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                 <div>
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-xs text-gray-500">{app.cat}</p>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                       <Star size={12} fill="currentColor" /> {app.rating}
                    </div>
                 </div>
              </div>
              <p className="text-xs text-gray-400">{app.size} • Free</p>
              <button 
                onClick={() => handleInstall(app.name)}
                className="bg-blue-100 text-blue-700 py-1.5 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                 <Download size={14} /> Install
              </button>
           </div>
         ))}
      </div>
    </div>
  );
};