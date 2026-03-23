
import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { User, ArrowRight, Power, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export const LoginScreen: React.FC = () => {
  const { loginUser, shutdownSystem, rebootSystem, currentUser } = useOS();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('Incorrect password.');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // If it's a guest session (no email), we allow empty/any password or a specific mock logic
    if (currentUser.type === 'guest' && !currentUser.email) {
        setTimeout(() => {
            loginUser(currentUser.username);
        }, 500);
        return;
    }

    // Real Supabase Verification
    try {
        if (!currentUser.email) throw new Error("No email associated with account.");

        // We attempt to sign in again to verify the password.
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: password
        });

        if (authError) {
            throw authError;
        }

        // Success
        loginUser(currentUser.username, password);

    } catch (err: any) {
        setError(true);
        setErrorMsg('Invalid password');
        console.error("Login verification failed:", err);
        setLoading(false);
        setPassword('');
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center blur-md opacity-60"></div>
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="z-10 bg-black/20 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md mx-4 flex flex-col items-center border border-white/10 animate-in fade-in zoom-in duration-300">
        
        {/* Avatar */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full mb-6 p-1 border-2 border-white/20 shadow-lg relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User size={48} className="text-gray-400" />
                    </div>
                )}
            </div>
            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-black" title="Online"></div>
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-1">{currentUser.username}</h2>
        <p className="text-gray-400 text-sm mb-8">{currentUser.email || 'Local Account'}</p>
        
        <form onSubmit={handleLogin} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
             <Lock size={16} />
          </div>
          <input 
            type="password" 
            placeholder="Enter Password"
            className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10 group-focus-within:border-blue-500'} rounded-lg pl-10 pr-12 py-3 text-white outline-none transition-all placeholder-gray-500 backdrop-blur-sm`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
            disabled={loading}
          />
          <button 
            type="submit"
            className="absolute right-1 top-1 bottom-1 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowRight size={18} />}
          </button>
        </form>
        
        {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs mt-3 bg-red-900/20 px-3 py-1 rounded border border-red-500/20 w-full justify-center">
                <AlertCircle size={12} /> {errorMsg}
            </div>
        )}
      </div>

      <div className="absolute top-8 right-8 z-10 flex gap-4">
        <button 
          onClick={rebootSystem}
          className="text-white/70 hover:text-white flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors"
        >
          <span className="hidden sm:inline">Restart</span>
        </button>
        <button 
          onClick={shutdownSystem}
          className="text-white/70 hover:text-red-400 flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors"
        >
          <Power size={18} /> <span className="hidden sm:inline">Shutdown</span>
        </button>
      </div>

      <div className="absolute bottom-8 text-white/20 text-xs z-10 font-mono">
        Njobvu OS v3.2 • Secure Session
      </div>
    </div>
  );
};
