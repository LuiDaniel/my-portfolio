import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { MDXContent } from '@/components/mdx/MDXContent';
import { breadcrumbs, JsonLd } from '@/components/seo/JsonLd';
import { PageHeader } from '@/components/ui/PageHeader';
import { Mock, PAIRS } from '@/components/ui/ProjectCard';
import { Tags } from '@/components/ui/Tag';
import { Toc } from '@/components/ui/Toc';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getProject, getProjects, isPending } from '@/lib/content';
import { formatPeriod } from '@/lib/format';
import { localizedPath, pageMetadata, siteUrl } from '@/lib/seo';
import { accent, vars } from '@/lib/ui';
import styles from '@/components/ui/ProjectCard.module.css';

type Props = PageProps<'/[locale]/proyectos/[slug]'>;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getProjects(params.locale as Locale).map((p) => ({ slug: p.slug }));
}

async function load(params: Props['params']) {
  const { locale, slug } = await params;
  const project = getProject(locale as Locale, slug);
  if (!project) notFound();
  return { locale: locale as Locale, project };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, project } = await load(params);
  return pageMetadata({
    locale,
    href: { pathname: '/proyectos/[slug]', params: { slug: project.slug } },
    title: project.title,
    description: project.summary,
    type: 'article',
  });
}

/** Caso de estudio: cabecera con rol, periodo, stack y enlaces; portada; MDX con índice al lado. */
export default async function ProjectPage({ params }: Props) {
  const { locale, project } = await load(params);
  const t = await getTranslations();
  const all = getProjects(locale);
  const index = all.findIndex((p) => p.slug === project.slug);
  const prev = all[index - 1];
  const next = all[index + 1];
  const [c1, c2] = PAIRS[project.color];
  const links = [
    { href: project.links.demo, label: t('Project.demo') },
    { href: project.links.repo, label: t('Project.repo') },
  ].filter((l): l is { href: string; label: string } => !!l.href && !isPending(l.href));

  const url = (href: Parameters<typeof localizedPath>[0]) =>
    siteUrl() + localizedPath(href, locale);
  const self = url({ pathname: '/proyectos/[slug]', params: { slug: project.slug } });

  return (
    <main id="main" className="wrap" style={vars({ '--c1': accent(c1), '--c2': accent(c2) })}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.summary,
          url: self,
          keywords: project.stack.join(', '),
          inLanguage: locale,
        }}
      />
      <JsonLd
        data={breadcrumbs([
          { name: t('Pages.home.title'), url: url('/') },
          { name: t('Pages.projects.title'), url: url('/proyectos') },
          { name: project.title, url: self },
        ])}
      />
      <PageHeader eyebrow={project.kind} title={project.title} lede={project.summary} color={c1}>
        <dl className="grid max-w-3xl gap-x-10 gap-y-4 text-[15px] sm:grid-cols-[auto_auto_1fr]">
          {project.role && (
            <div>
              <dt className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                {t('Project.role')}
              </dt>
              <dd className="mt-1.5 text-fg">{project.role}</dd>
            </div>
          )}
          <div>
            <dt className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
              {t('Project.period')}
            </dt>
            <dd className="mt-1.5 text-fg">
              {formatPeriod(project.period.start, project.period.end, locale, t('Home.today'))}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
              {t('Project.stack')}
            </dt>
            <dd className="mt-1.5">
              <Tags items={project.stack} />
            </dd>
          </div>
        </dl>
        {links.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-[18px] py-2.5 text-sm font-semibold glass transition-colors hover:bg-glass-hi"
              >
                {l.label}
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            ))}
          </div>
        )}
      </PageHeader>

      <div className={`${styles.media} mx-0! mb-[clamp(40px,6vw,72px)] max-w-5xl enter-card`}>
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt=""
            width={project.cover.width}
            height={project.cover.height}
            placeholder={project.cover.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={project.cover.blurDataURL}
            sizes="(max-width: 1100px) 100vw, 1024px"
            priority
          />
        ) : (
          <Mock seed={project.order} />
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_220px] gap-16 max-lg:grid-cols-1">
        <MDXContent code={project.body} />
        <aside>
          <Toc items={project.toc} label={t('Project.toc')} />
        </aside>
      </div>

      <nav
        aria-label={t('Project.back')}
        className="mt-[clamp(56px,8vw,96px)] grid grid-cols-2 gap-4 border-t border-edge pt-8 max-sm:grid-cols-1"
      >
        {prev ? (
          <Link
            href={{ pathname: '/proyectos/[slug]', params: { slug: prev.slug } }}
            className="rounded-2xl p-5 glass transition-colors hover:bg-glass-hi"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
              <ArrowLeft aria-hidden className="size-3.5" /> {t('Project.previous')}
            </span>
            <span className="mt-2 block font-semibold">{prev.title}</span>
          </Link>
        ) : (
          <Link
            href="/proyectos"
            className="rounded-2xl p-5 glass transition-colors hover:bg-glass-hi"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
              <ArrowLeft aria-hidden className="size-3.5" /> {t('Project.back')}
            </span>
          </Link>
        )}
        {next && (
          <Link
            href={{ pathname: '/proyectos/[slug]', params: { slug: next.slug } }}
            className="rounded-2xl p-5 text-right glass transition-colors hover:bg-glass-hi"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
              {t('Project.next')} <ArrowRight aria-hidden className="size-3.5" />
            </span>
            <span className="mt-2 block font-semibold">{next.title}</span>
          </Link>
        )}
      </nav>
    </main>
  );
}
