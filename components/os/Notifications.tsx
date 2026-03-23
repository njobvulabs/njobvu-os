
import React from 'react';
import { useOS } from '../../context/OSContext';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, dismissNotification, theme } = useOS();

  const isDark = theme.mode === 'dark';

  return (
    <div className="fixed top-16 right-4 z-[999999] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            w-80 pointer-events-auto rounded-lg shadow-xl border backdrop-blur-md overflow-hidden
            animate-in slide-in-from-right duration-300
            ${isDark ? 'bg-gray-800/90 border-gray-700 text-white' : 'bg-white/90 border-gray-200 text-gray-800'}
          `}
        >
          <div className="flex p-3 gap-3">
            <div className="shrink-0 mt-0.5">
                {notif.type === 'info' && <Info size={20} className="text-blue-500" />}
                {notif.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                {notif.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
                {notif.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm leading-tight mb-1">{notif.title}</h4>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{notif.message}</p>
            </div>
            <button 
                onClick={() => dismissNotification(notif.id)}
                className={`shrink-0 p-1 rounded-md transition-colors h-fit ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'}`}
            >
                <X size={14} />
            </button>
          </div>
          {/* Progress bar for auto-dismiss */}
          <div className="h-1 w-full bg-gray-200/20">
             <div className={`h-full animate-progress-shrink ${
                 notif.type === 'error' ? 'bg-red-500' : 
                 notif.type === 'success' ? 'bg-green-500' : 
                 notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
             }`} style={{ animationDuration: '5s' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
