import { About } from '@/components/sections/About';
import { Contact } from '@/components/sections/Contact';
import { Education } from '@/components/sections/Education';
import { Experience } from '@/components/sections/Experience';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { Hero } from '@/components/sections/Hero';
import { LatestPosts } from '@/components/sections/LatestPosts';
import { Skills } from '@/components/sections/Skills';
import type { Locale } from '@/i18n/routing';
import { getHome, type SectionId } from '@/lib/content';

const SECTIONS: Record<SectionId, (props: { locale: Locale }) => React.ReactNode> = {
  about: About,
  projects: FeaturedProjects,
  experience: Experience,
  skills: Skills,
  education: Education,
  blog: LatestPosts,
  contact: Contact,
};

/** Home: el hero siempre primero y después las secciones en el orden de home.json. */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale;
  const { sections } = getHome(locale);

  return (
    <main>
      <Hero locale={locale} />
      {sections.map((id) => {
        const Section = SECTIONS[id];
        return <Section key={id} locale={locale} />;
      })}
    </main>
  );
}
