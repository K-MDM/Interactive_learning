import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Sparkles, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InteractiveSimulator from '@/components/InteractiveSimulator';

export const dynamic = 'force-dynamic';

export default async function DemoLessonsPage() {
  let demoNotes: any[] = [];
  let errorMsg = '';

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_demo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    demoNotes = data || [];
  } catch (err: any) {
    console.error('Failed to load demo lessons:', err);
    errorMsg = 'Could not load demo lectures. Please try again later.';
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      <Navbar />

      {/* Editorial Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 z-10 space-y-16">

        {/* Breadcrumbs / Back button */}
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-600 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse text-emerald-500" />
            <span>Interactive Demo Notes</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
            Experience{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Keeelai Note Viewer
            </span>
          </h1>
          <p className="text-slate-650 text-base leading-relaxed">
            Take our interactive, self-contained HTML notes for a spin directly in your browser. Experience how animations, responsiveness, and clean widget execution bring concepts to life.
          </p>
        </div>

        {/* Content list */}
        {errorMsg ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-2xl text-center max-w-md mx-auto font-semibold">
            {errorMsg}
          </div>
        ) : demoNotes.length === 0 ? (
          <div className="bg-white border border-slate-200/80 p-16 text-center rounded-3xl shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Demos Available</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              We are currently setting up the free lectures. Check back shortly to try our interactive classes.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all animate-pulse"
              >
                View Premium Pricing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoNotes.map((note: any) => (
              <div
                key={note.id}
                className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/[0.04] transition-all duration-300 group relative overflow-hidden"
              >
                {/* Glowing bottom gradient on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Interactive Lecture
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Free Trial
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display line-clamp-2">
                    {note.title}
                  </h3>

                  <p className="text-slate-655 text-sm leading-relaxed line-clamp-4 min-h-[80px]">
                    {note.description || 'Welcome to this interactive class lecture note. Click below to experience animated components and widgets.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-8 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Public Access</span>
                  <a
                    href={`/webview/notes/${note.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <span>Launch Webview</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Sandbox Simulator playground
        <div className="pt-12 border-t border-slate-200">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Try Interactive Notes Components
            </h2>
            <p className="text-slate-550 text-sm leading-relaxed">
              Play with real interactive widgets from Keeelai science and engineering lectures right here in our simulation sandbox.
            </p>
          </div>
          <InteractiveSimulator />
        </div> */}

      </main>

      <Footer />
    </div>
  );
}
