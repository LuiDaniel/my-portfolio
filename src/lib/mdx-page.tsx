import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MDXContent } from '@/components/mdx/MDXContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { Toc } from '@/components/ui/Toc';
import type { Locale } from '@/i18n/routing';
import { getPage } from '@/lib/content';

type Slug = 'sobre-mi' | 'uses' | 'colofon';

/** Página de content/pages/<slug>/{es,en}.mdx: título, descripción y cuerpo con índice. */
export function mdxPage(slug: Slug) {
  async function load(params: Promise<{ locale: string }>) {
    const page = getPage((await params).locale as Locale, slug);
    if (!page) notFound();
    return page;
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const page = await load(params);
    return { title: page.title, description: page.description };
  }

  async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const page = await load(params);
    const t = await getTranslations('Project');
    return (
      <main className="wrap">
        <PageHeader title={page.title} lede={page.description} />
        <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-16 max-lg:grid-cols-1">
          <MDXContent code={page.body} />
          <aside>
            <Toc items={page.toc} label={t('toc')} />
          </aside>
        </div>
      </main>
    );
  }

  return { generateMetadata, Page };
}
