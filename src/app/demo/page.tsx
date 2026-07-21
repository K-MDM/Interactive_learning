import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { Sparkles, ArrowRight, ArrowLeft, BookOpen, Calculator, Atom, BookMarked, Layers } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Interactive K-12 Experience Zone | Keeelai',
  description: 'Try our free virtual simulations and interactive experience zones across Maths, Science, Languages, and Humanities. Learn by doing with hands-on controls.',
};

interface SubjectGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeBg: string;
  notes: any[];
}

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

  // Categorize notes into subject sections
  const mathsNotes: any[] = [];
  const scienceNotes: any[] = [];
  const humanitiesNotes: any[] = [];
  const generalNotes: any[] = [];

  demoNotes.forEach((note) => {
    const taxonomySubjects = (note.note_taxonomy || [])
      .map((t: any) => t.subjects?.name || '')
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const fullSearchText = `${note.title || ''} ${note.description || ''} ${taxonomySubjects}`.toLowerCase();

    if (fullSearchText.includes('math') || fullSearchText.includes('algebra') || fullSearchText.includes('geometry') || fullSearchText.includes('calculus') || fullSearchText.includes('trig') || fullSearchText.includes('number') || fullSearchText.includes('fraction')) {
      mathsNotes.push(note);
    } else if (fullSearchText.includes('scienc') || fullSearchText.includes('physic') || fullSearchText.includes('chemis') || fullSearchText.includes('biol') || fullSearchText.includes('atom') || fullSearchText.includes('cell') || fullSearchText.includes('space') || fullSearchText.includes('gravity')) {
      scienceNotes.push(note);
    } else if (fullSearchText.includes('english') || fullSearchText.includes('histor') || fullSearchText.includes('geograph') || fullSearchText.includes('social') || fullSearchText.includes('grammar') || fullSearchText.includes('civic') || fullSearchText.includes('language')) {
      humanitiesNotes.push(note);
    } else {
      generalNotes.push(note);
    }
  });

  const subjectGroups: SubjectGroup[] = [
    {
      id: 'maths',
      title: 'Experience Maths',
      subtitle: 'Hands-on geometry, algebra, and numerical visualizers that bring mathematical principles to life.',
      icon: <Calculator className="w-5 h-5 text-blue-600" />,
      colorClass: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
      notes: mathsNotes,
    },
    {
      id: 'science',
      title: 'Experience Science',
      subtitle: 'Interactive physics laboratories, chemical reactions, and biological anatomy models in 3D.',
      icon: <Atom className="w-5 h-5 text-emerald-600" />,
      colorClass: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      notes: scienceNotes,
    },
    {
      id: 'humanities',
      title: 'Experience Languages & Humanities',
      subtitle: 'Exploratory world maps, historical timelines, and interactive grammar diagrams.',
      icon: <BookMarked className="w-5 h-5 text-purple-600" />,
      colorClass: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
      notes: humanitiesNotes,
    },
    {
      id: 'general',
      title: 'General Experience Zone',
      subtitle: 'Cross-curricular interactive modules and essential foundational visualizers.',
      icon: <Layers className="w-5 h-5 text-amber-600" />,
      colorClass: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
      notes: generalNotes,
    },
  ].filter(group => group.notes.length > 0 || (demoNotes.length === 0 && group.id === 'maths'));

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
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse text-primary" />
            <span>K-12 Experience Zone</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.15]">
            Explore the{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Interactive Experience Zone
            </span>
          </h1>
          <p className="text-slate-600 text-base leading-relaxed font-semibold">
            Try our hands-on subject experience hubs directly in your browser. Touch, adjust variables, and see abstract K-12 concepts react in real-time.
          </p>
        </div>

        {/* Content list */}
        {errorMsg ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl text-center max-w-md mx-auto font-semibold">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {subjectGroups.map((group) => (
              <section key={group.id} className="space-y-6">
                {/* Subject Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border ${group.badgeBg} flex items-center justify-center`}>
                      {group.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                        {group.title}
                      </h2>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">
                        {group.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
                    {group.notes.length} {group.notes.length === 1 ? 'Module' : 'Modules'}
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.notes.map((note: any) => (
                    <div
                      key={note.id}
                      className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-primary/50 hover:shadow-lg hover:shadow-primary/[0.02] transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Glowing bottom gradient on hover */}
                      <div className={`absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r ${group.colorClass} transform translate-y-full group-hover:translate-y-0 transition-transform duration-300`} />

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Interactive Simulation
                          </span>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
                            Free Experience
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors font-display line-clamp-2">
                          {note.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 min-h-[80px] font-medium">
                          {note.description || 'Explore virtual simulations and hands-on experiments. Adjust variables to see science and math concepts react in real-time.'}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-100 mt-8 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Public Access</span>
                        <a
                          href={`/webview/notes/${note.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                        >
                          <span>Launch Webview</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
