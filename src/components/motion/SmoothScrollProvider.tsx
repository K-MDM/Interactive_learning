'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LenisContext = createContext<Lenis | null>(null);

/** Access the shared Lenis instance (e.g. to scroll to an anchor). */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Recomputes ScrollTrigger's cached trigger positions once the page's
 * initial layout has actually settled — specifically when web fonts swap in
 * and on window `load` (late images / chunks). Without this, ScrollTrigger
 * measures positions early; if a bold display font swaps in a beat later,
 * everything below it reflows and those cached positions go stale, so
 * elements below the fold never reveal until a hard refresh.
 *
 * NOTE: intentionally a small set of one-off refreshes — NOT a
 * ResizeObserver on <body>, because refresh() itself can nudge layout and
 * create a feedback loop that constantly resets scrub animations (killing
 * the parallax / scroll motion). ScrollTrigger already auto-refreshes on
 * window resize on its own.
 */
function useScrollTriggerRefresh() {
  useEffect(() => {
    const timers: number[] = [];
    const refresh = () => ScrollTrigger.refresh();

    // A couple of staggered passes cover most first-paint reflow timing.
    timers.push(window.setTimeout(refresh, 250));
    timers.push(window.setTimeout(refresh, 800));

    if (document.readyState !== 'complete') {
      window.addEventListener('load', refresh);
    }

    document.fonts?.ready?.then(refresh).catch(() => {});

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('load', refresh);
    };
  }, []);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useScrollTriggerRefresh();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // For users who prefer reduced motion, skip smoothing entirely.
    if (prefersReduced) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger in sync with Lenis' virtual scroll.
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
