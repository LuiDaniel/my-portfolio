import { routing, type Locale } from '@/i18n/routing';
import { getPosts, getProfile, getSite } from '@/lib/content';
import { localizedPath, siteUrl } from '@/lib/seo';

// RSS del blog por idioma: /rss.xml (español) y /en/rss.xml (inglés).

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const xml = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`,
  );

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const base = siteUrl();
  const site = getSite(locale);
  const profile = getProfile(locale);
  const items = getPosts(locale)
    .map((post) => {
      const url =
        base + localizedPath({ pathname: '/blog/[slug]', params: { slug: post.slug } }, locale);
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${xml(post.description)}</description>
${post.tags.map((tag) => `      <category>${xml(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xml(`${profile.name} · Blog`)}</title>
    <link>${base + localizedPath('/blog', locale)}</link>
    <description>${xml(site.seo.description)}</description>
    <language>${locale}</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
