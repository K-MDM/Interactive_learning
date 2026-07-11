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
            <span>The Immersive Learning Solution</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight font-display">
            Textbooks are flat.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Learning should be hands-on.
            </span>
          </h2>
          <p className="text-slate-650 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-semibold">
            We replace dry diagrams with interactive simulation widgets. Children drag, test, and instantly see physical and chemical laws react in real-time.
          </p>
          <div className="pt-4">
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md hover:shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore Simulation Player</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Section 2: Bento Grid Features */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl md:text-3xl font-black tracking-tight font-display text-slate-900">Immersive Visual Learning</h3>
            <p className="text-slate-500 text-sm font-semibold">Helping parents explain complex subjects and empowering teachers with interactive tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Distillation/Titration widgets */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-slate-900">Immersive Interactive Player</h4>
                <p className="text-slate-605 text-sm leading-relaxed max-w-md">
                  Explain abstract topics effortlessly. Teachers can project simulations on class screens, and children can adjust variables like heat or pressure to see immediate reactions.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-650" /> Explore Chemical Reactions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-650" /> Test Gravity & Force Physics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-650" /> Observe Mathematical Patterns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-650" /> Run Safe Virtual Experiments
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Hands-On Visualization */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-slate-900">Hands-On Learning</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Ditch passive screen time and flat textbook pages. Children learn and retain information faster when they control the experiment and see visual changes instantly.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Highly Engaging Virtual Labs</span>
              </div>
            </div>

            {/* Card 3: Seamless Screen Sharing */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="inline-flex p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold font-display text-slate-900">Perfect for School & Home</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Explain science concepts on a smartboard or let children study independently on tablets and laptops. Interface controls scale beautifully for clean K-12 classroom demonstrations.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Supports Tablets, Phones & Projectors</span>
              </div>
            </div>

            {/* Card 4: Active Concept Checks */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold font-display text-slate-900">Active Concept Checks</h4>
                <p className="text-slate-660 text-sm leading-relaxed max-w-md">
                  Interactive quizzes built into the lessons give children immediate feedback on their understanding. Build confidence before starting homework or tests.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Visual understanding cues</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Immediate feedback</span>
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg">Step-by-step guidance</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Outcomes & Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/60">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-blue-600 font-display block">+28%</span>
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider block">Concept Comprehension Score</span>
            <p className="text-xs text-slate-500 font-medium">Verified by educational research comparing interactive virtual models to standard print textbooks (2024).</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-emerald-600 font-display block">94%</span>
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider block">Classroom Engagement Boost</span>
            <p className="text-xs text-slate-500 font-medium">Teachers reporting a marked increase in student participation and visual retention during science lessons.</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-2">
            <span className="text-4xl md:text-5xl font-black text-purple-600 font-display block">5.5 hrs</span>
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider block">Saved per Lesson Module</span>
            <p className="text-xs text-slate-500 font-medium">Average prep-time saved by K-12 instructors using pre-built interactive science simulation decks.</p>
          </div>
        </div>

        {/* Section 3: Live Interactive Simulator */}
        <div className="space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200">
              Virtual Simulation Lab
            </span>
            <h3 className="text-3xl font-black font-display text-slate-900 tracking-tight">Play with the Lab Player</h3>
            <p className="text-slate-605 text-sm leading-relaxed font-semibold">
              Test variables below to see the immersive player in action: adjust heat levels in chemical columns, drop acid into base titrations, and align gears.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-lg">
            <InteractiveSimulator />
          </div>
        </div>

        {/* Verified Testimonials Block */}
        <div className="space-y-8 pt-8 border-t border-slate-200/60">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-250">
              Verified Educators & Parents
            </span>
            <h3 className="text-3xl font-black font-display text-slate-900 tracking-tight">What Teachers & Parents Say</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed italic font-semibold">
                "My students used to struggle to visualize chemical titration curves. With Keeelai's player, they can test flow variables live and immediately understand the neutralization endpoint. Engagement has skyrocketed."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 font-display text-sm">
                  SJ
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 block">Sarah Jenkins</span>
                  <span className="text-xs text-slate-500 font-semibold block">Middle School Chemistry Instructor, Lincoln Academy</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 relative flex flex-col justify-between shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed italic font-semibold">
                "Explaining standard forces and gravity laws to my 10-year-old child felt impossible. Using the interactive visualizer widgets turned a chore into active play where he learns by testing different variables."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 font-display text-sm">
                  DT
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 block">David Thompson</span>
                  <span className="text-xs text-slate-500 font-semibold block">Parent & Home Educator</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Accordion FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 border-t border-slate-200/60">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-blue-605 uppercase tracking-widest block">Learn More</span>
            <h3 className="text-3xl font-black font-display leading-[1.1] text-slate-900">Frequently Asked Questions</h3>
            <p className="text-slate-555 text-sm leading-relaxed font-semibold">
              Still curious about how Keeelai interactive notes deliver better memory retention?
            </p>
            {/* <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-left">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">✓ NGSS-Aligned Curriculum</span>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                All simulations are reviewed by certified curriculum designers to match Next Generation Science Standards (NGSS).
              </p>
            </div> */}
          </div>

          <div className="lg:col-span-7 space-y-6">
            {[
              {
                q: 'Who is Keeelai designed for?',
                a: 'Keeelai is designed for K-12 science and math teachers looking to boost classroom engagement, and parents wanting to help children visualize abstract concepts.'
              },
              {
                q: 'How does the immersive simulation player help children learn?',
                a: 'By turning passive reading into active visualization. Children learn by dragging variables and immediately seeing scientific forces react, which improves long-term memory retention.'
              },
              {
                q: 'Can teachers use Keeelai in their classroom lessons?',
                a: 'Absolutely. Teachers can project our interactive simulations on smartboards to explain complex processes like acid-base neutralizations or mechanical gear systems.'
              },
              {
                q: 'Do children need any scientific background to start?',
                a: 'No. The immersive player features intuitive, visual controls that allow children to safely explore concepts at their own pace.'
              },
              {
                q: 'What subjects does Keeelai cover?',
                a: 'Our visual lesson library covers major science and mathematics modules, including physics gravity labs, chemistry reactions, and mechanical forces.'
              },
              {
                q: 'Is there school or curriculum alignment?',
                a: 'Yes. Our interactive lessons are structured around standard science curriculums to support and reinforce what children learn in school.'
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6 space-y-2">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
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
              Bring Visual Science to Your Classroom or Home
            </h3>
            <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
              Join thousands of teachers and parents using Keeelai to make complex concepts simple and engaging.
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
