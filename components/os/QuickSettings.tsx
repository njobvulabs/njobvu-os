
import React from 'react';
import { Wifi, Bluetooth, Moon, Sun, Volume2, Monitor, Battery, Mic, Settings, Plane, Accessibility } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppId } from '../../types';

interface QuickSettingsProps {
    onClose: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({ onClose }) => {
    const { systemSettings, updateSystemSettings, openApp, theme, setTheme } = useOS();

    const toggleWifi = () => updateSystemSettings({ wifiEnabled: !systemSettings.wifiEnabled });
    const toggleBluetooth = () => updateSystemSettings({ bluetoothEnabled: !systemSettings.bluetoothEnabled });
    const toggleNightLight = () => updateSystemSettings({ nightLight: !systemSettings.nightLight });
    
    const toggleTheme = () => {
        setTheme({ ...theme, mode: theme.mode === 'dark' ? 'light' : 'dark' });
    };

    const isDark = theme.mode === 'dark';
    const bgStyle = {
        backgroundColor: isDark 
            ? `rgba(32, 32, 32, ${systemSettings.menuOpacity / 100})` 
            : `rgba(240, 240, 240, ${systemSettings.menuOpacity / 100})`,
        backdropFilter: systemSettings.enableBlur && systemSettings.menuOpacity < 100 ? 'blur(16px)' : 'none'
    };

    return (
        <div 
            className={`absolute bottom-12 right-2 w-96 border ${isDark ? 'border-white/10 text-gray-200' : 'border-gray-300 text-gray-800'} rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 zoom-in-95 z-[100]`}
            style={bgStyle}
        >
            {/* Toggles Grid (Win 11 Style) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <ToggleCapsule 
                    active={systemSettings.wifiEnabled} 
                    icon={<Wifi size={20} />} 
                    label="Wi-Fi" 
                    onClick={toggleWifi} 
                    isDark={isDark}
                />
                <ToggleCapsule 
                    active={systemSettings.bluetoothEnabled} 
                    icon={<Bluetooth size={20} />} 
                    label="Bluetooth" 
                    onClick={toggleBluetooth} 
                    isDark={isDark}
                />
                <ToggleCapsule 
                    active={false} 
                    icon={<Plane size={20} />} 
                    label="Airplane" 
                    onClick={() => {}} 
                    isDark={isDark}
                />
                <ToggleCapsule 
                    active={theme.mode === 'dark'} 
                    icon={theme.mode === 'dark' ? <Moon size={20} /> : <Sun size={20} />} 
                    label="Theme" 
                    onClick={toggleTheme} 
                    isDark={isDark}
                />
                <ToggleCapsule 
                    active={systemSettings.nightLight} 
                    icon={<Monitor size={20} />} 
                    label="Night Light" 
                    onClick={toggleNightLight} 
                    isDark={isDark}
                />
                <ToggleCapsule 
                    active={false} 
                    icon={<Accessibility size={20} />} 
                    label="Accessibility" 
                    onClick={() => {}} 
                    isDark={isDark}
                />
            </div>

            {/* Sliders */}
            <div className="space-y-6 mb-4">
                <div className="flex items-center gap-4">
                    <Sun size={20} className="opacity-70" />
                    <input 
                        type="range" 
                        min="20" max="100" 
                        value={systemSettings.brightness}
                        onChange={(e) => updateSystemSettings({ brightness: Number(e.target.value) })}
                        className="flex-1 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Volume2 size={20} className="opacity-70" />
                    <input 
                        type="range" 
                        min="0" max="100" 
                        value={systemSettings.volume}
                        onChange={(e) => updateSystemSettings({ volume: Number(e.target.value) })}
                        className="flex-1 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-300'} mt-2`}>
                <div className="flex items-center gap-2 text-xs opacity-70 font-medium">
                    <Battery size={16} className="text-green-500" /> 85% remaining
                </div>
                <button 
                    onClick={() => { openApp(AppId.SETTINGS); onClose(); }} 
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="All Settings"
                >
                    <Settings size={18} />
                </button>
            </div>
        </div>
    );
};

const ToggleCapsule: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void, isDark: boolean }> = ({ active, icon, label, onClick, isDark }) => (
    <div className="flex flex-col items-center gap-1">
        <button 
            onClick={onClick}
            className={`w-full aspect-[2/1] rounded-full transition-all border flex items-center justify-center ${active ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : `${isDark ? 'bg-[#333] border-transparent text-gray-300 hover:bg-[#3c3c3c]' : 'bg-gray-200 border-transparent text-gray-700 hover:bg-gray-300'}`}`}
        >
            {icon}
        </button>
        <span className="text-[10px] font-medium opacity-70 truncate w-full text-center">{label}</span>
    </div>
);
