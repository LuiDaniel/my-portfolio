import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MDXContent } from '@/components/mdx/MDXContent';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { COVERS } from '@/components/ui/PostCard';
import { Tags } from '@/components/ui/Tag';
import { Toc } from '@/components/ui/Toc';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getPost, getPosts } from '@/lib/content';
import { formatDate } from '@/lib/format';

type Props = PageProps<'/[locale]/blog/[slug]'>;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getPosts(params.locale as Locale).map((p) => ({ slug: p.slug }));
}

async function load(params: Props['params']) {
  const { locale, slug } = await params;
  const post = getPost(locale as Locale, slug);
  if (!post) notFound();
  return { locale: locale as Locale, post };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await load(params);
  return { title: post.title, description: post.description };
}

/** Artículo: fecha, tiempo de lectura y etiquetas; portada en degradado; MDX con índice. */
export default async function PostPage({ params }: Props) {
  const { locale, post } = await load(params);
  const t = await getTranslations();

  return (
    <main className="wrap">
      <Link
        href="/blog"
        className="group absolute top-[clamp(96px,11vw,128px)] inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
        />
        {t('Blog.back')}
      </Link>
      <PageHeader title={post.title} lede={post.description} color={post.color}>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-faint">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span aria-hidden>·</span>
          <span>{t('Blog.readingTime', { minutes: post.metadata.readingTime })}</span>
        </div>
        <Tags items={post.tags} className="mt-4" />
      </PageHeader>

      <div
        aria-hidden
        className="relative mb-[clamp(40px,6vw,72px)] aspect-[16/6] max-w-5xl enter-card overflow-hidden rounded-[18px] max-sm:aspect-video"
        style={{ background: COVERS[post.color] }}
      >
        {post.icon && (
          <Icon
            name={post.icon}
            className="absolute -top-6 -right-6 size-[clamp(160px,22vw,280px)] text-white opacity-20"
          />
        )}
        {post.label && (
          <b className="absolute bottom-[clamp(12px,2vw,24px)] left-[clamp(16px,3vw,32px)] text-[clamp(56px,9vw,120px)] font-bold tracking-[-0.05em] text-white/90 mix-blend-overlay">
            {post.label}
          </b>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-16 max-lg:grid-cols-1">
        <MDXContent code={post.body} />
        <aside>
          <Toc items={post.toc} label={t('Project.toc')} />
        </aside>
      </div>
    </main>
  );
}
