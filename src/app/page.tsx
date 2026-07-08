import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Sparkles, Smartphone, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

export default async function LandingPage() {
  // Fetch demo lessons on the server
  const supabase = await createClient();
  const { data } = await supabase
    .from('notes')
    .select('*')
    .eq('is_demo', true)
    .order('created_at', { ascending: false });
  
  const demoNotes = data || [];
  const hasDemos = demoNotes.length > 0;

  return (
    <div className="min-h-screen bg-[#07080c] text-gray-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-950/20 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-gray-900/60 z-10">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">Keeelai</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Admin console
          </Link>
          <Link 
            href="/checkout" 
            className="bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-blue-400 text-sm font-bold px-4 py-2 rounded-lg transition-all"
          >
            Get Subscription
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/15 to-violet-500/15 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Interactive Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            The Smartest Way to Master{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Complex Concepts
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Ditch static PDFs and boring text files. Our interactive, self-contained HTML notes are animated, responsive, and designed exclusively to run seamlessly inside our mobile learning app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link 
              href="/checkout"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <span>Unlock Premium Access</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            {hasDemos ? (
              <a 
                href="#demo-showcase"
                className="border border-gray-800 hover:border-gray-700 bg-[#12141c]/50 text-gray-300 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all"
              >
                Try Demo Lectures
              </a>
            ) : (
              <a 
                href="#features"
                className="border border-gray-800 hover:border-gray-700 bg-[#12141c]/50 text-gray-300 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all"
              >
                Explore Features
              </a>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-900/80">
            <div className="text-left">
              <p className="text-2xl font-extrabold text-white">100%</p>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Self-Contained HTML</p>
            </div>
            <div className="w-[1px] h-8 bg-gray-900" />
            <div className="text-left">
              <p className="text-2xl font-extrabold text-white">256-bit</p>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Secure Streaming</p>
            </div>
            <div className="w-[1px] h-8 bg-gray-900" />
            <div className="text-left">
              <p className="text-2xl font-extrabold text-white">Razorpay</p>
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-0.5">Instant Activation</p>
            </div>
          </div>

        </div>

        {/* Hero Image Mockup Area */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-[340px] aspect-[9/18] bg-[#0c0d12] border-[6px] border-gray-800 rounded-[36px] shadow-2xl p-4 overflow-hidden flex flex-col justify-between">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-800 rounded-full" />
            
            {/* Screen Header */}
            <div className="pt-4 flex items-center justify-between border-b border-gray-900 pb-2">
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Lecture 01</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Screen Content Mock */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-4 py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Keeelai App Note Viewer</h3>
              <p className="text-[11px] text-gray-400 px-4 leading-relaxed">
                "Welcome to the interactive classroom. Click elements below to animate code states."
              </p>
              <div className="bg-[#12141d] border border-gray-950 rounded-lg p-2 text-left space-y-1 mx-2">
                <div className="w-full h-1.5 bg-blue-500/40 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
                <span className="text-[8px] text-gray-600 font-semibold uppercase tracking-wider block">Animation Progress</span>
              </div>
            </div>

            {/* Screen Footer */}
            <div className="border-t border-gray-900 pt-2 pb-1 text-center">
              <span className="text-[8px] text-gray-500">Double tap any widget to execute scripts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Lessons Showcase */}
      {hasDemos && (
        <section id="demo-showcase" className="w-full bg-[#090b10] py-24 z-10 border-t border-gray-900/60">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Trial Lessons</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Experience Interactive Notes
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-base">
                Try out these sample lectures directly in your browser. Tap elements to trigger animations and explore live code scripts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demoNotes.map((note: any) => (
                <div key={note.id} className="bg-[#12141c]/55 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition-all shadow-xl">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{note.title}</h3>
                    <p className="text-gray-405 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                      {note.description || 'No description provided. Click below to view the interactive lecture.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-gray-805 mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Public Access</span>
                    <a 
                      href={`/webview/notes/${note.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                    >
                      <span>Open Lecture</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section id="features" className="w-full bg-[#07080c] border-t border-gray-900/60 py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Designed For Premium Learning
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base">
              A carefully tailored note rendering framework that lets users stream lectures dynamically right inside their app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-6 h-6 text-blue-400" />,
                title: 'Mobile-Only Secure Webview',
                desc: 'Files are streamed in-memory inside the Android App Webview. Zero risk of users copying or leaking raw HTML templates.',
              },
              {
                icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
                title: 'Single-File HTML Notes',
                desc: 'Lectures are uploaded as self-contained files containing all styling (CSS) and interactivity (JS) inside one document.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-violet-400" />,
                title: 'Cross-App HMAC Syncing',
                desc: 'Old app users click a button and access the note directly. Next.js validates signed links with zero signup friction.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#12141c]/40 border border-gray-800/80 rounded-2xl p-6 space-y-4 hover:border-gray-700 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#181a24] border border-gray-800 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between border-t border-gray-900/60 z-10 text-xs text-gray-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Keeelai Inc. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for modern developers
        </p>
      </footer>

    </div>
  );
}
