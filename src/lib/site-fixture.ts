import type { Locale, Pathname } from '@/i18n/routing';

// ⚠ Provisional (fase 2): datos fijos con la forma de content/site.json y profile.json
// (docs/07-datos.md). En la fase 3 se sustituyen por src/lib/content.ts y este archivo se borra.

type Text = Record<Locale, string>;
type StaticPathname = Exclude<Pathname, `${string}[${string}`>;

export type SiteLink =
  { label: string; route: StaticPathname; section?: string } | { label: string; href: string };

const name = 'Luis Daniel';
const initials = 'LD';

const nav: { label: Text; route: StaticPathname; section?: string }[] = [
  { label: { es: 'Inicio', en: 'Home' }, route: '/' },
  { label: { es: 'Sobre mí', en: 'About' }, route: '/', section: 'about' },
  { label: { es: 'Proyectos', en: 'Projects' }, route: '/', section: 'projects' },
  { label: { es: 'Experiencia', en: 'Experience' }, route: '/', section: 'experience' },
  { label: { es: 'Blog', en: 'Blog' }, route: '/blog' },
];

const navCta = {
  label: { es: 'Contacto', en: 'Contact' },
  route: '/' as const,
  section: 'contact',
};

const footer = {
  about: {
    es: 'Desarrollador full stack. Este sitio está hecho con Next.js, Three.js y un robot modelado en Blender.',
    en: 'Full stack developer. This site is built with Next.js, Three.js and a robot modeled in Blender.',
  },
  groups: [
    {
      title: { es: 'Navegación', en: 'Navigation' },
      links: [
        { label: { es: 'Sobre mí', en: 'About' }, route: '/sobre-mi' },
        { label: { es: 'Proyectos', en: 'Projects' }, route: '/proyectos' },
        { label: { es: 'Experiencia', en: 'Experience' }, route: '/', section: 'experience' },
        { label: { es: 'Blog', en: 'Blog' }, route: '/blog' },
      ],
    },
    {
      // El RSS se añade en la fase 8, cuando exista la ruta.
      title: { es: 'Recursos', en: 'Resources' },
      links: [
        { label: { es: 'CV', en: 'CV' }, route: '/cv' },
        { label: { es: 'Colofón', en: 'Colophon' }, route: '/colofon' },
        { label: { es: 'Uses', en: 'Uses' }, route: '/uses' },
      ],
    },
    {
      // [pendiente] usuarios de GitHub y LinkedIn y email (profile.json).
      title: { es: 'Redes', en: 'Social' },
      links: [
        { label: { es: 'GitHub', en: 'GitHub' }, href: 'https://github.com/' },
        { label: { es: 'LinkedIn', en: 'LinkedIn' }, href: 'https://www.linkedin.com/' },
        { label: { es: 'Email', en: 'Email' }, route: '/', section: 'contact' },
      ],
    },
  ],
} satisfies {
  about: Text;
  groups: {
    title: Text;
    links: (
      { label: Text; route: StaticPathname; section?: string } | { label: Text; href: string }
    )[];
  }[];
};

export function getSiteFixture(locale: Locale) {
  return {
    name,
    initials,
    nav: nav.map((item) => ({ ...item, label: item.label[locale] })),
    navCta: { ...navCta, label: navCta.label[locale] },
    footer: {
      about: footer.about[locale],
      groups: footer.groups.map((group) => ({
        title: group.title[locale],
        links: group.links.map((link): SiteLink => ({ ...link, label: link.label[locale] })),
      })),
    },
  };
}

export type SiteData = ReturnType<typeof getSiteFixture>;
