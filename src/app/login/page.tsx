'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserAuthPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        setMessage({ type: 'success', text: 'Logged in successfully! Redirecting...' });
        setTimeout(() => {
          router.push('/checkout');
          router.refresh();
        }, 1200);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone },
            emailRedirectTo: `${window.location.origin}/checkout`,
          }
        });
        if (error) throw error;
        
        setMessage({ type: 'success', text: 'Registration complete! Check your email for verification.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] flex flex-col justify-between font-sans relative overflow-x-hidden">
      <Navbar dark={false} />

      {/* Grid background layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-24 relative z-10">
        <div className="w-full max-w-md space-y-6">
          
          <div className="flex flex-col items-center space-y-2.5 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              Welcome to Keeelai
            </h1>
            <p className="text-slate-500 text-sm font-semibold">
              Log in to sync your library and access your notes offline.
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-t-3xl" />

            {/* Auth Screen toggles */}
            <div className="flex border-b border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setMessage(null); }}
                className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  isLogin ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setMessage(null); }}
                className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  !isLogin ? 'border-primary text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>

            {message && (
              <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-start gap-2.5 ${
                message.type === 'success'
                  ? 'bg-secondary/10 border-secondary/20 text-secondary'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0 text-secondary" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-destructive" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="John Doe" 
                      required
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="10-digit Mobile No." 
                      required
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all" 
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm hover:shadow active:scale-[0.98]"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>{isLogin ? 'Sign In' : 'Create Account'}</span>}
              </button>
            </form>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
