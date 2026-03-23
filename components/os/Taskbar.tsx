import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS } from '../../constants';
import { AppId } from '../../types';
import { Volume2, Wifi, Battery, Search, Power, Settings as SettingsIcon, User, VolumeX, Volume1, LayoutGrid, Star, Grid, Box, Globe, Music, Briefcase, Cpu, Monitor, LogOut, ChevronRight, Terminal, Folder, X, Sparkles, Activity, Activity as PulseIcon } from 'lucide-react';
import { QuickSettings } from './QuickSettings';

const StartIcon = (props: { size: number }) => (
  <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm filter">
    <circle cx="12" cy="12" r="10" fill="url(#grad1)" />
    <path d="M7 12L10.5 15.5L17 8.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="grad1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

const LoadMonitorPlugin: React.FC<{ panelHeight: number }> = ({ panelHeight }) => {
    const { processes } = useOS();
    const [load, setLoad] = useState({ cpu: 0, mem: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const cpu = Math.floor(Math.random() * 15) + processes.length * 2;
            const mem = 30 + Math.floor(Math.random() * 10);
            setLoad({ cpu, mem });
        }, 2000);
        return () => clearInterval(interval);
    }, [processes.length]);

    const barWidth = Math.floor(panelHeight * 1.0);
    const iconSize = Math.floor(panelHeight * 0.25);

    return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 rounded border border-white/5 h-[70%] my-auto mr-2" title="System Load Monitor">
            <div className="flex flex-col gap-0.5 justify-center">
                <div style={{ width: `${barWidth}px` }} className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${load.cpu}%` }}></div>
                </div>
                <div style={{ width: `${barWidth}px` }} className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${load.mem}%` }}></div>
                </div>
            </div>
            <PulseIcon size={iconSize} className="text-gray-500" />
        </div>
    );
};

