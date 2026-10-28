'use client';

import { useEffect, useRef } from 'react';

// Atmósfera del fondo: tres manchas que derivan, luz que sigue al cursor y grano.
export function Ambient() {
  const spot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spot.current;
    const fine = matchMedia('(pointer: fine)').matches;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || !fine || reduced) return;

    const move = (e: PointerEvent) => {
      el.style.opacity = '1';
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-[18vmax] -right-[12vmax] size-[52vmax] animate-drift rounded-full bg-blob-blue opacity-50 blur-[90px]" />
      <div
        className="absolute top-[22vmax] right-[8vmax] size-[40vmax] animate-drift rounded-full bg-blob-violet opacity-40 blur-[90px]"
        style={{ animationDuration: '34s', animationDirection: 'alternate-reverse' }}
      />
      <div
        className="absolute -bottom-[14vmax] -left-[12vmax] size-[30vmax] animate-drift rounded-full bg-blob-deep opacity-45 blur-[90px]"
        style={{ animationDuration: '40s' }}
      />
      <div
        ref={spot}
        className="absolute top-0 left-0 size-[640px] -translate-1/2 rounded-full opacity-0 transition-opacity duration-400 spotlight"
      />
      <div className="absolute inset-0 grain opacity-50" />
    </div>
  );
}
