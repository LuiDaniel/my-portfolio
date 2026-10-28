import { Card } from '@/components/ui/Card';
import { Tags } from '@/components/ui/Tag';
import { accent, vars, type Accent } from '@/lib/ui';

/** Entrada de la línea de tiempo: nodo de color a la izquierda, fechas en mono a la derecha. */
export function TimelineItem({
  role,
  org,
  when,
  current,
  highlights,
  stack,
  color,
}: {
  role: string;
  org: string;
  when: string;
  current?: string;
  highlights: string[];
  stack: string[];
  color: Accent;
}) {
  return (
    <Card
      className="grid reveal grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 overflow-visible before:absolute before:top-7 before:-left-8 before:size-5 before:rounded-full before:border-[3px] before:border-(--dot) before:bg-bg before:shadow-[0_0_14px_var(--dot)] before:content-[''] max-sm:grid-cols-1"
      style={vars({ '--dot': accent(color), '--glow': 'rgb(246 181 90 / 0.7)' })}
    >
      <div>
        <h3 className="text-xl font-bold tracking-[-0.01em]">
          {role}
          {current && (
            <span className="ml-2 rounded-full bg-mint/14 px-2 py-[3px] align-[3px] text-[11px] font-semibold tracking-[0.04em] text-mint">
              {current}
            </span>
          )}
        </h3>
        <div className="mt-0.5 text-[15px] text-muted">{org}</div>
      </div>
      <div className="text-right font-mono text-[13px] leading-[1.4] font-medium whitespace-nowrap text-faint max-sm:text-left">
        {when}
      </div>
      {highlights.length > 0 && (
        <ul className="col-span-full mt-1.5 list-disc pl-[18px] text-[15px] text-muted">
          {highlights.map((h) => (
            <li key={h} className="mb-1">
              {h}
            </li>
          ))}
        </ul>
      )}
      <Tags items={stack} className="col-span-full mt-1.5" />
    </Card>
  );
}
