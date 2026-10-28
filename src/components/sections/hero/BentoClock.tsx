'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Card, CardLabel } from '@/components/ui/Card';
import { cn, vars } from '@/lib/ui';
import styles from './Bento.module.css';

type Time = { h: number; m: number; s: number; text: string };

/** Hora en una zona horaria (o la del navegador si es undefined), sin depender de librerías. */
function now(timeZone: string | undefined, locale: string): Time {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const text = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
  return { h: get('hour'), m: get('minute'), s: get('second'), text };
}

/**
 * Reloj analógico + digital con cielo de día (7–19 h) o de noche. El servidor pinta la esfera sin
 * agujas; el cliente las coloca (así no hay diferencias de hidratación).
 */
export function BentoClock({
  timeZone,
  place,
  i,
  wide,
}: {
  timeZone?: string;
  place: string;
  i: number;
  wide?: boolean;
}) {
  const t = useTranslations('Home');
  const locale = useLocale();
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    const tick = () => setTime(now(timeZone, locale));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone, locale]);

  const day = time !== null && time.h >= 7 && time.h < 19;
  const rotate = (deg: number) => ({ transform: `rotate(${deg}deg)` });

  return (
    <Card
      glass={false}
      className={cn(
        styles.clock,
        day ? styles.day : styles.night,
        'grid enter-card grid-cols-[auto_1fr] items-center gap-4',
        wide && 'col-span-2 max-sm:col-span-1',
      )}
      style={vars({ '--i': i })}
    >
      <div className={styles.dial} aria-hidden>
        {time && (
          <>
            <i className={styles.h} style={rotate((time.h % 12) * 30 + time.m * 0.5)} />
            <i className={styles.m} style={rotate(time.m * 6 + time.s * 0.1)} />
            <i className={styles.s} style={rotate(time.s * 6)} />
          </>
        )}
      </div>
      <div>
        <CardLabel className="mb-2 text-white/70">{t('localTime')}</CardLabel>
        <div className="font-mono text-[22px] leading-none font-medium tracking-[-0.02em] tabular-nums">
          <time suppressHydrationWarning>{time?.text ?? '--:--'}</time>
        </div>
        <div className="mt-1.5 text-[12.5px] text-white/72">{place}</div>
      </div>
    </Card>
  );
}
