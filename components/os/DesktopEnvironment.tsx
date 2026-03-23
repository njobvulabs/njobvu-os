
import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Taskbar } from './Taskbar';
import { WindowFrame } from './WindowFrame';
import { DesktopIcons } from './DesktopIcons';
import { DesktopWidgets } from './DesktopWidgets';
import { GlobalSearch } from './GlobalSearch';
import { SystemCopilot } from './SystemCopilot';
import { Notifications } from './Notifications';
import { AppId, Theme } from '../../types';
import { Terminal, Image, Settings, Grid, Plus, FolderPlus, FilePlus, Maximize, Monitor, X, Command } from 'lucide-react';

import { BootScreen } from '../sys/BootScreen';
import { LoginScreen } from '../sys/LoginScreen';
import { ShutdownScreen } from '../sys/ShutdownScreen';
import { LockScreen } from '../sys/LockScreen';
import { Screensaver } from '../sys/Screensaver';

const ContextMenu: React.FC<{ 
  x: number; 
  y: number; 
  onClose: () => void;
  theme: Theme; 
}> = ({ x, y, onClose, theme }) => {
  const { openApp, createFile, createDir, fs, addDesktopIcon, arrangeDesktopIcons } = useOS();
  const isDark = theme.mode === 'dark';

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };
  
  const handleCreateLauncher = () => {
      const name = prompt("Launcher Name:", "New Link");
      const url = prompt("URL or Command:", "https://google.com");
      if (name && url) {
          addDesktopIcon({
              id: `lnk-${Date.now()}`,
              appId: 'launcher',
              label: name,
              x: x,
              y: y,
              action: () => {
                  if (url.startsWith('http')) window.open(url, '_blank');
                  else alert(`Execute: ${url}`);
              }
          });
      }
      onClose();
  };

  const bgClass = isDark ? 'bg-[#2b2b2b] text-gray-200 border-[#3c3c3c]' : 'bg-white text-gray-800 border-gray-300';
  const hoverClass = 'hover:bg-blue-500 hover:text-white';
  const dividerClass = isDark ? 'bg-[#3c3c3c]' : 'bg-gray-200';

  return (
    <div 
      className={`fixed z-[9999] w-56 ${bgClass} border shadow-xl rounded-sm py-1 text-[11px] font-medium animate-in fade-in duration-100`}
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
    >
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(handleCreateLauncher)}>
         <Plus size={14} /> Create Launcher...
       </button>
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(() => {const n=prompt("Folder:"); if(n) createDir(fs.rootId, n);})}>
         <FolderPlus size={14} /> Create Folder...
       </button>
        <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(() => {const n=prompt("File:"); if(n) createFile(fs.rootId, n, "");})}>
         <FilePlus size={14} /> Create Document...
       </button>
       <div className={`h-[1px] ${dividerClass} my-1`}></div>
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(() => openApp(AppId.TERMINAL))}>
         <Terminal size={14} /> Open Terminal Here
       </button>
       <div className={`h-[1px] ${dividerClass} my-1`}></div>
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(arrangeDesktopIcons)}>
         <Grid size={14} /> Arrange Icons
       </button>
       <div className={`h-[1px] ${dividerClass} my-1`}></div>
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(() => openApp(AppId.SETTINGS))}>
         <Image size={14} /> Desktop Settings...
       </button>
       <button className={`w-full text-left px-3 py-1.5 ${hoverClass} flex items-center gap-2`} onClick={() => handleAction(() => openApp(AppId.SETTINGS))}>
         <Settings size={14} /> Applications...
       </button>
    </div>
  );
};

export const DesktopEnvironment: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { windows, wallpaper, refreshKey, powerState, loginUser, currentUser, systemSettings, theme, openApp, toggleSearch, shutdownSystem } = useOS();
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
        // Alt + F2: Global Search (Runner)
        if (e.altKey && e.key === 'F2') {
            e.preventDefault();
            toggleSearch(true);
        }
        // Ctrl + Alt + T: Terminal
        if (e.ctrlKey && e.altKey && e.key === 't') {
            e.preventDefault();
            openApp(AppId.TERMINAL);
        }
        // Ctrl + Alt + Del: Logout Dialog
        if (e.ctrlKey && e.altKey && e.key === 'Delete') {
            e.preventDefault();
            if(confirm("Log out of current session?")) shutdownSystem();
        }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [toggleSearch, openApp, shutdownSystem]);

  useEffect(() => {
    setMounted(true);
    if (!document.fullscreenElement) {
        const timer = setTimeout(() => setShowFullscreenPrompt(true), 2000);
        return () => clearTimeout(timer);
    }
  }, []);

  const requestFullscreen = async () => {
      try {
          await document.documentElement.requestFullscreen();
          setShowFullscreenPrompt(false);
      } catch (e) {
          setShowFullscreenPrompt(false); 
      }
  };

  if (!mounted) return null;
  if (powerState === 'shutdown') return <ShutdownScreen />;
  if (powerState === 'booting') return <BootScreen onComplete={() => loginUser(currentUser.username)} />; 
  if (powerState === 'login') return <LoginScreen />;
  if (powerState === 'screensaver') return <Screensaver />;

  return (
    <div 
      className="w-full h-screen relative overflow-hidden bg-cover bg-center select-none animate-fade-in"
      style={{ 
        backgroundImage: `url(${wallpaper})`,
        filter: `brightness(${systemSettings.brightness}%) ${systemSettings.nightLight ? 'sepia(30%)' : ''}`
      }}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
      onClick={() => contextMenu && setContextMenu(null)}
      key={refreshKey}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

      <div className="absolute bottom-12 right-4 md:bottom-10 md:right-10 text-white/5 font-bold text-3xl md:text-8xl pointer-events-none select-none italic">
        Njobvu OS
      </div>

      <Taskbar />
      <Notifications />
      <GlobalSearch />
      <SystemCopilot />
      
      {powerState === 'lock' && (
          <div className="fixed inset-0 z-[99999]"><LockScreen /></div>
      )}

      {showFullscreenPrompt && (
          <div className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl text-center border border-white/10 max-w-sm w-full animate-in zoom-in-95">
                  <Monitor size={48} className="text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Immersive Mode</h2>
                  <p className="text-gray-400 text-xs mb-6 leading-relaxed">Njobvu OS works best when the browser toolbar is hidden. Experience the full compositor features in fullscreen.</p>
                  <div className="flex flex-col gap-2">
                      <button onClick={requestFullscreen} className="w-full py-2.5 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors flex items-center justify-center gap-2"><Maximize size={16} /> Go Fullscreen</button>
                      <button onClick={() => setShowFullscreenPrompt(false)} className="w-full py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-300 transition-colors">Maybe later</button>
                  </div>
              </div>
          </div>
      )}
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
            <DesktopIcons />
            <DesktopWidgets />
            {windows.map((win) => (
            <WindowFrame key={win.id} windowState={win} />
            ))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} theme={theme} onClose={() => setContextMenu(null)} />
      )}
    </div>
  );
};
