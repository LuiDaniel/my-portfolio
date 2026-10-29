import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BlogList } from '@/components/sections/BlogList';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Locale } from '@/i18n/routing';
import { getPosts } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  return pageMetadata({
    locale,
    href: '/blog',
    title: t('Pages.blog.title'),
    description: t('Blog.lede'),
  });
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  const posts = getPosts(locale).map(({ body: _body, toc: _toc, ...rest }) => rest);
  // Sin artículos publicados el blog no existe (el menú y el pie tampoco lo enlazan).
  if (posts.length === 0) notFound();

  return (
    <main id="main" className="wrap">
      <PageHeader title={t('Pages.blog.title')} lede={t('Blog.lede')} color="coral" />
      <BlogList posts={posts} />
    </main>
  );
}
