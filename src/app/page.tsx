'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scrollytelling States
  const [preloaded, setPreloaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // --------------------------------------------------
  // IMAGE PRELOADING CONTROL
  // --------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    const totalFrames = 240;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const preloadImages = () => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const padIndex = String(i).padStart(5, '0');
        img.src = `/seq/${padIndex}.png`;

        img.onload = () => {
          if (!isMounted) return;
          loadedCount++;
          setLoadProgress(Math.floor((loadedCount / totalFrames) * 100));

          if (loadedCount === totalFrames) {
            setImages(loadedImages);
            setPreloaded(true);
          }
        };

        img.onerror = () => {
          console.error(`Failed to load frame: /seq/${padIndex}.png`);
          loadedCount++;
          if (loadedCount === totalFrames && isMounted) {
            setImages(loadedImages);
            setPreloaded(true);
          }
        };

        loadedImages.push(img);
      }
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  // Restore scroll progress from sessionStorage
  useEffect(() => {
    if (!preloaded || images.length === 0) return;

    try {
      const saved = sessionStorage.getItem('keeelai_home_scroll_progress');
      if (saved) {
        const savedProgress = parseFloat(saved);
        if (!isNaN(savedProgress) && savedProgress > 0) {
          // Wait slightly for Next.js layout to stabilize/render before scrolling
          setTimeout(() => {
            if (!containerRef.current) return;
            const totalScrollHeight = containerRef.current.scrollHeight - window.innerHeight;
            const scrollPosition = savedProgress * totalScrollHeight;
            window.scrollTo(0, scrollPosition);
          }, 100);
        }
      }
    } catch (e) {
      console.warn('Failed to restore scroll position:', e);
    }
  }, [preloaded, images]);

  // --------------------------------------------------
  // HIGH-PERFORMANCE SCROLL CANVAS RENDER LOOP
  // --------------------------------------------------
  useEffect(() => {
    if (!preloaded || images.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentFrame = 0;
    let targetFrame = 0;
    const lerp = 0.08;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      renderFrame(Math.round(currentFrame));
    };

    const renderFrame = (frameIndex: number) => {
      const idx = Math.max(0, Math.min(images.length - 1, frameIndex));
      const img = images[idx];
      if (!img) return;

      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      // Cover scaling calculations (Full viewport fit, zero side borders)
      const imgWidth = img.width || 1920;
      const imgHeight = img.height || 1080;
      const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);

      const width = imgWidth * ratio;
      const height = imgHeight * ratio;
      const x = (canvasWidth - width) / 2;
      const y = (canvasHeight - height) / 2;

      ctx.fillStyle = '#05090D';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, width, height);
    };

    const tick = () => {
      currentFrame += (targetFrame - currentFrame) * lerp;
      renderFrame(Math.round(currentFrame));
      animationFrameId = requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollHeight = containerRef.current.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollHeight));
      setScrollProgress(progress);
      targetFrame = progress * (images.length - 1);

      try {
        sessionStorage.setItem('keeelai_home_scroll_progress', progress.toString());
      } catch (e) {
        console.warn('Failed to save scroll position to sessionStorage:', e);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', handleScroll, { passive: true });

    resizeCanvas();
    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [preloaded, images]);

  const getOverlayOpacityAndStyle = (
    progress: number,
    start: number,
    peakStart: number,
    peakEnd: number,
    end: number
  ) => {
    let opacity = 0;
    let translateY = 24;

    if (progress >= start && progress <= end) {
      if (progress < peakStart) {
        const t = (progress - start) / (peakStart - start);
        opacity = t;
        translateY = 24 - t * 24;
      } else if (progress > peakEnd) {
        const t = (progress - peakEnd) / (end - peakEnd);
        opacity = 1 - t;
        translateY = -t * 24;
      } else {
        opacity = 1;
        translateY = 0;
      }
    } else if (progress < start) {
      opacity = 0;
      translateY = 24;
    } else if (progress > end) {
      opacity = 0;
      translateY = -24;
    }

    return {
      opacity,
      transform: `translate3d(0, ${translateY}px, 0)`,
      transition: 'opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
      pointerEvents: opacity > 0.3 ? 'auto' : 'none'
    } as React.CSSProperties;
  };

  return (
    <div className="bg-[#05090D] text-white flex flex-col min-h-screen relative font-sans select-none antialiased">
      <Navbar dark={true} />

      {/* --------------------------------------------------
         PREMIUM MINIMAL LOADING SCREEN
      -------------------------------------------------- */}
      <div
        className={`fixed inset-0 bg-[#05090D] z-[999] flex flex-col items-center justify-center transition-all duration-700 pointer-events-none ${preloaded ? 'opacity-0 scale-98' : 'opacity-100'
          }`}
      >
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-500 animate-float" />
            <span className="text-xl font-extrabold tracking-tight font-display text-white">KEEEL AI</span>
          </div>
          <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse-slow">
            Preloading Scrollytelling Experience ({loadProgress}%)
          </p>
        </div>
      </div>

      {/* --------------------------------------------------
         CINEMATIC STICKY CANVAS SCROLLER TRACK
      -------------------------------------------------- */}
      <div ref={containerRef} className="relative w-screen h-[500vh] z-10 block">

        {/* Sticky Canvas Frame Viewport - Enforce absolute full screen size */}
        <div className="sticky top-0 w-screen h-screen overflow-hidden bg-[#05090D] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-screen h-screen object-cover pointer-events-none block"
          />

          {/* ─────────────────────────────────────────────
             TEXT OVERLAYS SYNCHRONIZED TO SCROLL
          ───────────────────────────────────────────── */}

          {/* OVERLAY 1: 0 - 20% (Centered) */}
          <div
            style={getOverlayOpacityAndStyle(scrollProgress, 0.0, 0.02, 0.12, 0.18)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto"
          >
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-tight font-display tracking-tight drop-shadow-md">
              The End of Static Notes.
            </h2>
            <p className="text-lg md:text-2xl text-slate-350 font-semibold mt-4">
              Learning should move.
            </p>
          </div>

          {/* OVERLAY 2: 20 - 45% (Left Aligned) */}
          <div
            style={getOverlayOpacityAndStyle(scrollProgress, 0.18, 0.23, 0.38, 0.43)}
            className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 md:px-24 max-w-2xl"
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] font-display tracking-tight drop-shadow-md">
              Every Concept Comes Alive.
            </h2>
            <p className="text-md md:text-xl text-slate-355 font-semibold mt-4 leading-relaxed">
              Watch atoms, molecules, and systems unfold in real time.
            </p>
          </div>

          {/* OVERLAY 3: 45 - 70% (Right Aligned) */}
          <div
            style={getOverlayOpacityAndStyle(scrollProgress, 0.43, 0.48, 0.63, 0.68)}
            className="absolute inset-0 flex flex-col justify-center items-end text-right px-8 md:px-24 ml-auto max-w-2xl"
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] font-display tracking-tight drop-shadow-md">
              See What Textbooks Can't Show.
            </h2>
            <p className="text-md md:text-xl text-slate-355 font-semibold mt-4 leading-relaxed">
              Interactive simulations built directly into every lesson.
            </p>
          </div>

          {/* OVERLAY 4: 70 - 90% (Left Aligned) */}
          <div
            style={getOverlayOpacityAndStyle(scrollProgress, 0.68, 0.72, 0.83, 0.88)}
            className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 md:px-24 max-w-2xl"
          >
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.1] font-display tracking-tight drop-shadow-md">
              Designed For Deep Understanding.
            </h2>
            <p className="text-md md:text-xl text-slate-355 font-semibold mt-4 leading-relaxed">
              Not PDFs. Not videos. Real interaction.
            </p>
          </div>

          {/* OVERLAY 5: 90 - 100% (Centered final CTA) */}
          <div
            style={getOverlayOpacityAndStyle(scrollProgress, 0.88, 0.92, 1.0, 1.0)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[1.1] font-display tracking-tight drop-shadow-lg">
              Knowledge. Visualized.
            </h2>
            <p className="text-md md:text-xl text-slate-355 font-semibold mt-4">
              Experience premium interactive learning.
            </p>
            <div className="pt-8 pointer-events-auto">
              <Link
                href="/demo"
                className="bg-white hover:bg-slate-100 text-black font-bold px-8 py-4 rounded-full text-base transition-all active:scale-[0.98] shadow-md hover:shadow-lg inline-flex items-center gap-2"
              >
                <span>Explore Notes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Subtle scroll progress indicators at the bottom
          <div className="absolute bottom-10 left-10 hidden sm:flex flex-col gap-2 opacity-50 z-20 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <span className={`${scrollProgress < 0.18 ? 'text-white font-black' : ''}`}>01. Start</span>
            <span className={`${scrollProgress >= 0.18 && scrollProgress < 0.43 ? 'text-white font-black' : ''}`}>02. Structures</span>
            <span className={`${scrollProgress >= 0.43 && scrollProgress < 0.68 ? 'text-white font-black' : ''}`}>03. Lab Tech</span>
            <span className={`${scrollProgress >= 0.68 && scrollProgress < 0.88 ? 'text-white font-black' : ''}`}>04. Systems</span>
            <span className={`${scrollProgress >= 0.88 ? 'text-white font-black' : ''}`}>05. Checkout</span>
          </div> */}

        </div>
      </div>

      {/* <Footer dark={true} /> */}
    </div>
  );
}
