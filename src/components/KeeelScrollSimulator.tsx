'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

const TOTAL_FRAMES = 240;

export default function KeeelScrollSimulator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Framer Motion Scroll Progress (0 -> 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Track scroll progress as React state for reliable conditional rendering
  const [scrollPct, setScrollPct] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setScrollPct(v));

  // Hero intro is visible only before 8% scroll
  const showHero = scrollPct < 0.08;

  // Mid-scroll story beats — two beats split evenly across 8%→85%
  const showBeat1 = scrollPct >= 0.15 && scrollPct < 0.47;  // LEFT
  const showBeat2 = scrollPct >= 0.53 && scrollPct < 0.80;  // RIGHT

  // CTA is visible only in the final 15% of the scroll sequence
  const showCTA = scrollPct >= 0.85;

  // 2. Preload Image Sequence (/seq/00001.png -> /seq/00240.png)
  useEffect(() => {
    let isMounted = true;
    const loadedImgs: HTMLImageElement[] = [];
    let count = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(5, '0');
      img.src = `/seq/${frameNum}.png`;

      img.onload = () => {
        if (!isMounted) return;
        count++;
        setLoadProgress(Math.floor((count / TOTAL_FRAMES) * 100));
        if (count === TOTAL_FRAMES) {
          setImages(loadedImgs);
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        if (!isMounted) return;
        count++;
        setLoadProgress(Math.floor((count / TOTAL_FRAMES) * 100));
        if (count === TOTAL_FRAMES) {
          setImages(loadedImgs);
          setIsLoaded(true);
        }
      };

      loadedImgs.push(img);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Draw Frame on Canvas with "contain" fit and high-DPI scaling
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !images[frameIndex]) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[frameIndex];
    if (!img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Calculate "cover" aspect ratio to fill 100% of the screen width and height
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;

    let drawWidth = displayWidth;
    let drawHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = displayHeight * imgRatio;
      offsetX = (displayWidth - drawWidth) / 2;
    } else {
      drawHeight = displayWidth / imgRatio;
      offsetY = (displayHeight - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  // 4. Listen to scroll updates via requestAnimationFrame
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    let animationFrameId: number;

    const updateCanvas = () => {
      const progress = scrollYProgress.get();
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * TOTAL_FRAMES))
      );

      drawFrame(frameIndex);
      animationFrameId = requestAnimationFrame(updateCanvas);
    };

    animationFrameId = requestAnimationFrame(updateCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded, images, scrollYProgress]);

  // Handle Resize
  useEffect(() => {
    if (!isLoaded) return;
    const handleResize = () => {
      const progress = scrollYProgress.get();
      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * TOTAL_FRAMES))
      );
      drawFrame(frameIndex);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, scrollYProgress]);

  return (
    <div ref={containerRef} className="relative w-full h-[450vh] bg-[#05090D] text-white">
      {/* Preloader overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05090D] space-y-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold font-display tracking-wide text-slate-200">
              Loading KEEEL AI 3D Simulation...
            </h3>
            <p className="text-sm font-mono text-blue-400 font-semibold">{loadProgress}%</p>
          </div>
        </div>
      )}

      {/* Sticky Fullscreen Canvas Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          className="w-screen h-screen object-cover pointer-events-none z-0"
        />

        {/* Ambient Dark Gradient Vignette for seamless text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05090D] via-transparent to-[#05090D]/80 pointer-events-none z-1" />

        {/* Story Text Overlays Container */}
        <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-6 pointer-events-none">

          {/* Hero Intro — only visible before 8% scroll, then unmounts cleanly */}
          <AnimatePresence>
            {showHero && (
              <motion.div
                key="hero-intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-24 sm:top-28 md:top-32 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 text-center space-y-4 pointer-events-auto"
              >
                {/* AEO brand pill */}
                <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-500/40 text-blue-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg shadow-blue-500/10">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span>KEEEL AI · Immersive Learning Platform</span>
                </div>

                {/* SEO H1 — primary keyword: interactive 3D learning simulator */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black font-display tracking-tight text-white leading-[1.05]">
                  Welcome to the Universe of
                  <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">
                    Experiential Learning
                  </span>
                </h1>

                {/* AEO extraction sentence — 25-40 words, standalone */}
                <p className="text-slate-300 text-sm sm:text-base md:text-lg font-semibold max-w-2xl mx-auto leading-relaxed">
                  KEEEL AI is an interactive 3D learning simulator for K-12 students that replaces flat textbooks with immersive simulations, games, and visual models across every subject.
                </p>

                <div className="pt-1">
                  <span className="text-xs text-blue-400/80 uppercase tracking-widest font-mono font-bold animate-bounce block">
                    ↓ Scroll to explore the simulation
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beat 1 — LEFT (15% → 32%) */}
          <AnimatePresence>
            {showBeat1 && (
              <motion.div
                key="beat-1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 left-6 sm:left-10 md:left-16 max-w-[260px] sm:max-w-xs pointer-events-none"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                  Immersive STEM
                </span>
                <p className="text-white text-2xl sm:text-3xl font-black font-display leading-[1.1] [text-shadow:0_2px_20px_rgba(0,0,0,1)]">
                  Every topic.<br />Immersive 3D<br />simulations.
                </p>
                <p className="text-slate-300 text-sm font-semibold mt-3 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,1)]">
                  Chemistry, Physics, Biology & Geography — live in your browser.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beat 2 — RIGHT (38% → 58%) */}
          <AnimatePresence>
            {showBeat2 && (
              <motion.div
                key="beat-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-10 md:right-16 max-w-[260px] sm:max-w-xs pointer-events-none text-right"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
                  Hands-On Exploration
                </span>
                <p className="text-white text-2xl sm:text-3xl font-black font-display leading-[1.1] [text-shadow:0_2px_20px_rgba(0,0,0,1)]">
                  Step away<br />from textbooks.<br />Dive in.
                </p>
                <p className="text-slate-300 text-sm font-semibold mt-3 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,1)]">
                  Manipulate 3D vectors, gear ratios & topographic contour lines.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final CTA — only mounts into DOM when scroll >= 85% */}
          <AnimatePresence>
            {showCTA && (
              <motion.div
                key="cta-overlay"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 text-center space-y-6 pointer-events-auto"
              >
                <div className="inline-flex items-center gap-2 bg-blue-950/90 border border-blue-400/40 text-blue-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Every Subject. Every Concept. In 3D.</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white leading-tight">
                  Teaching Is Now Interesting,<br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Engaging & Highly Effective.
                  </span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base md:text-lg font-semibold leading-relaxed max-w-xl mx-auto">
                  Say goodbye to rote memorization. Start your immersive, experiential learning journey today — with regular updates at no extra cost.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-13 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-full px-8 text-sm shadow-xl shadow-blue-500/30 cursor-pointer flex items-center gap-2">
                    <Link href="/demo">
                      <span>Explore Experience Zone</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-13 text-slate-200 hover:text-white font-extrabold rounded-full px-8 text-sm border-slate-700 hover:bg-slate-900/80 backdrop-blur-md cursor-pointer transition-all">
                    <Link href="/checkout">
                      <span>Membership Plans</span>
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
