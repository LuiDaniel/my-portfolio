import { getTranslations } from 'next-intl/server';
import { Card, CardLabel } from '@/components/ui/Card';
import { cn, vars } from '@/lib/ui';
import styles from './Bento.module.css';

/** Stack principal: chips con el color de cada tecnología sobre rejilla de puntos. */
export async function BentoStack({
  items,
  i,
  wide,
}: {
  items: { name: string; color: string }[];
  i: number;
  wide?: boolean;
}) {
  const t = await getTranslations('Home');
  return (
    <Card
      glass={false}
      className={cn(styles.stack, 'enter-card', wide && 'col-span-2 max-sm:col-span-1')}
      style={vars({ '--i': i })}
    >
      <CardLabel>{t('stack')}</CardLabel>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item.name} className={styles.chip} style={vars({ '--dot': item.color })}>
            <i aria-hidden />
            {item.name}
          </span>
        ))}
      </div>
    </Card>
  );
}
