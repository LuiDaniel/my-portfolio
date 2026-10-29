import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/SectionHead';
import { vars, type Accent } from '@/lib/ui';

/** Cabecera de las páginas interiores: eyebrow, título grande, entradilla y un extra opcional. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  color = 'violet',
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  color?: Accent;
  children?: ReactNode;
}) {
  return (
    <header className="pt-[clamp(120px,14vw,170px)] pb-[clamp(32px,5vw,56px)]">
      {eyebrow && (
        <div className="enter-text" style={vars({ '--i': 0 })}>
          <Eyebrow color={color}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h1
        className="enter-text text-[clamp(40px,6vw,76px)] leading-[1] font-bold tracking-[-0.045em] text-balance"
        style={vars({ '--i': 1 })}
      >
        {title}
      </h1>
      {lede && (
        <p
          className="mt-5 max-w-[58ch] enter-text text-[clamp(17px,1.35vw,19px)] leading-[1.6] text-muted"
          style={vars({ '--i': 2 })}
        >
          {lede}
        </p>
      )}
      {children && (
        <div className="mt-7 enter-text" style={vars({ '--i': 3 })}>
          {children}
        </div>
      )}
    </header>
  );
}
