import { getTranslations } from 'next-intl/server';
import { PostCard } from '@/components/ui/PostCard';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Locale } from '@/i18n/routing';
import { getHome, getPosts } from '@/lib/content';

/** Últimos artículos del idioma (si no hay ninguno publicado, la sección no aparece). */
export async function LatestPosts({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home');
  const { blog: section } = getHome(locale);
  const posts = getPosts(locale, { limit: section.limit });
  if (posts.length === 0) return null;

  return (
    <section id="blog" aria-labelledby="t-blog" className="wrap section-gap">
      <SectionHead
        id="t-blog"
        eyebrow={section.eyebrow}
        title={section.title}
        color="coral"
        more={section.more}
      />
      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            locale={locale}
            className="reveal"
            labels={{
              minutes: t('minutes', { minutes: post.metadata.readingTime }),
              example: t('example'),
            }}
          />
        ))}
      </div>
    </section>
  );
}
