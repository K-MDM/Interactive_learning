import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { Sparkles, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SceneBackdrop from '@/components/three/SceneBackdrop';
import Reveal from '@/components/motion/Reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Interactive K-12 Experience Zone | Keeelai',
  description: 'Try our free virtual simulations and interactive experience zones across Maths, Science, Languages, and Humanities. Learn by doing with hands-on controls.',
};

export default async function ExperienceZonePage() {
  let demoNotes: any[] = [];
  let errorMsg = '';

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        note_taxonomy (
          subject_id,
          subjects ( id, name, slug, icon_emoji )
        )
      `)
      .eq('is_demo', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    demoNotes = data || [];
  } catch (err: any) {
    console.error('Failed to load experience zone notes:', err);
    errorMsg = 'Could not load experience zone modules. Please try again later.';
  }



  return (
    <div className="min-h-screen text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      <SceneBackdrop density={10} veil={0.2} />
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
                "name": "Experience Zone",
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
        <Reveal from="up" className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur border border-candy-blue/25 text-candy-blue px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>K-12 Experience Zone</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.1]">
            Explore the{' '}
            <span className="text-gradient-fun">
              Interactive Experience Zone
            </span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed font-semibold">
            Try our hands-on subject experience hubs directly in your browser. Touch, adjust variables, and see abstract K-12 concepts react in real-time.
          </p>
        </Reveal>

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
            <h2 className="text-xl font-bold text-slate-900">Experience Zone Opening Soon</h2>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              We are setting up interactive simulations for Maths, Science, and Languages. Check back shortly to try our interactive classrooms.
            </p>
            <div className="pt-2">
              <Link
                href="/checkout"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        ) : (
          <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoNotes.map((note: any) => {
              // Read subject name directly from DB taxonomy — no keyword guessing
              const subjectName: string = (note.note_taxonomy || [])
                .map((t: any) => t.subjects?.name)
                .filter(Boolean)[0] ?? '';

              const buttonLabel = subjectName
                ? `Experience ${subjectName}`
                : 'Experience Future';
              const colorClass = 'from-blue-600 to-indigo-600';

              return (
                <div
                  key={note.id}
                  className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-candy-blue/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-candy-blue/10 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Glowing bottom gradient on hover */}
                  <div className={`absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r ${colorClass} transform translate-y-full group-hover:translate-y-0 transition-transform duration-300`} />

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Interactive Simulation
                      </span>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                        Free Experience
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display line-clamp-2">
                      {note.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 min-h-[80px] font-medium">
                      {note.description || 'Explore virtual simulations and hands-on experiments. Adjust variables to see concepts react in real-time.'}
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
                      <span>{buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </Reveal>
        )}

      </main>

      <Footer />
    </div>
  );
}
