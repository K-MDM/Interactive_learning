'use client';

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      gsap.set(stagger ? el.children : el, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : el;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        ...offsets[from](distance),
        duration: 0.9,
        delay,
        ease: 'power3.out',
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [from, stagger, delay, distance]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
