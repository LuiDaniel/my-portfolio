import type { MetadataRoute } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { getPosts, getProjects } from '@/lib/content';
import { localizedPath, siteUrl } from '@/lib/seo';

type Href = Parameters<typeof localizedPath>[0];

/** sitemap.xml con todas las páginas en los dos idiomas (y sus alternativas hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entry = (href: Href, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: base + localizedPath(href, routing.defaultLocale),
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l: Locale) => [l, base + localizedPath(href, l)]),
      ),
    },
  });

  const pages: Href[] = ['/', '/proyectos', '/blog', '/sobre-mi', '/cv', '/uses', '/colofon'];
  const projects = getProjects(routing.defaultLocale).map((p) =>
    entry({ pathname: '/proyectos/[slug]', params: { slug: p.slug } }),
  );
  // Un artículo puede existir en un solo idioma: se listan los de cada idioma por separado.
  const posts = routing.locales.flatMap((locale) =>
    getPosts(locale).map((p) => ({
      url: base + localizedPath({ pathname: '/blog/[slug]', params: { slug: p.slug } }, locale),
      lastModified: p.date,
    })),
  );

  return [...pages.map((href) => entry(href)), ...projects, ...posts];
}
