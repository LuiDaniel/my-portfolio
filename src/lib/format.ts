import type { Locale } from '@/i18n/routing';
import { isPending } from '@/lib/content';

/** "2025-03" → "mar 2025" / "Mar 2025". Deja tal cual los valores [pendiente]. */
export function formatMonth(value: string, locale: Locale) {
  if (isPending(value)) return value;
  const [year, month = '1'] = value.split('-');
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(date)
    .replace('.', '');
}

/** "2026-11-10" → "10 nov 2026" / "Nov 10, 2026". */
export function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(value),
  );
}

/** Periodo «inicio — fin», con «hoy» cuando sigue en curso. */
export function formatPeriod(start: string, end: string | null, locale: Locale, today: string) {
  return `${formatMonth(start, locale)} — ${end === null ? today : formatMonth(end, locale)}`;
}
