import { icons } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import * as data from '#site/content';
import { getExperience, getHome, getProjects, getSite, isPending, localize } from '@/lib/content';
import { parseRichText, plainText } from '@/lib/rich-text';

// Pruebas de contenido (docs/06-calidad.md#pruebas). Los esquemas de Velite ya exigen que cada
// Texto tenga es y en, que los colores existan y que las fechas tengan formato.

const pascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

/** Todos los valores `icon` que aparecen en un objeto, a cualquier profundidad. */
function collectIcons(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectIcons);
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) =>
      k === 'icon' && typeof v === 'string' ? [v] : collectIcons(v),
    );
  }
  return [];
}

describe('contenido', () => {
  it('el proyecto destacado del hero existe', () => {
    const slugs = data.projectMeta.map((p) => p.slug);
    expect(slugs).toContain(data.home.hero.bento.featuredProject);
  });

  it('cada proyecto tiene es.mdx y en.mdx', () => {
    for (const meta of data.projectMeta) {
      const locales = data.projectDocs.filter((d) => d.slug === meta.slug).map((d) => d.locale);
      expect(locales.sort(), meta.slug).toEqual(['en', 'es']);
    }
  });

  it('no hay slugs repetidos', () => {
    const unique = (list: string[]) => new Set(list).size === list.length;
    expect(unique(data.projectMeta.map((p) => p.slug))).toBe(true);
    expect(unique(data.posts.map((p) => `${p.slug}/${p.locale}`))).toBe(true);
    expect(unique(data.experience.map((j) => j.id))).toBe(true);
  });

  it('todos los iconos existen en Lucide', () => {
    const all = collectIcons([data.home, data.skills, data.education, data.posts]);
    const missing = all.filter((name) => !(pascal(name) in icons));
    expect(missing).toEqual([]);
  });

  it('las secciones del Home no se repiten', () => {
    const ids = data.home.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// Para publicar: CONTENT_PUBLISH=1 npm run test. Falla si queda algún [pendiente] en lo que se
// vería en producción (los borradores no cuentan).
describe.runIf(process.env.CONTENT_PUBLISH === '1')('listo para publicar', () => {
  it('no queda ningún [pendiente] visible', () => {
    const visible = [
      data.site,
      data.profile,
      data.home,
      data.skills,
      data.experience,
      data.education,
      data.pages.map((p) => p.body),
      data.projectMeta.filter((p) => !p.draft),
      data.projectDocs.filter((d) => !data.projectMeta.find((m) => m.slug === d.slug)?.draft),
      data.posts.filter((p) => !p.draft),
    ];
    const found = JSON.stringify(visible).match(/.{0,40}\[pendiente\].{0,20}/g) ?? [];
    expect(found).toEqual([]);
  });
});

describe('content.ts', () => {
  it('localize resuelve { es, en } a cualquier profundidad', () => {
    const value = { a: { es: 'hola', en: 'hi' }, list: [{ t: { es: ['x'], en: ['y'] } }], n: 1 };
    expect(localize(value, 'en')).toEqual({ a: 'hi', list: [{ t: ['y'] }], n: 1 });
  });

  it('el Home solo incluye las secciones visibles, en el orden de home.json', () => {
    const visible = data.home.sections.filter((s) => s.visible).map((s) => s.id);
    expect(getHome('es').sections).toEqual(visible);
  });

  it('el menú solo enlaza a secciones visibles', () => {
    const sections = new Set(data.home.sections.filter((s) => s.visible).map((s) => s.id));
    for (const link of getSite('es').nav) {
      if (link.section) expect(sections.has(link.section)).toBe(true);
    }
  });

  it('los proyectos se ordenan por order y unen meta + texto del idioma', () => {
    const projects = getProjects('en');
    expect(projects.map((p) => p.order)).toEqual([...projects.map((p) => p.order)].sort());
    expect(projects[0]?.title).toBeTypeOf('string');
    expect(projects[0]?.stack.length).toBeGreaterThan(0);
  });

  it('la experiencia se ordena por fecha de inicio (la más reciente arriba)', () => {
    const starts = getExperience('es')
      .map((job) => job.start)
      .filter((start) => !isPending(start));
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('isPending detecta los datos que faltan', () => {
    expect(isPending('[pendiente]')).toBe(true);
    expect(isPending('Lima')).toBe(false);
  });
});

describe('rich-text', () => {
  it('convierte **negrita** en segmentos', () => {
    expect(parseRichText('Hago **APIs** y **webs**.')).toEqual([
      { text: 'Hago ', strong: false },
      { text: 'APIs', strong: true },
      { text: ' y ', strong: false },
      { text: 'webs', strong: true },
      { text: '.', strong: false },
    ]);
  });

  it('no interpreta HTML', () => {
    expect(parseRichText('<b>x</b>')).toEqual([{ text: '<b>x</b>', strong: false }]);
    expect(plainText('a **b**')).toBe('a b');
  });
});
