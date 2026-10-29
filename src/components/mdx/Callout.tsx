import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { accent, vars, type Accent } from '@/lib/ui';

const KINDS = {
  info: { icon: Info, color: 'blue' },
  tip: { icon: Lightbulb, color: 'mint' },
  warning: { icon: TriangleAlert, color: 'amber' },
} satisfies Record<string, { icon: typeof Info; color: Accent }>;

/** Nota destacada: <Callout type="tip">…</Callout> (info, tip o warning). */
export function Callout({
  type = 'info',
  children,
}: {
  type?: keyof typeof KINDS;
  children: ReactNode;
}) {
  const { icon: Icon, color } = KINDS[type];
  return (
    <aside
      className="my-6 flex gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--c)_35%,transparent)] bg-[color-mix(in_srgb,var(--c)_10%,transparent)] px-[18px] py-4 text-[15.5px] text-fg [&>div>*+*]:mt-2"
      style={vars({ '--c': accent(color) })}
    >
      <Icon aria-hidden className="mt-1 size-[18px] flex-none text-(--c)" />
      <div>{children}</div>
    </aside>
  );
}
