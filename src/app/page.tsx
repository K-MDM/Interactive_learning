import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Sparkles, Smartphone, ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Fetch demo lessons on the server
  let demoNotes: any[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('is_demo', true)
      .order('created_at', { ascending: false });
    
    demoNotes = data || [];
  } catch (err) {
    console.error('Failed to load demo lessons on home page:', err);
  }

  const hasDemos = demoNotes.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />
      
      {/* Editorial Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Hero Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Interactive Learning Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 font-display">
            The Smartest Way to Master{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Complex Concepts
            </span>
          </h1>

          <p className="text-slate-650 text-lg sm:text-xl max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Ditch static PDFs and boring text files. Our interactive, self-contained HTML notes are animated, responsive, and designed exclusively to run seamlessly inside our mobile learning app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link 
              href="/checkout"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
            >
              <span>Unlock Premium Access</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            {hasDemos ? (
              <a 
                href="#demo-showcase"
                className="border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                Try Demo Lectures
              </a>
            ) : (
              <a 
                href="#features"
                className="border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
              >
                Explore Features
              </a>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-200">
            <div className="text-left">
              <p className="text-2xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Self-Contained HTML</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="text-left">
              <p className="text-2xl font-extrabold text-slate-900">256-bit</p>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Secure Streaming</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <div className="text-left">
              <p className="text-2xl font-extrabold text-slate-900">Razorpay</p>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Instant Activation</p>
            </div>
          </div>

        </div>

        {/* Hero Image Mockup Area */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-[340px] aspect-[9/18] bg-white border-[6px] border-slate-900 rounded-[36px] shadow-2xl p-4 overflow-hidden flex flex-col justify-between">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full" />
            
            {/* Screen Header */}
            <div className="pt-4 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Lecture 01</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Screen Content Mock */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-4 py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Keeelai App Note Viewer</h3>
              <p className="text-[11px] text-slate-500 px-4 leading-relaxed">
                "Welcome to the interactive classroom. Click elements below to animate code states."
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-left space-y-1 mx-2">
                <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-blue-600" />
                </div>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider block">Animation Progress</span>
              </div>
            </div>

            {/* Screen Footer */}
            <div className="border-t border-slate-100 pt-2 pb-1 text-center">
              <span className="text-[8px] text-slate-450">Double tap any widget to execute scripts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Lessons Showcase */}
      {hasDemos && (
        <section id="demo-showcase" className="w-full bg-white py-24 z-10 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Trial Lessons</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                Experience Interactive Notes
              </h2>
              <p className="text-slate-650 max-w-xl mx-auto text-base">
                Try out these sample lectures directly in your browser. Tap elements to trigger animations and explore live code scripts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {demoNotes.map((note: any) => (
                <div key={note.id} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/35 transition-all shadow-sm hover:shadow-md hover:bg-white group cursor-pointer">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display line-clamp-1">{note.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
                      {note.description || 'No description provided. Click below to view the interactive lecture.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Public Access</span>
                    <a 
                      href={`/webview/notes/${note.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98]"
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
      <section id="features" className="w-full py-24 z-10 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Designed For Premium Learning
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-base">
              A carefully tailored note rendering framework that lets users stream lectures dynamically right inside their app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-6 h-6 text-blue-600" />,
                title: 'Mobile-Only Secure Webview',
                desc: 'Files are streamed in-memory inside the Android App Webview. Zero risk of users copying or leaking raw HTML templates.',
              },
              {
                icon: <Sparkles className="w-6 h-6 text-blue-600" />,
                title: 'Single-File HTML Notes',
                desc: 'Lectures are uploaded as self-contained files containing all styling (CSS) and interactivity (JS) inside one document.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
                title: 'Cross-App HMAC Syncing',
                desc: 'Old app users click a button and access the note directly. Next.js validates signed links with zero signup friction.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="w-full bg-white border-t border-slate-200 py-20 z-10">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Mail className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Have any questions?</h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
            Need custom pricing setups, help with active coupon validation, or want to discuss enterprise licenses? We'd love to hear from you.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              <span>Contact Our Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
