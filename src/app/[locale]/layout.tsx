import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Ambient } from '@/components/layout/Ambient';
import { Footer } from '@/components/layout/Footer';
import { NavBar } from '@/components/layout/NavBar';
import { routing, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { getProfile, getSite } from '@/lib/content';
import { introScript } from '@/lib/intro-script';
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
    title: { template: `%s · ${name}`, default: site.seo.title },
    description: site.seo.description,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  const site = getSite(locale as Locale);
  const profile = getProfile(locale as Locale);

  return (
    // suppressHydrationWarning: el script de <head> añade data-intro a <html> antes de hidratar.
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript(site.intro.enabled) }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Ambient />
          <NavBar initials={profile.initials} items={site.nav} cta={site.navCta} />
          {children}
          <Footer name={profile.name} initials={profile.initials} footer={site.footer} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
