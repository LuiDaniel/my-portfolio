import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';
import { LedEyes } from '@/components/ui/LedEyes';

// 404 dentro de un idioma: los ojos del robot, sorprendidos, y dos salidas.
export default async function NotFound() {
  const t = await getTranslations();
  return (
    <main className="wrap grid min-h-[80dvh] content-center justify-items-center gap-5 pt-32 text-center">
      <LedEyes expression="surprised" />
      <p className="mt-6 font-mono text-sm tracking-[0.3em] text-faint">404</p>
      <h1 className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-bold tracking-[-0.04em]">
        {t('NotFound.title')}
      </h1>
      <p className="max-w-[46ch] text-muted">{t('NotFound.description')}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">{t('NotFound404.home')}</ButtonLink>
        <ButtonLink href="/proyectos" variant="glass" icon="arrow">
          {t('NotFound404.projects')}
        </ButtonLink>
      </div>
    </main>
  );
}
