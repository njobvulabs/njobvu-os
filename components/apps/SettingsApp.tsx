import React, { useState } from 'react';
import { Monitor, Info, Palette, LayoutTemplate, AppWindow, Keyboard, Layers, ShieldCheck, ArrowLeft, Search, Check, Smartphone } from 'lucide-react';
import { useOS } from '../../context/OSContext';

const WALLPAPERS = [
  { name: 'Njobvu Hills', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Midnight City', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop' },
  { name: 'Deep Space', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
  { name: 'Abstract Blue', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop' }
];

const ACCENT_COLORS = [
  { id: 'blue', hex: '#3b82f6' },
  { id: 'purple', hex: '#8b5cf6' },
  { id: 'emerald', hex: '#10b981' },
  { id: 'orange', hex: '#f59e0b' },
  { id: 'red', hex: '#ef4444' },
];

type TabId = 'home' | 'appearance' | 'panel' | 'wm' | 'workspaces' | 'display' | 'keyboard' | 'privacy' | 'about';

export const SettingsApp: React.FC = () => {
  const { wallpaper, setWallpaper, theme, setTheme, systemSettings, updateSystemSettings } = useOS();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [search, setSearch] = useState('');

  const isDark = theme.mode === 'dark';
  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-[#f0f0f0]';
  const bgCard = isDark ? 'bg-[#2b2b2b]' : 'bg-white';
  const borderCol = isDark ? 'border-white/5' : 'border-gray-300';
  const textMain = isDark ? 'text-gray-200' : 'text-gray-800';

  const SettingCard = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <button onClick={onClick} className={`${bgCard} hover:brightness-110 border ${borderCol} p-4 rounded-xl flex flex-col items-center gap-3 transition-all active:scale-95 group shadow-sm`}>
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );

  const renderHome = () => (
      <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                className={`w-full ${bgCard} border ${borderCol} rounded pl-9 pr-4 py-3 text-sm outline-none focus:border-blue-500 transition-all shadow-inner`}
                placeholder="Search settings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SettingCard icon={<Palette className="text-blue-500"/>} label="Appearance" onClick={() => setActiveTab('appearance')} />
              <SettingCard icon={<LayoutTemplate className="text-gray-400"/>} label="Panel" onClick={() => setActiveTab('panel')} />
              <SettingCard icon={<AppWindow className="text-indigo-500"/>} label="Windows" onClick={() => setActiveTab('wm')} />
              <SettingCard icon={<Monitor className="text-emerald-500"/>} label="Display" onClick={() => setActiveTab('display')} />
              <SettingCard icon={<Keyboard className="text-orange-500"/>} label="Keyboard" onClick={() => setActiveTab('keyboard')} />
              <SettingCard icon={<Layers className="text-cyan-500"/>} label="Workspaces" onClick={() => setActiveTab('workspaces')} />
              <SettingCard icon={<ShieldCheck className="text-green-500"/>} label="Privacy" onClick={() => setActiveTab('privacy')} />
              <SettingCard icon={<Info className="text-gray-500"/>} label="About" onClick={() => setActiveTab('about')} />
          </div>
      </div>
  );

  return (
    <div className={`flex flex-col h-full ${bgMain} ${textMain} font-sans select-none overflow-hidden`}>
      <div className={`h-12 flex items-center px-4 gap-3 border-b ${borderCol} bg-black/5`}>
          {activeTab !== 'home' && (
              <button onClick={() => setActiveTab('home')} className="p-1 hover:bg-white/10 rounded transition-colors"><ArrowLeft size={20} /></button>
          )}
          <h1 className="font-bold text-sm uppercase tracking-widest">{activeTab === 'home' ? 'Settings' : activeTab.toUpperCase()}</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'home' && renderHome()}

          {activeTab === 'appearance' && (
              <div className="p-8 space-y-8 animate-in slide-in-from-right">
                  <section>
                      <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Desktop Wallpaper</h3>
                      <div className="grid grid-cols-2 gap-4">
                          {WALLPAPERS.map(wp => (
                              <button key={wp.name} onClick={() => setWallpaper(wp.url)} className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${wallpaper === wp.url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'}`}>
                                  <img src={wp.url} className="w-full h-full object-cover" alt={wp.name} />
                                  <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors flex items-end p-2">
                                      <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded">{wp.name}</span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </section>
                  <section>
                      <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">System Theme</h3>
                      <div className="flex gap-4">
                          <button onClick={() => setTheme({...theme, mode: 'dark'})} className={`flex-1 py-4 rounded-xl border ${theme.mode === 'dark' ? 'bg-blue-600 border-blue-500 text-white' : `${bgCard} ${borderCol}`} font-bold`}>Dark Mode</button>
                          <button onClick={() => setTheme({...theme, mode: 'light'})} className={`flex-1 py-4 rounded-xl border ${theme.mode === 'light' ? 'bg-blue-600 border-blue-500 text-white' : `${bgCard} ${borderCol}`} font-bold`}>Light Mode</button>
                      </div>
                  </section>
                  <section>
                      <h3 className="text-xs font-black text-gray-500 uppercase mb-4 tracking-widest">Accent Color</h3>
                      <div className="flex gap-3">
                          {ACCENT_COLORS.map(c => (
                              <button key={c.id} onClick={() => setTheme({...theme, accentColor: c.id})} className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-lg" style={{ backgroundColor: c.hex }}>
                                  {theme.accentColor === c.id && <Check size={20} className="text-white" />}
                              </button>
                          ))}
                      </div>
                  </section>
              </div>
          )}

          {activeTab === 'panel' && (
              <div className="p-8 space-y-6 animate-in slide-in-from-right">
                  <div className={`${bgCard} p-6 rounded-xl border ${borderCol} space-y-6 shadow-lg`}>
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-bold">Panel Position</label>
                          <select value={systemSettings.panelPosition} onChange={e => updateSystemSettings({panelPosition: e.target.value as any})} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs">
                              <option value="top">Top</option>
                              <option value="bottom">Bottom</option>
                          </select>
                      </div>
                      <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold uppercase text-gray-500"><span>Panel Size</span><span>{systemSettings.panelSize}px</span></div>
                          <input type="range" min="32" max="64" value={systemSettings.panelSize} onChange={e => updateSystemSettings({panelSize: Number(e.target.value)})} className="w-full accent-blue-500" />
                      </div>
                      <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold uppercase text-gray-500"><span>Panel Opacity</span><span>{systemSettings.panelOpacity}%</span></div>
                          <input type="range" min="20" max="100" value={systemSettings.panelOpacity} onChange={e => updateSystemSettings({panelOpacity: Number(e.target.value)})} className="w-full accent-blue-500" />
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'display' && (
              <div className="p-8 space-y-6 animate-in slide-in-from-right">
                  <div className={`${bgCard} p-6 rounded-xl border ${borderCol} space-y-8 shadow-lg`}>
                        <div className="space-y-4">
                             <div className="flex justify-between items-center"><label className="text-xs font-black uppercase text-gray-500">Backlight</label><span className="text-sm font-mono font-bold text-blue-500">{systemSettings.brightness}%</span></div>
                             <input type="range" min="10" max="100" value={systemSettings.brightness} onChange={e => updateSystemSettings({brightness: Number(e.target.value)})} className="w-full accent-blue-500 h-2 bg-gray-700 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                             <div><span className="text-sm font-bold block">Blue Light Filter</span><span className="text-[10px] opacity-60">Warmer colors to help you sleep</span></div>
                             <button onClick={() => updateSystemSettings({nightLight: !systemSettings.nightLight})} className={`w-12 h-6 rounded-full p-1 transition-all ${systemSettings.nightLight ? 'bg-orange-600' : 'bg-gray-600'}`}><div className={`w-4 h-4 bg-white rounded-full transition-transform ${systemSettings.nightLight ? 'translate-x-6' : 'translate-x-0'}`} /></button>
                        </div>
                  </div>
              </div>
          )}

          {activeTab === 'about' && (
              <div className="p-12 flex flex-col items-center text-center animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8">
                      {/* Fixed: Replaced 'स्मार्टफोन' with 'Smartphone' component imported from lucide-react */}
                      <Smartphone size={48} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Njobvu OS Platinum</h2>
                  <p className="text-gray-500 mb-8 uppercase text-xs font-bold tracking-[0.3em]">Version 4.0.0-Stable</p>
                  <div className="w-full max-w-sm grid gap-3">
                      <div className={`${bgCard} border ${borderCol} p-4 rounded-xl flex justify-between`}><span className="text-gray-500 font-bold text-xs uppercase">Kernel</span><span className="font-mono text-xs">React 19.0.0-LTS</span></div>
                      <div className={`${bgCard} border ${borderCol} p-4 rounded-xl flex justify-between`}><span className="text-gray-500 font-bold text-xs uppercase">Environment</span><span className="font-mono text-xs">XFCE-Sim v4.0</span></div>
                      <div className={`${bgCard} border ${borderCol} p-4 rounded-xl flex justify-between`}><span className="text-gray-500 font-bold text-xs uppercase">Graphics</span><span className="font-mono text-xs">Tailwind WebGL</span></div>
                  </div>
                  <p className="mt-12 text-[10px] text-gray-500 font-bold uppercase tracking-widest">© 2025 Njobvu Systems International</p>
              </div>
          )}
      </div>
    </div>
  );
};