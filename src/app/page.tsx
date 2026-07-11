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

export default function LandingPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#0F172A] flex flex-col min-h-screen relative font-sans select-none antialiased">
      <Navbar dark={false} />
      
      {/* Cinematic DNA Video Hero Banner */}
      <HeroSection />

      {/* Main Content Body */}
      <main className="w-full max-w-6xl mx-auto space-y-24 py-16 md:py-24 px-6 relative z-10">
        
        {/* Section 1: Detail Intro Pitch */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>The Next Generation of Study Notes</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight font-display">
            Textbooks are static.<br/>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Your learning should move.
            </span>
          </h2>
          <p className="text-slate-650 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-semibold">
            We compile complex scientific concepts into high-performance, responsive HTML lecture notes with real-time interactive simulation widgets.
          </p>
          <div className="pt-4">
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Launch Interactive Demos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Section 2: Bento Grid Features */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight font-display text-slate-900">Engineering Behind Keeel AI</h3>
            <p className="text-slate-500 text-sm font-semibold">Designed for high engagement, portability, and academic success.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Distillation/Titration widgets */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-slate-900">Embedded Simulation Blocks</h4>
                <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                  Watch distillation columns evaporate chemicals, drop titrant into solutions, and adjust mechanical gears in real-time. Tactile widgets build instant cognitive frameworks.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Kinetic Thermal Controls
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> pH Neutralization Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Gear Ratio Speed Adjusters
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Custom Gas Law Slide Decks
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Self-Contained HTML */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-slate-900">Self-Contained Files</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Every note compiles down into a single, offline-ready HTML asset. Take your lectures anywhere, run animations without active servers, and keep notes forever.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Zero server dependencies</span>
              </div>
            </div>

            {/* Card 3: Mobile Experience */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-slate-900">App Native Viewport</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Optimized for mobile learning apps. Read clean text, trigger simulations, and answer interactive slides directly from your phone while traveling.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Optimized for iOS & Android</span>
              </div>
            </div>

            {/* Card 4: Quiz & Metrics */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-slate-900">Knowledge Checkpoints</h4>
                <p className="text-slate-660 text-sm leading-relaxed max-w-md">
                  Every lecture note features targeted check-your-understanding checkpoints. Click answers, view instant feedback vectors, and master subjects before starting homework.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Multi-choice questions</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Mathematical calculations</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Detailed logic walk-throughs</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Live Interactive Simulator */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
              Interactive Sandbox
            </span>
            <h3 className="text-3xl font-black font-display text-slate-900 tracking-tight">Try Interactive Widgets</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-semibold">
              Play with our live chemical distillation columns, neutralization titrant containers, and mechanical gear rotation loops.
            </p>
          </div>
          
          <div className="border border-slate-200/80 rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-lg">
            <InteractiveSimulator />
          </div>
        </div>

        {/* Section 4: Accordion FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-slate-200/60">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-blue-605 uppercase tracking-widest block">Learn More</span>
            <h3 className="text-3xl font-black font-display leading-[1.1] text-slate-900">Frequently Asked Questions</h3>
            <p className="text-slate-550 text-sm leading-relaxed font-semibold">
              Still curious about how Keeel AI interactive notes deliver better memory retention?
            </p>
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            {[
              {
                q: 'What formats do the lecture notes compile to?',
                a: 'Every note compiles down to a single, secure, self-contained HTML page containing all styles, responsive vector graphics, and React-driven state machines. There are no external CSS/JS networks or loading dependencies.'
              },
              {
                q: 'Can I study offline?',
                a: 'Yes, because every interactive note is self-contained. Once downloaded, you can run all simulations, quizzes, animations, and read text without any active network connection.'
              },
              {
                q: 'How do I download my purchased notes?',
                a: 'Our interactive notes are best consumed inside our mobile learning app. Once subscribed, you can log in, sync, and download notes directly to your tablet or mobile phone.'
              },
              {
                q: 'Can I purchase individual subjects?',
                a: 'We offer full-access membership plans (1 Month, 6 Months, 12 Months) rather than individual subject payments, providing students with complete catalog access to Physics, Chemistry, Biology, and Math.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6 space-y-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Premium CTA & Pricing Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-transparent border border-blue-100 rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05),transparent_40%)] pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Special Introductory Pricing Active</span>
            </span>
            <h3 className="text-3xl md:text-5xl font-black font-display text-slate-900 tracking-tight leading-tight">
              Unlock Premium Notes Today
            </h3>
            <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Join thousands of science and engineering students mastering complex concepts with secure, animated, interactive notes.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/checkout"
                className="bg-slate-905 bg-[#0F172A] hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Membership Pricing</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="bg-transparent hover:bg-slate-100 text-slate-700 font-bold px-8 py-3.5 rounded-xl text-sm transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
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
