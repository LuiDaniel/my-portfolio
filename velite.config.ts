import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import { defineCollection, defineConfig, s } from 'velite';

// Esquemas del contenido editable (docs/07-datos.md). Un error indica archivo, campo y motivo.

// ---------------------------------------------------------------- tipos comunes

const text = s.object({ es: s.string().min(1), en: s.string().min(1) });
const textList = s.object({ es: s.array(s.string().min(1)), en: s.array(s.string().min(1)) });
const color = s.enum(['blue', 'indigo', 'violet', 'green', 'mint', 'amber', 'coral', 'cyan']);
const icon = s
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Nombre de icono de Lucide en kebab-case');
const route = s.enum(['/', '/proyectos', '/blog', '/sobre-mi', '/cv', '/uses', '/colofon']);
const section = s.enum([
  'about',
  'projects',
  'experience',
  'skills',
  'education',
  'blog',
  'contact',
]);
const yearMonth = s.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Fecha AAAA-MM o AAAA-MM-DD');
const pending = s.literal('[pendiente]');
const url = s.string().url().or(pending);
const hex = s.string().regex(/^#[0-9a-f]{6}$/i, 'Color hexadecimal #rrggbb');

const internalLink = s.object({ label: text, route, section: section.optional() });
const externalLink = s.object({ label: text, href: url });
const action = s.object({ label: text, action: s.enum(['cv', 'email']) });

// Slug e idioma salen de la ruta del archivo: projects/<slug>/<idioma>.mdx
function fromPath<T extends { path: string }>(data: T) {
  const [, slug = '', locale = ''] = data.path.split('/');
  return { ...data, slug, locale: locale as 'es' | 'en' };
}

const NOT_TEMPLATES = '!**/_*/**';

// ---------------------------------------------------------------- JSON (un archivo)

const site = defineCollection({
  name: 'Site',
  pattern: 'site.json',
  single: true,
  schema: s.object({
    url: url,
    seo: s.object({ title: text, description: text }),
    nav: s.array(internalLink),
    navCta: internalLink,
    intro: s.object({ enabled: s.boolean(), kicker: text, title: text, url: s.string() }),
    footer: s.object({
      about: text,
      groups: s.array(s.object({ title: text, links: s.array(internalLink.or(externalLink)) })),
    }),
  }),
});

const profile = defineCollection({
  name: 'Profile',
  pattern: 'profile.json',
  single: true,
  schema: s.object({
    name: s.string(),
    fullName: s.string(),
    initials: s.string().max(3),
    role: text,
    tagline: text,
    status: s.object({ available: s.boolean(), label: text }),
    location: s.object({
      city: s.string(),
      country: s.string(),
      timezone: s.string().or(pending),
    }),
    workModes: text,
    responseTime: text,
    email: s.string().email().or(pending),
    github: s.object({ username: s.string() }),
    socials: s.array(
      s.object({
        id: s.enum(['github', 'linkedin', 'x', 'youtube', 'devto', 'email']),
        label: s.string(),
        url: url,
        handle: s.string(),
      }),
    ),
    languages: s.array(s.object({ name: text, level: text })).default([]),
    cv: s.object({ es: s.string(), en: s.string() }),
  }),
});

const home = defineCollection({
  name: 'Home',
  pattern: 'home.json',
  single: true,
  schema: s.object({
    sections: s.array(s.object({ id: section, visible: s.boolean() })),
    hero: s.object({
      primaryCta: internalLink,
      secondaryCta: action,
      bento: s.object({
        featuredProject: s.string(),
        showGithub: s.boolean(),
        showClock: s.boolean(),
      }),
    }),
    about: s.object({
      eyebrow: text,
      title: text,
      titleSoft: text,
      more: internalLink,
      paragraphs: s.array(text),
      values: s.array(s.object({ icon, color, title: text, text })),
    }),
    projects: s.object({ eyebrow: text, title: text, more: internalLink, limit: s.number() }),
    experience: s.object({ eyebrow: text, title: text, more: internalLink }),
    skills: s.object({ eyebrow: text, title: text }),
    education: s.object({ eyebrow: text, title: text }),
    blog: s.object({ eyebrow: text, title: text, more: internalLink, limit: s.number() }),
    contact: s.object({ eyebrow: text, title: text, text }),
  }),
});

const skills = defineCollection({
  name: 'Skills',
  pattern: 'skills.json',
  single: true,
  schema: s.object({
    featured: s.array(s.object({ name: s.string(), color: hex })),
    areas: s.array(
      s.object({
        id: s.string(),
        icon,
        color,
        title: text,
        items: s.array(
          s.object({ name: s.string(), level: s.enum(['daily', 'experienced', 'learning']) }),
        ),
      }),
    ),
  }),
});

const experience = defineCollection({
  name: 'Job',
  pattern: 'experience.json',
  schema: s.object({
    id: s.string(),
    role: text,
    org: s.string(),
    url: url.optional(),
    type: s.enum(['job', 'freelance', 'internship', 'volunteer', 'academic']),
    start: yearMonth.or(pending),
    end: yearMonth.or(pending).nullable(),
    color,
    highlights: textList,
    stack: s.array(s.string()),
  }),
});

const education = defineCollection({
  name: 'Education',
  pattern: 'education.json',
  single: true,
  schema: s.object({
    degree: text,
    university: s.string(),
    city: s.string(),
    status: text,
    progress: s
      .object({ current: s.number().or(pending), total: s.number().or(pending), unit: text })
      .optional(),
    courses: s.array(text),
    certifications: s.array(
      s.object({
        title: s.string(),
        issuer: s.string(),
        year: s.number().or(pending),
        url: url.optional(),
        color,
      }),
    ),
    achievements: s.array(
      s.object({ title: text, detail: text, year: s.number().or(pending), icon, color }),
    ),
  }),
});

// ---------------------------------------------------------------- proyectos, blog y páginas

const projectMeta = defineCollection({
  name: 'ProjectMeta',
  pattern: ['projects/*/meta.json', NOT_TEMPLATES],
  schema: s
    .object({
      path: s.path(),
      period: s.object({ start: yearMonth.or(pending), end: yearMonth.or(pending).nullable() }),
      stack: s.array(s.string()),
      color,
      cover: s.image().optional(),
      links: s.object({ demo: url.optional(), repo: url.optional() }),
      featured: s.boolean(),
      order: s.number(),
      draft: s.boolean().default(false),
    })
    .transform(fromPath),
});

const projectDocs = defineCollection({
  name: 'ProjectDoc',
  pattern: ['projects/*/{es,en}.mdx', NOT_TEMPLATES],
  schema: s
    .object({
      path: s.path(),
      title: s.string(),
      summary: s.string(),
      kind: s.string(),
      role: s.string().optional(),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform(fromPath),
});

const posts = defineCollection({
  name: 'Post',
  pattern: ['blog/*/{es,en}.mdx', NOT_TEMPLATES],
  schema: s
    .object({
      path: s.path(),
      title: s.string(),
      description: s.string(),
      date: s.isodate(),
      tags: s.array(s.string()),
      color,
      icon: icon.optional(),
      label: s.string().max(6).optional(),
      cover: s.image().optional(),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform(fromPath),
});

const pages = defineCollection({
  name: 'Page',
  pattern: ['pages/*/{es,en}.mdx', NOT_TEMPLATES],
  schema: s
    .object({
      path: s.path(),
      title: s.string(),
      description: s.string(),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform(fromPath),
});

export default defineConfig({
  root: 'content',
  // Ids en los títulos (los usa la tabla de contenidos) y código resaltado en el build con Shiki.
  mdx: {
    rehypePlugins: [rehypeSlug, [rehypeShiki, { theme: 'github-dark-dimmed' }]],
  },
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: false, // --clean solo en `npm run content`: en modo watch borraría .velite/ en caliente
  },
  collections: {
    site,
    profile,
    home,
    skills,
    experience,
    education,
    projectMeta,
    projectDocs,
    posts,
    pages,
  },
});
