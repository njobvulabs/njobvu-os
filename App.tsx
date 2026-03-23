
import React, { useState, useEffect } from 'react';
import { OSProvider } from './context/OSContext';
import { DesktopEnvironment } from './components/os/DesktopEnvironment';
import { UserAuth } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
        const authenticatedUser: UserAuth = {
            id: session.user.id,
            username: username,
            email: session.user.email,
            isLoggedIn: true,
            type: 'admin',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        };
        setUser(authenticatedUser);
      } else {
        // Default to guest user if no session
        const guestUser: UserAuth = {
          id: 'guest-id',
          username: 'Guest',
          isLoggedIn: true,
          type: 'guest',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`
        };
        setUser(guestUser);
      }
      setIsReady(true);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
       if (!session) {
         // If logged out, revert to guest
         const guestUser: UserAuth = {
           id: 'guest-id',
           username: 'Guest',
           isLoggedIn: true,
           type: 'guest',
           avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`
         };
         setUser(guestUser);
       } else {
          const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
          const authenticatedUser: UserAuth = {
              id: session.user.id,
              username: username,
              email: session.user.email,
              isLoggedIn: true,
              type: 'admin',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
          };
          setUser(authenticatedUser);
       }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleShutdown = () => {
      // In a real OS this might do more, here we just reset or could close window
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
