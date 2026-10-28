'use client';

import { useEffect } from 'react';

/**
 * Borde iluminado de las tarjetas: un único listener para toda la página que actualiza --mx/--my
 * de la tarjeta (.glow-edge) bajo el cursor. Se monta una vez, en el layout (vía Ambient).
 */
export function usePointerGlow() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('.glow-edge');
      if (!card) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => {
      removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
}