export const Taskbar: React.FC = () => {
  const { 
    windows, activeWindowId, focusWindow, minimizeWindow, minimizeAll, openApp, closeWindow,
    currentDesktop, switchDesktop,
    shutdownSystem, currentUser, addWidget, widgets, removeWidget,
    systemSettings, theme, toggleSearch, toggleCopilot, isCopilotOpen
  } = useOS();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Favorites');
  
  const [taskbarContextMenu, setTaskbarContextMenu] = useState<{ x: number, y: number, windowId?: string, type: 'item' | 'bg' } | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isMenuOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsQuickSettingsOpen(false);
  };

  const categories = [
      { id: 'Favorites', icon: Star, label: 'Favorites' },
      { id: 'All', icon: Grid, label: 'All Apps' },
      { id: 'Accessories', icon: Box, label: 'Accessories' },
      { id: 'Multimedia', icon: Music, label: 'Multimedia' },
      { id: 'Office', icon: Briefcase, label: 'Office' },
      { id: 'System', icon: Monitor, label: 'System' },
  ];
  
  const getFilteredApps = () => {
    const allApps = Object.values(APPS).sort((a, b) => a.name.localeCompare(b.name));
    if (searchQuery) return allApps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeCategory === 'Favorites') return allApps.filter(app => [AppId.FILE_MANAGER, AppId.SETTINGS, AppId.TODO_LIST, AppId.TERMINAL, AppId.SPREADSHEET, AppId.PRESENTATION].includes(app.id));
    if (activeCategory === 'All') return allApps;
    return allApps.filter(app => app.category === activeCategory);
  };

  const desktopWindows = windows.filter(w => w.desktopId === currentDesktop || w.isSticky);

  const isTop = systemSettings.panelPosition === 'top';
  const isDark = theme.mode === 'dark';
  const panelHeight = systemSettings.panelSize || 48;
  
  const menuPositionClass = isTop ? 'top-full left-0 mt-1 rounded-b-lg' : 'bottom-full left-0 mb-1 rounded-t-lg';
  const textColor = isDark ? 'text-[#e6e6e6]' : 'text-gray-900';
  const borderColor = isDark ? 'border-[#3c3c3c]' : 'border-gray-300';
  const hoverBg = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';
  
  const menuBgStyle = {
      backgroundColor: isDark ? `rgba(43, 43, 43, ${systemSettings.menuOpacity / 100})` : `rgba(240, 240, 240, ${systemSettings.menuOpacity / 100})`,
      backdropFilter: systemSettings.enableBlur && systemSettings.menuOpacity < 100 ? 'blur(12px)' : 'none',
      fontSize: `${systemSettings.menuFontSize}px`,
      width: `${systemSettings.menuWidth}px`,
      height: `${systemSettings.menuHeight}px`,
  };

  const iconSize = Math.floor(panelHeight * 0.42);

  const handleTaskbarItemClick = (e: React.MouseEvent, winId: string, isActive: boolean) => {
      if (e.button === 1) { closeWindow(winId); return; }
      if (e.button === 0) {
          if (isActive) minimizeWindow(winId);
          else focusWindow(winId);
      }
  };

  return (
    <>
      <div 
        className={`fixed w-full z-[100] shadow-md ${borderColor} flex items-center px-2 select-none group/panel transition-transform duration-300 ${isTop ? 'top-0 border-b' : 'bottom-0 border-t'}`}
        style={{ 
            height: `${panelHeight}px`,
            backgroundColor: isDark ? `rgba(30, 30, 30, ${systemSettings.panelOpacity / 100})` : `rgba(240, 240, 240, ${systemSettings.panelOpacity / 100})`,
            backdropFilter: systemSettings.enableBlur && systemSettings.panelOpacity < 100 ? 'blur(10px)' : 'none',
            color: isDark ? '#e6e6e6' : '#1a1a1a',
            transform: systemSettings.panelAutoHide && !isMenuOpen ? (isTop ? 'translateY(-95%)' : 'translateY(95%)') : 'none',
        }}
        onContextMenu={(e) => { e.preventDefault(); setTaskbarContextMenu({ x: e.clientX, y: e.clientY, type: 'bg' }); }}
      >
        {/* Start Button */}
        <div className="relative mr-2 h-full flex items-center">
          <button
            onClick={toggleMenu}
            className={`flex items-center gap-2 px-3 h-[85%] my-auto rounded transition-colors group ${isMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <StartIcon size={Math.floor(panelHeight * 0.5)} />
          </button>

          {isMenuOpen && (
            <div 
                className={`absolute border ${borderColor} shadow-2xl flex flex-col z-[101] animate-in duration-100 ${textColor} ${menuPositionClass} origin-bottom-left`}
                style={menuBgStyle}
            >
               <div className={`p-3 border-b ${borderColor} flex items-center gap-3 bg-black/10`}>
                  {systemSettings.showMenuAvatar && (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden border border-white/20 shrink-0">
                        {currentUser.avatar ? <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" /> : <User size={18} />}
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold truncate text-sm">{currentUser.username}</span>
                      <span className="text-[10px] opacity-50 uppercase font-black tracking-widest">Njobvu OS</span>
                  </div>
                  <div className="flex gap-1.5">
                      <button onClick={() => { openApp(AppId.SETTINGS); setIsMenuOpen(false); }} className={`p-1.5 rounded ${hoverBg}`} title="Settings"><SettingsIcon size={16} /></button>
                      <button onClick={shutdownSystem} className={`p-1.5 rounded hover:bg-red-500 hover:text-white transition-colors text-red-400`} title="Log Out"><LogOut size={16} /></button>
                  </div>
               </div>
               <div className="p-2 border-b border-white/5">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search apps..." 
                        className={`w-full ${isDark ? 'bg-black/30 text-white border-[#3c3c3c]' : 'bg-white text-gray-900 border-gray-300'} border rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-xs`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
               </div>
               <div className="flex flex-1 overflow-hidden">
                  <div className={`w-[140px] bg-black/10 border-r ${borderColor} flex flex-col py-1 overflow-y-auto`}>
                      {categories.map(cat => (
                          <button
                              key={cat.id}
                              onClick={() => setActiveCategory(cat.id)}
                              className={`flex items-center gap-2.5 px-3 py-2 transition-colors text-left text-[11px] font-bold ${activeCategory === cat.id ? 'bg-blue-600 text-white' : `${hoverBg} opacity-70`}`}
                          >
                              <cat.icon size={14} />
                              <span className="truncate">{cat.label}</span>
                          </button>
                      ))}
                  </div>
                  <div className={`flex-1 p-2 overflow-y-auto custom-scrollbar`}>
                      <div className="grid grid-cols-1 gap-0.5">
                          {getFilteredApps().map(app => (
                              <button
                                  key={app.id}
                                  onClick={() => { openApp(app.id); setIsMenuOpen(false); }}
                                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded hover:bg-blue-500 hover:text-white transition-colors text-left"
                              >
                                  <app.icon size={16} />
                                  <span className="font-medium truncate text-xs">{app.name}</span>
                              </button>
                          ))}
                      </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Quick Launchers */}
        <div className="hidden sm:flex items-center gap-1 mr-2">
            <button onClick={() => openApp(AppId.FILE_MANAGER)} className={`p-2 rounded ${hoverBg}`} title="File Manager"><Folder size={iconSize} /></button>
            <button onClick={() => openApp(AppId.TERMINAL)} className={`p-2 rounded ${hoverBg}`} title="Terminal"><Terminal size={iconSize} /></button>
        </div>

        <div className={`h-6 border-r ${isDark ? 'border-white/10' : 'border-black/10'} mx-2 hidden sm:block`}></div>

        {/* Task List */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50vw]">
          {desktopWindows.map((win) => {
             const AppIcon = APPS[win.appId].icon;
             const isActive = activeWindowId === win.id && !win.isMinimized;
             return (
              <button
                key={win.id}
                onClick={(e) => handleTaskbarItemClick(e, win.id, isActive)}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setTaskbarContextMenu({ x: e.clientX, y: e.clientY - 40, windowId: win.id, type: 'item' }); }}
                className={`group flex items-center gap-2.5 px-3 h-[85%] min-w-[120px] max-w-[180px] rounded transition-all border ${isActive ? 'bg-white/10 border-white/10 font-bold shadow-sm' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <AppIcon size={16} className={isActive ? 'text-blue-400' : 'opacity-70'} />
                <span className="truncate text-xs">{win.title}</span>
              </button>
             );
          })}
        </div>

        <div className="flex-1"></div>

        {/* System Load Plugin */}
        <div className="hidden md:block">
            {systemSettings.showLoadMonitor && <LoadMonitorPlugin panelHeight={panelHeight} />}
        </div>

        {/* Workspace Switcher */}
        <div className="flex items-center gap-1 mx-2 bg-black/20 p-1 rounded border border-white/5 h-[80%] my-auto">
            {Array.from({ length: systemSettings.numWorkspaces }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => switchDesktop(i)}
                    className={`w-6 md:w-7 h-full flex items-center justify-center text-[10px] rounded transition-colors ${currentDesktop === i ? 'bg-blue-600 text-white font-bold shadow-sm' : 'hover:bg-white/10 text-gray-400'}`}
                >
                    {systemSettings.workspaceNames[i] || (i + 1)}
                </button>
            ))}
        </div>

        {/* Tray & Clock */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-white/10 h-full">
            <button onClick={() => toggleCopilot()} className={`p-1.5 md:p-2 rounded transition-colors ${hoverBg} ${isCopilotOpen ? 'text-blue-400 bg-white/10' : ''}`}><Sparkles size={18}/></button>
            <button onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)} className={`p-1.5 md:p-2 rounded ${hoverBg}`}><Wifi size={18} /></button>
            <button className="flex flex-col items-center justify-center leading-none px-2 md:px-3 h-full hover:bg-white/5" onClick={() => addWidget('calendar')}>
                <span className="font-bold text-[11px] md:text-xs">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[9px] opacity-60 uppercase mt-0.5 hidden md:inline">{time.toLocaleDateString([], { weekday: 'short' })}</span>
            </button>
            <button onClick={minimizeAll} className="w-1.5 md:w-2 h-full border-l border-white/20 hover:bg-blue-500/50 transition-colors" title="Show Desktop"></button>
        </div>
      </div>
      
      {isQuickSettingsOpen && (
          <div className={`absolute right-2 ${isTop ? 'top-12' : 'bottom-12'}`}>
              <QuickSettings onClose={() => setIsQuickSettingsOpen(false)} />
          </div>
      )}

      {taskbarContextMenu && (
          <div 
             className={`fixed z-[102] w-48 ${isDark ? 'bg-[#2b2b2b] border-[#3c3c3c] text-gray-200' : 'bg-white border-gray-300 text-gray-800'} border shadow-xl rounded py-1.5 text-[11px] animate-in fade-in duration-75`}
             style={{ left: taskbarContextMenu.x, top: taskbarContextMenu.y }}
          >
              {taskbarContextMenu.type === 'item' ? (
                  <>
                    <button className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white" onClick={() => { focusWindow(taskbarContextMenu.windowId!); setTaskbarContextMenu(null); }}>Restore</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white" onClick={() => { minimizeWindow(taskbarContextMenu.windowId!); setTaskbarContextMenu(null); }}>Minimize</button>
                    <div className="h-[1px] bg-gray-500/20 my-1.5"></div>
                    <button className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white" onClick={() => { closeWindow(taskbarContextMenu.windowId!); setTaskbarContextMenu(null); }}>Close</button>
                  </>
              ) : (
                  <>
                    <button className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white" onClick={() => { openApp(AppId.SETTINGS); setTaskbarContextMenu(null); }}>Panel Settings</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white" onClick={() => { openApp(AppId.SYSTEM_MONITOR); setTaskbarContextMenu(null); }}>Task Manager</button>
                  </>
              )}
          </div>
      )}

      {(isMenuOpen || isQuickSettingsOpen || taskbarContextMenu) && <div className="fixed inset-0 z-[55]" onClick={() => { setIsMenuOpen(false); setIsQuickSettingsOpen(false); setTaskbarContextMenu(null); }}></div>}
    </>
  );
};