'use client';

import { ArrowUpRight, Copy, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { BrandIcon, isBrand } from '@/components/ui/BrandIcon';
import { useCopy } from '@/hooks/useCopy';
import { vars } from '@/lib/ui';

const row =
  'flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-edge bg-white/4 px-4 py-3.5 text-left transition-[background-color,transform,border-color] duration-[200ms,400ms,200ms] ease-spring hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--c)_50%,transparent)] hover:bg-white/8';

// Color de cada acceso directo (LinkedIn usa su azul de marca).
const COLORS: Record<string, string> = {
  email: 'var(--color-coral)',
  linkedin: '#3b8eea',
  github: 'var(--color-violet)',
};

/** Accesos directos: email (se copia), LinkedIn y GitHub. */
export function ContactLinks({
  email,
  socials,
}: {
  email: string;
  socials: { id: string; label: string; url: string; handle: string }[];
}) {
  const t = useTranslations('Home');
  const { copy, copied } = useCopy();

  return (
    <div className="grid gap-2.5">
      <button
        type="button"
        className={row}
        style={vars({ '--c': COLORS.email! })}
        onClick={() => copy(email)}
      >
        <Badge>
          <Mail aria-hidden className="size-[18px]" />
        </Badge>
        <span>
          <b className="block text-[15px] font-semibold">Email</b>
          <small className="text-[13px] text-faint" aria-live="polite">
            {copied ? t('copied') : `${email} · ${t('clickToCopy')}`}
          </small>
        </span>
        <Copy aria-hidden className="ml-auto size-4 text-faint" />
      </button>
      {socials.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className={row}
          style={vars({ '--c': COLORS[s.id] ?? 'var(--color-blue)' })}
        >
          <Badge>{isBrand(s.id) ? <BrandIcon brand={s.id} className="size-[18px]" /> : null}</Badge>
          <span>
            <b className="block text-[15px] font-semibold">{s.label}</b>
            <small className="text-[13px] text-faint">{s.handle}</small>
          </span>
          <ArrowUpRight aria-hidden className="ml-auto size-4 text-faint" />
        </a>
      ))}
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-9 flex-none place-items-center rounded-[11px] bg-[color-mix(in_srgb,var(--c)_20%,transparent)] text-(--c)">
      {children}
    </span>
  );
}
