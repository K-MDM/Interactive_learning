'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Direction the element travels in from. */
  from?: Direction;
  /** Stagger children instead of animating the wrapper (expects direct element children). */
  stagger?: boolean;
  /** Delay in seconds. */
  delay?: number;
  /** Distance in px for translate reveals. */
  distance?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const offsets: Record<Direction, (d: number) => gsap.TweenVars> = {
  up: (d) => ({ y: d, opacity: 0 }),
  down: (d) => ({ y: -d, opacity: 0 }),
  left: (d) => ({ x: d, opacity: 0 }),
  right: (d) => ({ x: -d, opacity: 0 }),
  scale: () => ({ scale: 0.85, opacity: 0 }),
};

/**
 * Scroll-in reveal driven by IntersectionObserver (NOT ScrollTrigger), so it
 * reports real on-screen visibility and can never get stuck hidden when a
 * late font swap / image reflows the page and staled cached positions.
 */
export default function Reveal({
  children,
  className,
  from = 'up',
  stagger = false,
  delay = 0,
  distance = 40,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as React.ElementType;

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: gsap.TweenTarget = stagger
      ? (Array.from(el.children) as HTMLElement[])
      : el;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    // Hidden start state.
    gsap.set(targets, offsets[from](distance));

    let played = false;
    let tween: gsap.core.Tween | undefined;
    const play = () => {
      if (played) return;
      played = true;
      tween = gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.12 : 0,
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 }
    );
    io.observe(el);

    // Safety net: if the element is already within the viewport on mount
    // (e.g. above the fold) reveal it even if the observer is slow to fire.
    const safety = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        play();
        io.disconnect();
      }
    }, 500);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      tween?.kill();
    };
  }, [from, stagger, delay, distance]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
