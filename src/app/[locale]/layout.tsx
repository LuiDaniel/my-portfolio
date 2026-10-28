import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
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

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
