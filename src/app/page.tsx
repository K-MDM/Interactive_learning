'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Cpu, BookOpen, Sparkles, CheckCircle2,
  HelpCircle, ChevronRight, Zap, GraduationCap, Smartphone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InteractiveSimulator from '@/components/InteractiveSimulator';
import KeeelScrollSimulator from '@/components/KeeelScrollSimulator';
import { useAnimeStagger, useAnimeCountUp } from '@/lib/use-anime-stagger';

function StatCard({ value, decimal = 0, prefix = '', suffix = '', label, desc, colorClass }: {
  value: number;
  decimal?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc: string;
  colorClass: string;
}) {
  const countRef = useAnimeCountUp(value, decimal);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-3xl p-7 text-center space-y-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <span className={`text-4xl md:text-5xl font-black font-display block ${colorClass}`}>
        {prefix}
        <span ref={countRef}>0</span>
        {suffix}
      </span>
      <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">{label}</span>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  const bentoRef = useAnimeStagger({
    targets: '.anime-bento-card',
    translateY: [35, 0],
    scale: [0.97, 1],
    opacity: [0, 1],
    delayStagger: 120,
  });

  return (
    <div className="bg-[#05090D] text-white flex flex-col min-h-screen relative font-sans select-none antialiased">
      <Navbar dark={true} />

      {/* 240-Frame Interactive Scrollytelling Hero */}
      <KeeelScrollSimulator />

      {/* Main Content Body */}
      <main className="w-full max-w-6xl mx-auto space-y-24 py-16 md:py-24 px-6 relative z-10">

        {/* Section 2: Bento Grid Features */}
        <div ref={bentoRef} className="space-y-8">
          <div className="text-center space-y-3">
            <span className="bg-primary/15 text-primary-bright border border-primary/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Experiential Learning Platform
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">Every Topic. Immersive 3D Models, Simulations &amp; Games.</h2>
            <p className="text-slate-400 text-sm font-semibold max-w-2xl mx-auto">Say goodbye to rote memorization and hello to real understanding — every subject can be understood with its core concepts and rich visuals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Distillation/Titration widgets */}
            <div className="anime-bento-card md:col-span-2 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3.5 bg-primary/15 border border-primary/30 text-primary-bright rounded-2xl shadow-sm">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-white">Immersive Interactive Simulator</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md font-medium">
                  Step away from standard textbooks and dive into hands-on exploration. Teachers project live simulations on class screens; children adjust variables, test plate tectonics, and diagram grammar trees to see immediate reactions.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bold text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-bright" /> Chemistry Reactions & Physics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-bright" /> Geographic Topography Maps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-bright" /> Historical Timeline Sliders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-bright" /> Interactive Grammar Diagramming
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Hands-On Visualization */}
            <div className="anime-bento-card bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-secondary/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3.5 bg-secondary/15 border border-secondary/30 text-secondary-bright rounded-2xl shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-white">Learn Effortlessly</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Ditch passive screen time and flat textbooks. Children retain information faster when they manipulate timeline charts, geometry shapes, or geography maps in real time — learning by doing, not memorizing.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-secondary-bright uppercase tracking-wider">Interactive Study Modules</span>
              </div>
            </div>

            {/* Card 3: Seamless Screen Sharing */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-accent-bright/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-bright/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-accent-bright/15 border border-accent-bright/30 text-accent-bright rounded-2xl">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-white">Perfect for School & Home</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Regular updates at no extra cost — always on time, always ahead of the era. Use on smartboards, tablets, or laptops. Interface controls scale beautifully for clean K-12 classroom demonstrations.
                  </p>
                </div>
                <span className="text-xs font-bold text-accent-bright uppercase tracking-wider">Supports Tablets, Phones & Projectors</span>
              </div>
            </div>

            {/* Card 4: Active Concept Checks */}
            <div className="md:col-span-2 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-primary/40 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-primary/15 border border-primary/30 text-primary-bright rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-white">Track Progress with Real-Time Feedback</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                  Track your progress with interactive quizzes and real-time feedback built into every lesson. Build confidence before homework or tests — say hello to real understanding.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-3 py-1 rounded-lg">Visual understanding cues</span>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-3 py-1 rounded-lg">Immediate feedback</span>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-3 py-1 rounded-lg">Step-by-step guidance</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Outcomes & Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-primary-bright font-display block">+28%</span>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Concept Comprehension Score</span>
            <p className="text-xs text-slate-500 font-medium">Verified by educational research comparing interactive virtual models to standard print textbooks across STEM, geography, and grammar (2024).</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-secondary-bright font-display block">94%</span>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Classroom Engagement Boost</span>
            <p className="text-xs text-slate-500 font-medium">Teachers reporting a marked increase in student participation and visual retention during immersive subject lessons.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-accent-bright font-display block">5.5 hrs</span>
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Saved per Lesson Module</span>
            <p className="text-xs text-slate-500 font-medium">Average prep-time saved by K-12 instructors using pre-built interactive 3D simulation lesson decks.</p>
          </div>
        </div>

        {/* Section 3: Live Interactive Simulator */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-primary/15 text-primary-bright text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-primary/30">
              Interactive Subject Player
            </span>
            <h3 className="text-3xl font-black font-display text-white tracking-tight">Play with the 3D Simulation Player</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">
              Every subject. Available with immersive 3D models, simulations, and games. Test variables below — adjust timelines, manipulate topography grids, or diagram sentences.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-lg">
            <InteractiveSimulator />
          </div>
        </div>

        {/* Verified Testimonials Block */}
        <div className="space-y-8 pt-8 border-t border-slate-800/60">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-secondary/15 text-secondary-bright text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-secondary/30">
              Verified Educators & Parents
            </span>
            <h3 className="text-3xl font-black font-display text-white tracking-tight">What Teachers & Parents Say</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-300 text-sm leading-relaxed italic font-semibold">
                "My students used to struggle to visualize chemical titration curves. With Keeelai's player, they can test flow variables live and immediately understand the neutralization endpoint. Engagement has skyrocketed."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary-bright font-display text-sm">
                  SJ
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">Sarah Jenkins</span>
                  <span className="text-xs text-slate-500 font-semibold block">Middle School Chemistry Instructor, Lincoln Academy</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-300 text-sm leading-relaxed italic font-semibold">
                "Explaining abstract historical timelines, grammar structures, or gravity laws to my 10-year-old felt impossible. These interactive visualizer widgets turned study into active play."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center font-bold text-secondary-bright font-display text-sm">
                  DT
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">David Thompson</span>
                  <span className="text-xs text-slate-500 font-semibold block">Parent & Home Educator</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Accordion FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-slate-800/60">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-primary-bright uppercase tracking-widest block">Learn More</span>
            <h3 className="text-3xl font-black font-display leading-[1.1] text-white">Frequently Asked Questions</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">
              Still curious about how Keeelai interactive notes deliver better memory retention?
            </p>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {[
              {
                q: 'What is KEEEL AI?',
                a: 'KEEEL AI is an interactive 3D learning simulator for K-12 students. It replaces flat textbooks with immersive simulations, games, and visual models across STEM, history, geography, and language arts.'
              },
              {
                q: 'Who is KEEEL AI designed for?',
                a: 'KEEEL AI is designed for K-12 subject teachers looking to boost classroom engagement, and parents wanting to help children understand abstract concepts with rich visuals.'
              },
              {
                q: 'How does the immersive 3D simulator help children learn?',
                a: 'By turning passive reading into active exploration. Children drag variables and immediately see subject elements react, which replaces rote memorization with real understanding and improves long-term retention.'
              },
              {
                q: 'Can teachers use KEEEL AI in their classroom lessons?',
                a: 'Absolutely. Teachers can project interactive 3D simulations on smartboards to explain complex processes like chemical reactions, sentence diagramming, or historical timelines.'
              },
              {
                q: 'Do children need any prior background to start?',
                a: 'No. The immersive player features intuitive, visual controls that allow children to safely explore concepts at their own pace with step-by-step guidance.'
              },
              {
                q: 'What subjects does KEEEL AI cover?',
                a: 'KEEEL AI covers major K-12 subjects including physics forces, chemistry reactions, history timelines, geography topography, biology, and grammar diagramming.'
              },
              {
                q: 'Is KEEEL AI aligned to school curriculums?',
                a: 'Yes. Interactive lessons are structured around standard K-12 curricula to reinforce what children learn in school, with regular updates at no extra cost.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-800 pb-6 space-y-2">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-bright shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Premium CTA & Pricing Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.05),transparent_40%)] pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Special Introductory Pricing Active</span>
            </span>
            <h3 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight">
              Start Your Immersive,<br />Experiential Learning Journey Today
            </h3>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Join thousands of teachers and parents using KEEEL AI to make every subject understood through core concepts and rich visuals — regular updates at no extra cost.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/checkout"
                className="bg-foreground hover:bg-slate-800 text-background font-bold px-8 py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Membership Pricing</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="bg-transparent hover:bg-white/10 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Talk to Support</span>
              </Link>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
