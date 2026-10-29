import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Ambient } from '@/components/layout/Ambient';
import { Footer } from '@/components/layout/Footer';
import { NavBar } from '@/components/layout/NavBar';
import { routing, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { getProfile, getSite } from '@/lib/content';
import { introScript } from '@/lib/intro-script';
import { siteUrl } from '@/lib/seo';
import '../globals.css';

// Solo existen los idiomas de routing: cualquier otro primer segmento (p. ej. /archivo.txt, que el
// proxy no toca) no encaja aquí y lo atiende app/global-not-found.tsx.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const site = getSite(locale as Locale);
  const { name } = getProfile(locale as Locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { template: `%s · ${name}`, default: site.seo.title },
    description: site.seo.description,
    openGraph: { siteName: name },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  const site = getSite(locale as Locale);
  const profile = getProfile(locale as Locale);
  const t = await getTranslations('Nav');

  return (
    // suppressHydrationWarning: el script de <head> añade data-intro a <html> antes de hidratar.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Script en línea a propósito: next/script (beforeInteractive) lo ejecuta después del
            primer pintado y se vería un destello del Home antes de la intro. */}
        <script dangerouslySetInnerHTML={{ __html: introScript(site.intro.enabled) }} />
      </head>
      <body>
        <NextIntlClientProvider>
          {/* Primer elemento enfocable: salta el menú y va al contenido. */}
          <a
            href="#main"
            className="sr-only rounded-full bg-fg px-4 py-2.5 text-sm font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
          >
            {t('skip')}
          </a>
          <Ambient />
          <NavBar initials={profile.initials} items={site.nav} cta={site.navCta} />
          {children}
          <Footer name={profile.name} initials={profile.initials} footer={site.footer} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
