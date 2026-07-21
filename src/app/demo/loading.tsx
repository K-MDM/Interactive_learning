import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DemoLoading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      <Navbar dark={false} />

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-55 pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 z-10 space-y-16">

        {/* Back Link placeholder */}
        <div className="h-5 w-24 bg-slate-200/60 rounded-lg animate-pulse" />

        {/* Hero Skeleton */}
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col items-center">
          <div className="h-6 w-36 bg-primary/10 rounded-full animate-pulse" />
          <div className="h-10 w-64 bg-slate-200/80 rounded-xl animate-pulse mt-2" />
          <div className="h-4 w-full bg-slate-200/60 rounded-lg animate-pulse mt-2" />
          <div className="h-4 w-5/6 bg-slate-200/60 rounded-lg animate-pulse" />
        </div>

        {/* Note Grid Skeleton (3 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between shadow-sm relative overflow-hidden space-y-8"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-4 w-12 bg-slate-100 rounded-lg animate-pulse" />
                </div>

                <div className="h-6 w-3/4 bg-slate-200/70 rounded-lg animate-pulse" />

                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-full bg-slate-100/80 rounded-md animate-pulse" />
                  <div className="h-3.5 w-full bg-slate-100/80 rounded-md animate-pulse" />
                  <div className="h-3.5 w-4/5 bg-slate-100/80 rounded-md animate-pulse" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-9 w-28 bg-slate-200/85 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
