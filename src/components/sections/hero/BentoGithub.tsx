import { getTranslations } from 'next-intl/server';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Card, CardLabel } from '@/components/ui/Card';
import type { Contributions } from '@/lib/github';
import { cn, vars } from '@/lib/ui';
import styles from './Bento.module.css';

const LEVEL_COLORS = ['gh-0', 'gh-1', 'gh-2', 'gh-3', 'gh-4'] as const;
const levelColor = (level: number) => `var(--color-${LEVEL_COLORS[level] ?? 'gh-0'})`;

/** Contribuciones reales del último año con la escala de verdes de GitHub. */
export async function BentoGithub({ data, i }: { data: Contributions; i: number }) {
  const t = await getTranslations('Home');
  return (
    <Card glass={false} className={cn(styles.github, 'enter-card')} style={vars({ '--i': i })}>
      <CardLabel>
        <span className="inline-flex items-center gap-2">
          <BrandIcon brand="github" className="size-3.5 text-fg" />
          {t('activity')}
        </span>
      </CardLabel>
      <div className="mb-3 text-[26px] leading-none font-bold tracking-[-0.03em]">
        {data.total}{' '}
        <span className="text-[13px] font-medium tracking-normal text-muted">
          {t('contributions')}
        </span>
      </div>
      <div className={styles.heat} aria-hidden>
        {data.weeks.flatMap((week, w) =>
          week.map((level, d) => <i key={`${w}-${d}`} style={{ background: levelColor(level) }} />),
        )}
      </div>
      <div
        className={cn(
          styles.legend,
          'mt-2.5 flex items-center justify-end gap-[3px] text-[11px] text-faint',
        )}
        aria-hidden
      >
        <span className="mx-1">{t('less')}</span>
        {LEVEL_COLORS.map((_, level) => (
          <i key={level} style={{ background: levelColor(level) }} />
        ))}
        <span className="mx-1">{t('more')}</span>
      </div>
    </Card>
  );
}
