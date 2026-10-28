'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Link } from '@/i18n/navigation';
import type { SiteData } from '@/lib/site-fixture';
import { LocaleSwitch } from './LocaleSwitch';
import { navHref } from '@/lib/nav';

// Panel del menú en < 980 px (no está en la maqueta: mismo cristal que el menú, cae desde él).
// Se cierra con Esc, al tocar fuera o al elegir un enlace.
export function MobileMenu({
  items,
  active,
  onClose,
}: {
  items: SiteData['nav'];
  active: number;
  onClose: (focusButton?: boolean) => void;
}) {
  const t = useTranslations('Nav');
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.querySelector('a')?.focus();

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose(true);
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      const nav = panel.current?.parentElement;
      if (nav && !nav.contains(target)) onClose();
    };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onPointer);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('pointerdown', onPointer);
    };
  }, [onClose]);

  return (
    <div
      ref={panel}
      id="mobile-menu"
      className="pointer-events-auto mt-2 w-full max-w-[420px] origin-top animate-drop rounded-card p-2 glass-nav md:hidden"
      style={{ animationDuration: '0.45s' }}
    >
      <ul className="grid">
        {items.map((item, i) => (
          <li key={item.label}>
            <Link
              href={navHref(item)}
              aria-current={i === active ? 'page' : undefined}
              onClick={() => onClose()}
              className="flex rounded-2xl px-4 py-3 text-[17px] text-muted transition-colors duration-200 hover:bg-glass-hi hover:text-fg aria-[current=page]:text-fg"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-1 flex items-center justify-between border-t border-edge px-4 pt-3 pb-1.5">
        <span className="font-mono text-xs tracking-[0.1em] text-faint uppercase">
          {t('language')}
        </span>
        <LocaleSwitch />
      </div>
    </div>
  );
}
