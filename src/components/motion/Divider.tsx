import React from 'react';

/**
 * Short, centered, on-brand gradient divider — a soft playful separator that
 * sits over the 3D backdrop without covering it (unlike a full-width rule).
 */
export default function Divider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-candy-blue/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-candy-indigo to-candy-coral" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-candy-coral/40" />
    </div>
  );
}
