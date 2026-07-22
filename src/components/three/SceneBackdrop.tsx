'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// WebGL scene only loads on the client (three.js touches window/document).
const AbstractScene = dynamic(() => import('./AbstractScene'), { ssr: false });

interface SceneBackdropProps {
  /** Number of floating shapes on desktop. */
  density?: number;
  /** Extra opacity for the cream veil that keeps text readable (0-1). */
  veil?: number;
}

/**
 * Fixed, full-viewport playful backdrop:
 *   1. animated CSS color-mesh (instant, also the no-WebGL fallback)
 *   2. floating three.js candy geometry
 *   3. a soft cream veil so foreground copy stays legible
 */
export default function SceneBackdrop({ density = 11, veil = 0.16 }: SceneBackdropProps) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 mesh-bg" />
      <AbstractScene className="absolute inset-0 h-full w-full" density={density} />
      {/* Light vertical wash — keeps the scene fully visible/immersive */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(250,249,246,${veil}) 0%, rgba(250,249,246,${Math.min(
            veil + 0.06,
            1
          )}) 55%, rgba(250,249,246,${Math.min(veil + 0.1, 1)}) 100%)`,
        }}
      />
      {/* Soft focus behind the reading column — subtle, not a fog */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 55% at 50% 42%, rgba(250,249,246,0.34) 0%, rgba(250,249,246,0.12) 60%, rgba(250,249,246,0) 82%)',
        }}
      />
    </div>
  );
}
