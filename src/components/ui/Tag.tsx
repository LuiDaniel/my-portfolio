import type { ReactNode } from 'react';
import { cn } from '@/lib/ui';

/** Etiqueta neutra (tecnologías de un proyecto o trabajo). */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/8 bg-white/6 px-2.5 py-[5px] text-xs whitespace-nowrap">
      {children}
    </span>
  );
}

export function Tags({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {items.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

/** Marca «ejemplo» de los datos de relleno (solo se ven en desarrollo: son borradores). */
export function ExampleBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-full border border-edge px-[7px] py-[3px] font-mono text-[10px] leading-none tracking-[0.06em] whitespace-nowrap text-faint',
        className,
      )}
    >
      {label}
    </span>
  );
}
