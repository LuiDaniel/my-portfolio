'use client';

import { useEffect, useState } from 'react';

/**
 * Id de la sección que ocupa el centro de la pantalla (franja entre el 45 % y el 50 % de alto),
 * como el menú de la maqueta. `null` si ninguna de `ids` está en esa franja o no existe.
 */
export function useScrollSpy(ids: string[], enabled = true) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return;
    const elements = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key, enabled]);

  return enabled ? active : null;
}
