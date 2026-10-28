'use client';

import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrandIcon, isBrand } from '@/components/ui/BrandIcon';
import { useCopy } from '@/hooks/useCopy';
import { cn, vars } from '@/lib/ui';

// Relleno de cada red al pasar el cursor (de abajo arriba).
const FILLS: Record<string, string> = {
  github: 'linear-gradient(135deg, #2b3137, #6e5494)',
  linkedin: 'linear-gradient(135deg, #0a66c2, #3b8eea)',
  email: 'linear-gradient(135deg, var(--color-coral), var(--color-violet))',
};

const circle =
  'relative isolate grid size-11 cursor-pointer place-items-center overflow-hidden rounded-full border border-edge bg-glass text-muted transition-[transform,color,border-color] duration-450 ease-spring ' +
  'before:absolute before:inset-0 before:-z-1 before:translate-y-[101%] before:bg-(image:--fill) before:transition-transform before:duration-450 before:ease-spring before:content-[""] ' +
  'hover:-translate-y-[3px] hover:border-transparent hover:text-white hover:before:translate-y-0 active:-translate-y-px active:scale-94 ' +
  '[&_svg]:size-[18px] [&_svg]:transition-transform [&_svg]:duration-450 [&_svg]:ease-spring hover:[&_svg]:scale-108 hover:[&_svg]:-rotate-6';

const tip =
  'pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-5 -translate-x-1/2 translate-y-1 rounded-lg border border-edge bg-[rgb(24_26_40/0.92)] px-[9px] py-[5px] text-xs whitespace-nowrap text-fg opacity-0 transition-[opacity,translate] duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100';

/** Icono redondo de una red (enlace) o del email (copia la dirección). Etiqueta al pasar el cursor. */
export function SocialIcon({
  id,
  label,
  url,
  email,
}: {
  id: string;
  label: string;
  url?: string;
  email?: string;
}) {
  const t = useTranslations('Home');
  const { copy, copied, failed } = useCopy();
  const style = vars({ '--fill': FILLS[id] ?? 'var(--grad)' });
  const icon = isBrand(id) ? <BrandIcon brand={id} /> : <Mail aria-hidden strokeWidth={1.8} />;

  if (email !== undefined) {
    const text = copied ? t('copied') : failed ? email : t('copyEmail');
    return (
      <span className="group relative">
        <button type="button" className={circle} style={style} onClick={() => copy(email)}>
          {icon}
          <span className="sr-only">{t('copyEmail')}</span>
        </button>
        <span className={tip} aria-live="polite">
          {text}
        </span>
      </span>
    );
  }

  return (
    <span className="group relative">
      <a
        className={cn(circle)}
        style={style}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
      >
        {icon}
      </a>
      <span className={tip} aria-hidden>
        {label}
      </span>
    </span>
  );
}
