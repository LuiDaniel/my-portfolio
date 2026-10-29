import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProjectsGrid } from '@/components/sections/ProjectsGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Locale } from '@/i18n/routing';
import { getProjects } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/proyectos'>): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  return pageMetadata({
    locale,
    href: '/proyectos',
    title: t('Pages.projects.title'),
    description: t('Projects.lede'),
  });
}

export default async function ProjectsPage({ params }: PageProps<'/[locale]/proyectos'>) {
  const locale = (await params).locale as Locale;
  const t = await getTranslations();
  // Al cliente solo va lo que pinta la tarjeta (sin el cuerpo MDX).
  const projects = getProjects(locale).map(({ body: _body, toc: _toc, ...rest }) => rest);

  return (
    <main id="main" className="wrap">
      <PageHeader title={t('Pages.projects.title')} lede={t('Projects.lede')} />
      <ProjectsGrid projects={projects} />
    </main>
  );
}
