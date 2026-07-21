'use client';

import { useEffect, useRef } from 'react';
import * as animeModule from 'animejs';

function getAnimeFn(): any {
  if (typeof animeModule === 'function') return animeModule;
  if (typeof (animeModule as any).default === 'function') return (animeModule as any).default;
  if (typeof (animeModule as any).default?.default === 'function') return (animeModule as any).default.default;
  return animeModule;
}

interface UseAnimeStaggerOptions {
  targets: string;
  translateY?: [number, number];
  scale?: [number, number];
  opacity?: [number, number];
  delayStagger?: number;
  duration?: number;
  easing?: string;
  triggerOnScroll?: boolean;
}

/**
 * Custom hook for Anime.js staggered entrance animations
 */
export function useAnimeStagger({
  targets,
  translateY = [35, 0],
  scale = [0.95, 1],
  opacity = [0, 1],
  delayStagger = 120,
  duration = 900,
  easing = 'spring(1, 80, 12, 0)',
  triggerOnScroll = true,
}: UseAnimeStaggerOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(targets);
    if (!elements || elements.length === 0) return;

    const anime = getAnimeFn();

    const runAnimation = () => {
      if (typeof anime === 'function') {
        anime({
          targets: elements,
          translateY,
          scale,
          opacity,
          delay: typeof anime.stagger === 'function' ? anime.stagger(delayStagger, { start: 100 }) : delayStagger,
          duration,
          easing,
        });
      }
    };

    if (triggerOnScroll && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runAnimation();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    } else {
      runAnimation();
    }
  }, [targets, translateY, scale, opacity, delayStagger, duration, easing, triggerOnScroll]);

  return containerRef;
}

/**
 * Custom hook for Anime.js animated counter numbers
 */
export function useAnimeCountUp(targetValue: number, decimalPlaces: number = 0) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;

    const element = countRef.current;
    const obj = { val: 0 };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const anime = getAnimeFn();
            if (typeof anime === 'function') {
              anime({
                targets: obj,
                val: targetValue,
                round: decimalPlaces === 0 ? 1 : 10,
                duration: 2000,
                easing: 'easeOutExpo',
                update: () => {
                  if (element) {
                    element.textContent = decimalPlaces > 0
                      ? obj.val.toFixed(decimalPlaces)
                      : Math.round(obj.val).toString();
                  }
                },
              });
            } else if (element) {
              element.textContent = decimalPlaces > 0
                ? targetValue.toFixed(decimalPlaces)
                : Math.round(targetValue).toString();
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [targetValue, decimalPlaces]);

  return countRef;
}
