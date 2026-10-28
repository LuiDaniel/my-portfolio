import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { navHref } from '@/lib/nav';
import { accent, vars, type Accent } from '@/lib/ui';
import type { NavLink } from '@/lib/content';

/** Eyebrow con punto de color + h2 (con parte final atenuada) + enlace «Ver más» o un extra. */
export function SectionHead({
  id,
  eyebrow,
  title,
  titleSoft,
  color,
  more,
  aside,
}: {
  id: string;
  eyebrow: string;
  title: string;
  titleSoft?: string;
  color: Accent;
  more?: NavLink;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-9 flex reveal flex-wrap items-end justify-between gap-6">
      <div>
        <Eyebrow color={color}>{eyebrow}</Eyebrow>
        <h2 id={id} className="text-h2">
          {title} {titleSoft && <span className="text-faint">{titleSoft}</span>}
        </h2>
      </div>
      {more && (
        <Link
          href={navHref(more)}
          className="group inline-flex items-center gap-2 text-[15px] font-semibold text-muted transition-colors hover:text-fg"
        >
          {more.label}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-400 ease-spring group-hover:translate-x-1"
          />
        </Link>
      )}
      {aside}
    </div>
  );
}

export function Eyebrow({ color, children }: { color: Accent; children: ReactNode }) {
  return (
    <div className="mb-3.5 inline-flex items-center gap-2 font-mono text-xs leading-none font-medium tracking-[0.1em] text-faint uppercase">
      <i
        aria-hidden
        className="size-[7px] rounded-full bg-(--c) shadow-[0_0_12px_var(--c)]"
        style={vars({ '--c': accent(color) })}
      />
      {children}
    </div>
  );
}
