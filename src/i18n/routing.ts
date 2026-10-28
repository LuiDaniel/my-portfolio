import { defineRouting } from 'next-intl/routing';

// Español por defecto y sin prefijo; inglés en /en. Las carpetas de app/ usan el nombre en español
// (docs/03-arquitectura.md#rutas-idiomas-y-anclas).
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/proyectos': { es: '/proyectos', en: '/projects' },
    '/proyectos/[slug]': { es: '/proyectos/[slug]', en: '/projects/[slug]' },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/sobre-mi': { es: '/sobre-mi', en: '/about' },
    '/cv': '/cv',
    '/uses': '/uses',
    '/colofon': { es: '/colofon', en: '/colophon' },
  },
  // El idioma del navegador solo decide en la primera visita; después manda la elección guardada.
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];
export type Pathname = keyof typeof routing.pathnames;
