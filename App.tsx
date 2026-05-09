
import React, { useState, useEffect } from 'react';
import { OSProvider } from './context/OSContext';
import { DesktopEnvironment } from './components/os/DesktopEnvironment';
import { UserAuth } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Force guest user login
    const guestUser: UserAuth = {
      id: 'guest-id',
      username: 'Guest',
      isLoggedIn: true,
      type: 'guest',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`
    };
    setUser(guestUser);
    
    // Simulate boot delay
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleShutdown = () => {
      window.location.reload();
  };

  if (!isReady || !user) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase tracking-[0.3em] animate-pulse">Initializing Njobvu OS...</p>
        </div>
      </div>
    );
  }

  return (
    <OSProvider initialUser={user} onShutdown={handleShutdown}>
        <DesktopEnvironment onExit={handleShutdown} />
    </OSProvider>
  );
};

export default App;
