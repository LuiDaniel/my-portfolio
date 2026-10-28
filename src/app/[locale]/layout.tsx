import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Ambient } from '@/components/layout/Ambient';
import { Footer } from '@/components/layout/Footer';
import { NavBar } from '@/components/layout/NavBar';
import { routing, type Locale } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { getSiteFixture } from '@/lib/site-fixture';
import '../globals.css';

// Solo existen los idiomas de routing: cualquier otro primer segmento (p. ej. /archivo.txt, que el
// proxy no toca) no encaja aquí y lo atiende app/global-not-found.tsx.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const { name } = getSiteFixture(locale as Locale);
  return { title: { template: `%s · ${name}`, default: name } };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  const site = getSiteFixture(locale as Locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <Ambient />
          <NavBar initials={site.initials} items={site.nav} cta={site.navCta} />
          {children}
          <Footer name={site.name} initials={site.initials} footer={site.footer} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
