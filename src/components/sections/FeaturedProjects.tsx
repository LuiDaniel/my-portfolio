import { getTranslations } from 'next-intl/server';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Locale } from '@/i18n/routing';
import { getHome, getProjects } from '@/lib/content';

/** Proyectos destacados: el primero grande, a todo el ancho, y los demás debajo de dos en dos. */
export async function FeaturedProjects({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home');
  const { projects: section } = getHome(locale);
  const projects = getProjects(locale, { featured: true }).slice(0, section.limit);
  if (projects.length === 0) return null;
  const labels = { caseStudy: t('caseStudy'), example: t('example') };

  return (
    <section id="projects" aria-labelledby="t-projects" className="wrap section-gap">
      <SectionHead
        id="t-projects"
        eyebrow={section.eyebrow}
        title={section.title}
        color="blue"
        more={section.more}
      />
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            big={i === 0}
            labels={labels}
            className="reveal"
          />
        ))}
      </div>
    </section>
  );
}
