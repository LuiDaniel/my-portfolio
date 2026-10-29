import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale, type Pathname } from '@/i18n/routing';
import { getProfile, isPending } from '@/lib/content';
import { plainText } from '@/lib/rich-text';
import * as data from '#site/content';

// SEO común (docs/06-calidad.md#seo): URL base, canonical, hreflang y Open Graph por página.

/** URL pública del sitio: NEXT_PUBLIC_SITE_URL, si no la de site.json, y en local localhost. */
export function siteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || (isPending(data.site.url) ? '' : data.site.url);
  return (url || 'http://localhost:3000').replace(/\/$/, '');
}

type Href = Parameters<typeof getPathname>[0]['href'];

/** Ruta pública de una página en un idioma (con /en delante en inglés). */
export const localizedPath = (href: Href, locale: Locale) => getPathname({ href, locale });

/** Metadatos de una página: título, descripción, canonical, hreflang y Open Graph. */
export function pageMetadata({
  locale,
  href,
  title,
  description,
  type = 'website',
}: {
  locale: Locale;
  href: Href;
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localizedPath(href, l)]),
  ) as Record<Locale, string>;
  // Imagen de app/[locale]/opengraph-image.tsx sin el prefijo /es (así no pasa por una redirección).
  const image = `${locale === routing.defaultLocale ? '' : `/${locale}`}/opengraph-image`;
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: {
      canonical: languages[locale],
      languages: { ...languages, 'x-default': languages[routing.defaultLocale] },
    },
    openGraph: {
      type,
      title,
      description,
      url: languages[locale],
      images: [{ url: image, width: 1200, height: 630 }],
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => (l === 'es' ? 'es_ES' : 'en_US')),
    },
    twitter: { card: 'summary_large_image', images: [image] },
  };
}

/** Datos estructurados de la persona (portada y sobre mí). */
export function personJsonLd(locale: Locale) {
  const profile = getProfile(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: plainText(profile.tagline),
    url: siteUrl(),
    sameAs: profile.socials.map((s) => s.url).filter((url) => !isPending(url)),
  };
}

export type { Pathname };
