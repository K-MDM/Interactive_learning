'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { ChevronRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90dvh] flex flex-col justify-center bg-[#FAF9F6]">
      <div className="py-24 md:pb-32 lg:pb-36 lg:pt-56">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
          <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">

            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-250 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-650" />
              <span>Immersive Science & Math Visualizer</span>
            </div>

            <h1 className="max-w-2xl text-balance text-5xl md:text-6xl font-black font-display tracking-tight text-[#0F172A] xl:text-7xl leading-[1.05]">
              Bring Science & Math <br />
              <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                To Life
              </span>
            </h1>

            <blockquote className="my-5 border-l-4 border-emerald-550 border-emerald-500 pl-4 text-m font-semibold text-slate-500 italic max-w-xl text-left">
              Keeelai is an learning platform that helps teachers explain complex concepts and enables children to run hands-on virtual experiments using an immersive simulation player.
            </blockquote>

            {/* <p className="mt-4 max-w-2xl text-balance text-base md:text-lg text-slate-650 font-semibold leading-relaxed">
              Help your children visualize abstract concepts. Keeelai empowers teachers with live classroom simulations and gives children a hands-on virtual lab player to learn by doing.
            </p> */}

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full pl-6 pr-4 text-sm transition-all active:scale-[0.98] shadow-md shadow-blue-500/25 cursor-pointer">
                <Link href="/demo">
                  <span className="text-nowrap">Explore Demo Notes</span>
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-12 text-slate-700 hover:text-slate-900 font-bold rounded-full px-6 text-sm hover:bg-slate-100 border border-slate-200 cursor-pointer">
                <Link href="/checkout">
                  <span className="text-nowrap">Membership Plans</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background DNA video loop */}
        <div className="aspect-[2/3] absolute inset-1 overflow-hidden rounded-3xl border border-slate-200/50 sm:aspect-video lg:rounded-[3rem] z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="size-full object-cover opacity-35 invert"
            src="https://ik.imagekit.io/lrigu76hy/tailark/dna-video.mp4?updatedAt=1745736251477"
          />
          {/* Subtle gradient vignette at the bottom of the video */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent opacity-95" />
        </div>
      </div>

      {/* Brands Slider Section */}
      <div className="bg-transparent border-t border-slate-200/60 pb-8 pt-4">
        <div className="group relative m-auto max-w-7xl px-6">
          <div className="flex flex-col items-center md:flex-row gap-6">
            <div className="md:max-w-44 md:border-r md:border-slate-200 md:pr-6 whitespace-nowrap">
              <p className="text-center md:text-right text-xs font-bold uppercase tracking-widest text-slate-400">Powering Elite Teams</p>
            </div>
            <div className="relative py-2 md:w-[calc(100%-11rem)] w-full">
              <InfiniteSlider
                speedOnHover={20}
                speed={40}
                gap={112}
              >
                <div className="flex items-center">
                  <img
                    className="mx-auto h-5 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                    alt="Nvidia Logo"
                    height="20"
                    width="auto"
                  />
                </div>

                <div className="flex items-center">
                  <img
                    className="mx-auto h-4 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/column.svg"
                    alt="Column Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex items-center">
                  <img
                    className="mx-auto h-4 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="GitHub Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex items-center">
                  <img
                    className="mx-auto h-5 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Nike Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex items-center">
                  <img
                    className="mx-auto h-5 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                    alt="Lemon Squeezy Logo"
                    height="20"
                    width="auto"
                  />
                </div>
                <div className="flex items-center">
                  <img
                    className="mx-auto h-4 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                    alt="Laravel Logo"
                    height="16"
                    width="auto"
                  />
                </div>
                <div className="flex items-center">
                  <img
                    className="mx-auto h-7 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                    alt="Lilly Logo"
                    height="28"
                    width="auto"
                  />
                </div>

                <div className="flex items-center">
                  <img
                    className="mx-auto h-6 w-fit opacity-40 hover:opacity-90 transition-opacity"
                    src="https://html.tailus.io/blocks/customers/openai.svg"
                    alt="OpenAI Logo"
                    height="24"
                    width="auto"
                  />
                </div>
              </InfiniteSlider>

              <div className="bg-gradient-to-r from-[#FAF9F6] to-transparent absolute inset-y-0 left-0 w-20 pointer-events-none z-10"></div>
              <div className="bg-gradient-to-l from-[#FAF9F6] to-transparent absolute inset-y-0 right-0 w-20 pointer-events-none z-10"></div>
              <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10"
                direction="left"
                blurIntensity={1}
              />
              <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10"
                direction="right"
                blurIntensity={1}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
