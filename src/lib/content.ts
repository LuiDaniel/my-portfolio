import * as data from '#site/content';
import type { Locale } from '@/i18n/routing';

// Única puerta de entrada a content/ (docs/07-datos.md): los componentes reciben los datos ya
// resueltos al idioma (string, no { es, en }), ordenados y sin borradores en producción.

// ---------------------------------------------------------------- idioma

/** Cambia cada { es, en } por el valor del idioma, en cualquier profundidad. */
export type Localized<T> = T extends { es: infer E; en: unknown }
  ? Localized<E>
  : T extends (infer U)[]
    ? Localized<U>[]
    : T extends object
      ? { [K in keyof T]: Localized<T[K]> }
      : T;

function isText(value: object): value is { es: unknown; en: unknown } {
  const keys = Object.keys(value);
  return keys.length === 2 && 'es' in value && 'en' in value;
}

export function localize<T>(value: T, locale: Locale): Localized<T> {
  if (Array.isArray(value)) return value.map((v) => localize(v, locale)) as Localized<T>;
  if (value && typeof value === 'object') {
    if (isText(value)) return localize(value[locale], locale) as Localized<T>;
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, localize(v, locale)]),
    ) as Localized<T>;
  }
  return value as Localized<T>;
}

/** Los borradores se ven en desarrollo y se ocultan en producción. */
const showDrafts = process.env.NODE_ENV !== 'production';

export const PENDING = '[pendiente]';
export const isPending = (value: unknown) => typeof value === 'string' && value.includes(PENDING);

// ---------------------------------------------------------------- datos generales

export function getHome(locale: Locale) {
  const home = localize(data.home, locale);
  return { ...home, sections: home.sections.filter((s) => s.visible).map((s) => s.id) };
}

export type SectionId = ReturnType<typeof getHome>['sections'][number];

export function getSite(locale: Locale) {
  const site = localize(data.site, locale);
  const visible = new Set<string>(getHome(locale).sections);
  // El menú solo enlaza a secciones visibles del Home.
  const shown = (link: { section?: string }) => !link.section || visible.has(link.section);
  return {
    ...site,
    nav: site.nav.filter(shown),
    footer: {
      ...site.footer,
      groups: site.footer.groups.map((g) => ({
        ...g,
        links: g.links.filter((l) => !('route' in l) || shown(l)),
      })),
    },
  };
}

export type Site = ReturnType<typeof getSite>;
export type NavLink = Site['nav'][number];
export type FooterLink = Site['footer']['groups'][number]['links'][number];

export const getProfile = (locale: Locale) => localize(data.profile, locale);
export type Profile = ReturnType<typeof getProfile>;

export const getSkills = (locale: Locale) => localize(data.skills, locale);
export const getEducation = (locale: Locale) => localize(data.education, locale);

/** Experiencia por fecha de inicio, de la más reciente; las fechas [pendiente] quedan al final
 *  y, entre iguales, se respeta el orden del archivo. */
export function getExperience(locale: Locale) {
  const start = (job: (typeof data.experience)[number]) => (isPending(job.start) ? '' : job.start);
  return [...data.experience]
    .sort((a, b) => start(b).localeCompare(start(a)))
    .map((job) => localize(job, locale));
}

// ---------------------------------------------------------------- proyectos

export function getProjects(locale: Locale, { featured }: { featured?: boolean } = {}) {
  return data.projectMeta
    .filter((meta) => showDrafts || !meta.draft)
    .filter((meta) => featured === undefined || meta.featured === featured)
    .flatMap((meta) => {
      const doc = data.projectDocs.find((d) => d.slug === meta.slug && d.locale === locale);
      if (!doc) return [];
      const { path: _path, locale: _locale, slug: _slug, ...text } = doc;
      const { path: _metaPath, locale: _metaLocale, ...rest } = meta;
      return [{ ...rest, ...text }];
    })
    .sort((a, b) => a.order - b.order);
}

export type Project = ReturnType<typeof getProjects>[number];

export const getProject = (locale: Locale, slug: string) =>
  getProjects(locale).find((p) => p.slug === slug);

/** Proyecto de la tarjeta grande del hero; si está oculto (borrador), el primer destacado. */
export function getFeaturedProject(locale: Locale) {
  const slug = data.home.hero.bento.featuredProject;
  return getProject(locale, slug) ?? getProjects(locale, { featured: true })[0];
}

// ---------------------------------------------------------------- blog y páginas

export function getPosts(locale: Locale, { limit }: { limit?: number } = {}) {
  const posts = data.posts
    .filter((post) => post.locale === locale && (showDrafts || !post.draft))
    .sort((a, b) => b.date.localeCompare(a.date));
  return limit === undefined ? posts : posts.slice(0, limit);
}

export type Post = ReturnType<typeof getPosts>[number];

export const getPost = (locale: Locale, slug: string) =>
  getPosts(locale).find((p) => p.slug === slug);

/** Idiomas en los que existe un artículo (un artículo puede estar en uno solo). */
export const getPostLocales = (slug: string) =>
  data.posts.filter((p) => p.slug === slug && (showDrafts || !p.draft)).map((p) => p.locale);

export const getPage = (locale: Locale, slug: 'sobre-mi' | 'uses' | 'colofon') =>
  data.pages.find((p) => p.slug === slug && p.locale === locale);
