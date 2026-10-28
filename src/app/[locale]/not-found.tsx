import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// 404 dentro de un idioma. El diseño definitivo (ojos LED «surprised») llega en la fase 6.
export default async function NotFound() {
  const t = await getTranslations('NotFound');
  return (
    <main className="wrap grid min-h-[70dvh] content-center justify-items-start gap-4 pt-32">
      <p className="font-mono text-sm tracking-[0.1em] text-faint">404</p>
      <h1 className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-bold tracking-[-0.04em]">
        {t('title')}
      </h1>
      <p className="text-muted">{t('description')}</p>
      <Link
        href="/"
        className="mt-4 rounded-full bg-fg px-5 py-3 text-[15px] font-semibold text-bg transition-transform duration-[120ms] ease-out active:scale-97"
      >
        {t('back')}
      </Link>
    </main>
  );
}
