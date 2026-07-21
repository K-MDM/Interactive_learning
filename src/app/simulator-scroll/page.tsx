'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KeeelScrollSimulator from '@/components/KeeelScrollSimulator';
import InteractiveSimulator from '@/components/InteractiveSimulator';

export default function SimulatorScrollPage() {
  return (
    <div className="bg-[#05090D] text-white min-h-screen font-sans selection:bg-primary selection:text-white">
      <Navbar dark={true} />

      {/* 240-Frame Interactive Scrollytelling Sequence */}
      <KeeelScrollSimulator />

      {/* Follow-up Interactive Simulator Workspace */}
      <section className="max-w-6xl mx-auto px-6 py-24 relative z-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="bg-primary/15 text-primary-bright border border-primary/30 text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            Live Simulator Zone
          </span>
          <h2 className="text-4xl font-black font-display text-white tracking-tight">
            Test the Interactive Player Live
          </h2>
          <p className="text-slate-400 text-sm font-semibold leading-relaxed">
            Adjust distillation kinetics, acid-base titration drops, gear speed ratios, and interactive quiz decks below.
          </p>
        </div>

        <InteractiveSimulator />
      </section>

      <Footer />
    </div>
  );
}
