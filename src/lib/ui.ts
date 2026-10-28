import type { CSSProperties } from 'react';

/** Une clases condicionales (sin dependencias: las clases de la app no se pisan entre sí). */
export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

export type Accent = 'blue' | 'indigo' | 'violet' | 'green' | 'mint' | 'amber' | 'coral' | 'cyan';

/** Un acento de la paleta mezclado con transparente (fondos 16–22 %, bordes 30–45 %, brillos 80 %). */
export const accent = (color: Accent, percent = 100) =>
  percent >= 100
    ? `var(--color-${color})`
    : `color-mix(in srgb, var(--color-${color}) ${percent}%, transparent)`;

/** Variables CSS en `style` con tipos (p. ej. { '--glow': … }). */
export const vars = (values: Record<`--${string}`, string | number>) => values as CSSProperties;
