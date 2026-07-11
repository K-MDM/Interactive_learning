import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { Sparkles, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Interactive K-12 Subject Simulations | Keeelai Demos',
  description: 'Try our free virtual simulations and interactive classrooms across all subjects. Learn by doing with hands-on simulator controls.',
};

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
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      <Navbar dark={false} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://keeelai.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Demos",
                "item": "https://keeelai.com/demo"
              }
            ]
          })
        }}
      />

      {/* Editorial Grid Background in Light Mode */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

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
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-750 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse text-blue-600" />
            <span>Simulation Player Demos</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
            Explore the{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Interactive Simulator
            </span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed font-semibold">
            Explore virtual experiments and classroom visualizers directly in your browser. Experience how hands-on animations and interactive controls bring science, history, geography, and grammar concepts to life.
          </p>
        </div>

        {/* Content list */}
        {errorMsg ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center max-w-md mx-auto font-semibold">
            {errorMsg}
          </div>
        ) : demoNotes.length === 0 ? (
          <div className="bg-white border border-slate-200 p-16 text-center rounded-3xl shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Demos Available</h2>
            <p className="text-slate-605 text-sm leading-relaxed font-semibold">
              We are currently setting up the free simulations. Check back shortly to try our interactive classrooms.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
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
                className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/[0.02] transition-all duration-300 group relative overflow-hidden"
              >
                {/* Glowing bottom gradient on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-600 to-teal-500 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Interactive Simulation
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Free Trial
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-650 transition-colors font-display line-clamp-2">
                    {note.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 min-h-[80px] font-medium">
                    {note.description || 'Explore virtual simulations and hands-on experiments. Adjust variables to see science laws react in real-time.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-8 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Public Access</span>
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

      </main>

      <Footer />
    </div>
  );
}
