import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogList } from '@/components/sections/BlogList';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Locale } from '@/i18n/routing';
import { getPosts } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t('Pages.blog.title'), description: t('Blog.lede') };
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  const posts = getPosts(locale).map(({ body: _body, toc: _toc, ...rest }) => rest);

  return (
    <main className="wrap">
      <PageHeader title={t('Pages.blog.title')} lede={t('Blog.lede')} color="coral" />
      <BlogList posts={posts} />
    </main>
  );
}
