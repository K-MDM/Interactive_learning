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
import { HeroSection } from '@/components/blocks/hero-section-5';
import SceneBackdrop from '@/components/three/SceneBackdrop';
import Reveal from '@/components/motion/Reveal';
import Parallax from '@/components/motion/Parallax';
import Divider from '@/components/motion/Divider';

export default function LandingPage() {
  return (
    <div className="text-[#0F172A] flex flex-col min-h-screen relative font-sans select-none antialiased">
      {/* Immersive playful 3D backdrop (fixed, behind everything) */}
      <SceneBackdrop density={11} />

      <Navbar dark={false} />

      {/* Hero */}
      <HeroSection />

      {/* Main Content Body */}
      <main className="w-full max-w-6xl mx-auto space-y-20 py-14 md:py-20 px-6 relative z-10">

        {/* Section: How It Works */}
        <div className="space-y-10">
          <Parallax speed={50}>
            <Reveal from="up" className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-candy-blue/10 border border-candy-blue/20 text-candy-blue px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>How Keeelai Works</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900 tracking-tight">
                Three steps to hands-on understanding
              </h2>
              <p className="text-slate-500 text-sm font-semibold max-w-xl mx-auto">
                Keeelai is a K-12 interactive learning platform that turns passive lessons into active exploration — no coding, no setup, no textbook required.
              </p>
            </Reveal>
          </Parallax>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-candy-blue/10">
              <div className="w-12 h-12 rounded-2xl bg-candy-blue/10 border border-candy-blue/20 text-candy-blue flex items-center justify-center font-black text-xl font-display mx-auto">1</div>
              <h3 className="font-bold text-slate-900 text-base">Pick a Subject</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Choose from chemistry, physics, history, geography, or grammar — all aligned to standard K-12 curricula.</p>
            </div>
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-candy-teal/10">
              <div className="w-12 h-12 rounded-2xl bg-candy-teal/10 border border-candy-teal/20 text-candy-teal flex items-center justify-center font-black text-xl font-display mx-auto">2</div>
              <h3 className="font-bold text-slate-900 text-base">Open the Interactive Player</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Launch a live simulation widget. Drag variables, adjust timelines, or manipulate molecules — the concept reacts in real time.</p>
            </div>
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm text-center hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-candy-indigo/10">
              <div className="w-12 h-12 rounded-2xl bg-candy-indigo/10 border border-candy-indigo/20 text-candy-indigo flex items-center justify-center font-black text-xl font-display mx-auto">3</div>
              <h3 className="font-bold text-slate-900 text-base">Check Understanding</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Built-in concept checks give immediate feedback, reinforcing what children explored before they return to homework or class.</p>
            </div>
          </Reveal>
        </div>

        <Divider />

        {/* Section: Bento Grid Features */}
        <div className="space-y-8">
          <Parallax speed={50}>
            <Reveal from="up" className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight font-display text-slate-900">Immersive Visual Learning</h2>
              <p className="text-slate-500 text-sm font-semibold">Helping parents explain complex subjects and empowering teachers with interactive tools.</p>
            </Reveal>
          </Parallax>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Interactive Player */}
            <div className="md:col-span-2 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:border-candy-blue/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-candy-blue/10">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-candy-blue/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-candy-blue/10 border border-candy-blue/20 text-candy-blue rounded-2xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900">Immersive Interactive Player</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Teachers can project simulations on class screens. Children adjust variables, test plate tectonics, or diagram grammar trees and see immediate, visual reactions — not a static diagram.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-candy-blue" /> Chemistry Reactions &amp; Physics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-candy-blue" /> Geographic Topography Maps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-candy-blue" /> Historical Timeline Sliders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-candy-blue" /> Interactive Grammar Diagramming
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Hands-On Learning */}
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:border-candy-teal/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-candy-teal/10">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-candy-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-candy-teal/10 border border-candy-teal/20 text-candy-teal rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Hands-On Learning</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Children learn and retain information faster when they manipulate what they&apos;re studying. Keeelai replaces passive screen time with active exploration of timeline charts, geometry shapes, and geography maps.
                  </p>
                </div>
                <span className="text-xs font-bold text-candy-teal uppercase tracking-wider">Interactive Study Modules</span>
              </div>
            </div>

            {/* Card 3: Perfect for School & Home */}
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:border-candy-indigo/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-candy-indigo/10">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-candy-indigo/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-candy-indigo/10 border border-candy-indigo/20 text-candy-indigo rounded-2xl">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Perfect for School &amp; Home</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Designed to work on smartboards, tablets, and laptops. Controls scale cleanly for K-12 classroom projections and independent study at home.
                  </p>
                </div>
                <span className="text-xs font-bold text-candy-indigo uppercase tracking-wider">Supports Tablets, Phones &amp; Projectors</span>
              </div>
            </div>

            {/* Card 4: Active Concept Checks */}
            <div className="md:col-span-2 bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 hover:border-candy-coral/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-candy-coral/10">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-candy-coral/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-candy-coral/10 border border-candy-coral/20 text-candy-coral rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900">Active Concept Checks</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Every simulation includes built-in concept checks that give children immediate feedback. They build real understanding — not just familiarity — before homework or tests.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Visual understanding cues</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Immediate feedback</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Step-by-step guidance</span>
                </div>
              </div>
            </div>

          </Reveal>
        </div>

        <Divider />

        {/* Section: Live Interactive Simulator */}
        <div className="space-y-10">
          <Parallax speed={45}>
            <Reveal from="up" className="text-center max-w-xl mx-auto space-y-3">
              <span className="bg-candy-blue/10 text-candy-blue text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-candy-blue/20">
                Interactive Subject Player
              </span>
              <h2 className="text-3xl font-black font-display text-slate-900 tracking-tight">Try the Simulation Player Live</h2>
              <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                Adjust timelines, manipulate topography grids, change chemical variables, or diagram sentences — right here, right now.
              </p>
            </Reveal>
          </Parallax>

          <Reveal from="scale" className="border border-slate-200/80 rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-2xl shadow-slate-900/20">
            <InteractiveSimulator />
          </Reveal>
        </div>

        <Divider />

        {/* Testimonials Block */}
        <div className="space-y-8">
          <Reveal from="up" className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-candy-teal/10 text-candy-teal text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-candy-teal/20">
              Verified Educators &amp; Parents
            </span>
            <h2 className="text-3xl font-black font-display text-slate-900 tracking-tight">What Teachers &amp; Parents Say</h2>
          </Reveal>
          <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed italic font-semibold">
                &ldquo;My students used to struggle to visualize chemical titration curves. With Keeelai&apos;s player, they test flow variables live and immediately understand the neutralization endpoint. Engagement has skyrocketed.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-candy-blue/10 flex items-center justify-center font-bold text-candy-blue font-display text-sm">
                  SJ
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Sarah Jenkins</span>
                  <span className="text-xs text-slate-500 font-semibold block">Middle School Chemistry Instructor, Lincoln Academy</span>
                </div>
              </div>
            </div>
            <div className="bg-white/85 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed italic font-semibold">
                &ldquo;Explaining abstract historical timelines, grammar structures, or gravity laws to my 10-year-old felt impossible. These interactive visualizer widgets turned study into active play.&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-candy-teal/10 flex items-center justify-center font-bold text-candy-teal font-display text-sm">
                  DT
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 block">David Thompson</span>
                  <span className="text-xs text-slate-500 font-semibold block">Parent &amp; Home Educator</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Divider />

        {/* Section: FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <Reveal from="left" className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-candy-blue uppercase tracking-widest block">Common Questions</span>
            <h2 className="text-3xl font-black font-display leading-[1.1] text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold">
              Everything you need to know about Keeelai&apos;s interactive K-12 learning platform.
            </p>
          </Reveal>

          <Reveal stagger className="lg:col-span-7 space-y-6">
            {[
              {
                q: 'Who is Keeelai designed for?',
                a: 'Keeelai is designed for K-12 teachers and parents. Teachers use it to project live simulations in class; parents use it to help children visualize abstract concepts during home study.'
              },
              {
                q: 'How does the interactive simulation player help children learn?',
                a: 'Children learn by doing. When students drag variables and immediately see how a concept reacts — a titration curve shifting, a tectonic plate moving — they build intuitive understanding that reading alone cannot provide.'
              },
              {
                q: 'Can teachers use Keeelai on a smartboard or projector?',
                a: 'Yes. Every simulation is optimized for large-screen classroom display. Teachers can run live demonstrations on smartboards while students follow along on their own devices.'
              },
              {
                q: 'Do children need prior knowledge to use Keeelai?',
                a: 'No prior knowledge is needed. The interactive player uses visual controls with guided steps, so children can safely explore concepts at their own pace from the very first session.'
              },
              {
                q: 'What subjects does Keeelai cover?',
                a: 'Keeelai covers core K-12 subjects including physics forces, chemistry reactions, history timelines, geography and topography, and English grammar diagramming. More subjects are added regularly.'
              },
              {
                q: 'Is Keeelai aligned to school curricula?',
                a: 'Yes. Interactive lessons are structured around standard K-12 school curricula, so every simulation reinforces what children are already learning in class.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6 space-y-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-candy-blue shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* CTA Banner */}
        <Reveal from="scale" className="relative overflow-hidden bg-gradient-to-br from-candy-blue/10 via-candy-indigo/10 to-candy-coral/5 border border-candy-indigo/20 rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-lg">
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-candy-coral/15 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-candy-blue/15 blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur border border-candy-indigo/20 text-candy-indigo px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Start Your First Lesson Today</span>
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-display text-slate-900 tracking-tight leading-tight">
              Bring Interactive Learning to Your Classroom or Home
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Join teachers and parents using Keeelai to turn abstract K-12 concepts into hands-on, memorable experiences — no setup required.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/checkout"
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Eplore Plans</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="bg-white/70 backdrop-blur hover:bg-white text-slate-700 font-bold px-8 py-3.5 rounded-xl text-sm transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Explore the Experience Zone</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>

      </main>

      <Footer />
    </div>
  );
}
