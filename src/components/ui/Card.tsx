import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/ui';

/** Etiqueta mono en mayúsculas de la cabecera de una tarjeta (con un extra a la derecha). */
export function CardLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mb-3.5 flex items-center justify-between gap-2 font-mono text-[11px] leading-none font-medium tracking-[0.1em] text-faint uppercase',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Base de todas las tarjetas: radio 24 px, padding 22 px, borde iluminado que sigue al cursor
 * (--mx/--my los pone usePointerGlow) y subida de 3 px en hover. `glass` = cristal translúcido;
 * sin él, la tarjeta pinta su propio fondo (bento de stack, GitHub o reloj).
 */
export function Card({
  as: Tag = 'article',
  glass = true,
  flush = false,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  glass?: boolean;
  /** Sin padding (la tarjeta de proyecto coloca su miniatura a 10 px del borde). */
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag
      className={cn(
        'group/card glow-edge relative min-w-0 overflow-hidden rounded-card transition-[transform,background-color] duration-500 ease-spring hover:-translate-y-[3px]',
        !flush && 'p-[22px]',
        glass && 'glass',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
