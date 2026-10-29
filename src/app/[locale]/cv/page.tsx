import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CvSheet } from '@/components/sections/CvSheet';
import { PrintButton } from '@/components/ui/PrintButton';
import { ButtonAnchor } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Locale } from '@/i18n/routing';
import { getProfile } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/cv'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  return pageMetadata({
    locale,
    href: '/cv',
    title: t('Pages.cv.title'),
    description: t('CV.lede'),
  });
}

/** CV en HTML (imprimible) con descarga del PDF que genera `npm run cv`. */
export default async function CvPage({ params }: PageProps<'/[locale]/cv'>) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  const { cv } = getProfile(locale);

  return (
    <main id="main" className="wrap">
      <PageHeader title={t('Pages.cv.title')} lede={t('CV.lede')}>
        <div className="flex flex-wrap gap-3">
          <ButtonAnchor href={cv} download variant="primary">
            {t('CV.download')}
          </ButtonAnchor>
          <PrintButton label={t('CV.print')} />
        </div>
      </PageHeader>
      <CvSheet locale={locale} />
    </main>
  );
}
