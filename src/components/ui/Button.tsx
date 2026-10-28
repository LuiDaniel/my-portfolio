import { ArrowDownToLine, ArrowRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/ui';

const base =
  'inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 px-[22px] py-3.5 text-[15px] font-semibold transition-[transform,background-color,box-shadow] duration-[120ms,250ms,300ms] ease-out active:scale-97 [&_svg]:size-4 [&_svg]:transition-transform [&_svg]:duration-350 [&_svg]:ease-spring';

const variants = {
  // Hover: halo índigo y la flecha avanza 3 px.
  primary:
    'bg-fg text-bg hover:shadow-[0_8px_30px_rgb(120_130_255/0.35)] hover:[&_svg]:translate-x-[3px]',
  // Hover: cristal más claro y el icono baja 2 px.
  glass: 'glass hover:bg-glass-hi hover:[&_svg]:translate-y-0.5',
};

type Variant = keyof typeof variants;

/** Botón-enlace interno (con idioma) del diseño: `primary` con flecha o `glass` con descarga. */
export function ButtonLink({
  variant = 'primary',
  className,
  children,
  ...props
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props}>
      {children}
      {variant === 'primary' ? <ArrowRight aria-hidden /> : <ArrowDownToLine aria-hidden />}
    </Link>
  );
}

/** Igual que ButtonLink pero para archivos o direcciones externas (p. ej. el PDF del CV). */
export function ButtonAnchor({
  variant = 'glass',
  className,
  children,
  ...props
}: { variant?: Variant } & ComponentProps<'a'>) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
      {variant === 'primary' ? <ArrowRight aria-hidden /> : <ArrowDownToLine aria-hidden />}
    </a>
  );
}

/** Botón de formulario con el estilo primario. */
export function Button({
  className,
  children,
  icon = <ArrowRight aria-hidden />,
  ...props
}: ComponentProps<'button'> & { icon?: ReactNode }) {
  return (
    <button className={cn(base, variants.primary, 'disabled:opacity-60', className)} {...props}>
      {children}
      {icon}
    </button>
  );
}
