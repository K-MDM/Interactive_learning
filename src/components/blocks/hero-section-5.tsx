'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[86dvh] flex flex-col justify-center">
      {/* Playful floating accent blobs (decorative, over the 3D backdrop) */}
      <div className="pointer-events-none absolute inset-0 -z-[1]">
        <div className="absolute left-[6%] top-[22%] h-24 w-24 rounded-full bg-candy-yellow/30 blur-2xl animate-float-slow" />
        <div className="absolute right-[10%] top-[28%] h-32 w-32 rounded-full bg-candy-coral/25 blur-2xl animate-float" />
        <div className="absolute left-[18%] bottom-[16%] h-28 w-28 rounded-full bg-candy-teal/25 blur-2xl animate-float-slow" />
      </div>

      <div className="py-20 md:pb-24 lg:pb-28 lg:pt-40">
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col px-6 text-center">
          <Reveal from="scale" className="mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-candy-indigo/25 text-candy-indigo px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-7 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Immersive Visual Learning Simulator</span>
            </div>
          </Reveal>

          <Reveal from="up" delay={0.05}>
            <h1 className="mx-auto max-w-3xl text-balance text-5xl md:text-7xl font-black font-display tracking-tight text-[#0F172A] xl:text-8xl leading-[1.02]">
              Bring Any Subject{' '}
              <span className="text-gradient-fun">To Life</span>
            </h1>
          </Reveal>

          <Reveal from="up" delay={0.12}>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-base md:text-xl text-slate-600 font-semibold leading-relaxed">
              Keeelai is an interactive learning platform that helps teachers
              explain complex concepts and lets children run hands-on virtual
              simulations across every subject.
            </p>
          </Reveal>

          <Reveal from="up" delay={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-13 bg-candy-blue hover:bg-candy-indigo text-white font-bold rounded-full pl-7 pr-5 text-sm transition-all active:scale-[0.98] shadow-xl shadow-candy-blue/40 ring-2 ring-white/60 cursor-pointer">
                <Link href="/demo">
                  <span className="text-nowrap">Explore Experience Zone</span>
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-13 text-slate-900 font-bold rounded-full px-7 text-sm bg-white hover:bg-slate-50 border border-slate-300 shadow-md cursor-pointer">
                <Link href="/checkout">
                  <span className="text-nowrap">Membership Plans</span>
                </Link>
              </Button>
            </div>
          </Reveal>

          {/* Scroll hint */}
          <Reveal from="up" delay={0.35} className="mx-auto mt-12">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Scroll to explore
              </span>
              <span className="flex h-9 w-5 items-start justify-center rounded-full border-2 border-slate-300 p-1">
                <span className="h-2 w-1 rounded-full bg-candy-indigo animate-float" />
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
