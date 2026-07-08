'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Success! Redirecting to dashboard...' });
      
      // Redirect to admin panel on success
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Logo area */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <ShieldCheck className="w-12 h-12 text-blue-500" />
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Keeelai Admin Portal</h1>
          <p className="text-gray-400 text-sm">Please log in to manage your notes platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#12141c]/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />

          {message && (
            <div className={`p-4 mb-6 rounded-lg border text-sm font-medium flex items-start gap-2.5 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@keeelai.com"
                required
                disabled={loading}
                className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-[#181a24] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
