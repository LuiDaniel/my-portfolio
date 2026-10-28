import { GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn, vars } from '@/lib/ui';
import styles from './Bento.module.css';

/** Formación: icono en degradado ámbar → coral, carrera y píldora «En curso · universidad». */
export function BentoEducation({
  degree,
  status,
  university,
  i,
}: {
  degree: string;
  status: string;
  university: string;
  i: number;
}) {
  return (
    <Card className={cn(styles.education, 'enter-card')} style={vars({ '--i': i })}>
      <div className={cn(styles.eduIcon, 'mb-3.5 grid size-11 place-items-center rounded-[14px]')}>
        <GraduationCap aria-hidden className="size-[22px]" strokeWidth={2} />
      </div>
      <div className="text-xl leading-[1.2] font-[650] tracking-[-0.02em]">{degree}</div>
      <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber/14 px-2.5 py-1 text-xs text-amber">
        ● {status} · {university}
      </span>
    </Card>
  );
}
