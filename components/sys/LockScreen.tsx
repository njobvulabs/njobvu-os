
import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { ArrowRight, User, Lock, Power } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export const LockScreen: React.FC = () => {
    const { currentUser, loginUser, logoutUser, shutdownSystem } = useOS();
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        // Simple mock unlock or re-auth depending on if we have email
        if (currentUser.email) {
            try {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: currentUser.email,
                    password: password
                });
                if (authError) throw authError;
                loginUser(currentUser.username, password); // Re-enter running state
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        } else {
             // Local mock user
             setTimeout(() => {
                 loginUser(currentUser.username); 
             }, 500);
        }
    };

    return (
        <div className="h-screen w-screen bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center relative animate-in fade-in z-[99999]">
            <div className="flex flex-col items-center gap-6">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                     <img src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} alt="User" className="w-full h-full object-cover" />
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-wide">{currentUser.username}</h1>
                 
                 <form onSubmit={handleUnlock} className="flex gap-2">
                     <input 
                       type="password" 
                       placeholder="Password"
                       className={`bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors w-64`}
                       value={password}
                       onChange={e => { setPassword(e.target.value); setError(false); }}
                       autoFocus
                     />
                     <button type="submit" className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors border border-white/20" disabled={loading}>
                        {loading ? <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <ArrowRight size={24} />}
                     </button>
                 </form>
                 
                 {error && <div className="text-red-400 text-sm">Incorrect password. Please try again.</div>}
            </div>

            <div className="absolute bottom-8 flex gap-6 text-gray-400">
                 <button onClick={logoutUser} className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                     <User size={24} />
                     <span className="text-xs">Switch User</span>
                 </button>
                 <button onClick={shutdownSystem} className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                     <Power size={24} />
                     <span className="text-xs">Shut Down</span>
                 </button>
            </div>
        </div>
    );
};
