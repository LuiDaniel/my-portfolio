import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Calidad en todas las páginas y en los dos idiomas (docs/06-calidad.md): axe sin violaciones
// serias ni críticas, un solo h1, canonical + hreflang y JSON-LD válido.

const PAGES = [
  '/',
  '/proyectos',
  '/proyectos/este-portafolio',
  '/blog',
  '/blog/robot-3d-blender',
  '/sobre-mi',
  '/cv',
  '/uses',
  '/colofon',
  '/en',
  '/en/projects',
  '/en/projects/este-portafolio',
  '/en/blog',
  '/en/blog/robot-3d-blender',
  '/en/about',
  '/en/cv',
  '/en/uses',
  '/en/colophon',
];

test.describe('calidad', () => {
  test.skip(({ isMobile }) => isMobile, 'una vez por página basta (Chromium)');

  for (const path of PAGES) {
    test(`axe, h1 y SEO en ${path}`, async ({ page }) => {
      // Sin animaciones: la aparición con scroll deja el contenido aún no visto al 15 % de opacidad.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      for (const lang of ['es', 'en', 'x-default']) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
      }
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      for (const json of await page
        .locator('script[type="application/ld+json"]')
        .allTextContents()) {
        expect(() => JSON.parse(json)).not.toThrow();
      }

      const { violations } = await new AxeBuilder({ page }).analyze();
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
    });
  }

  test('el primer Tab lleva a «Saltar al contenido»', async ({ page }) => {
    await page.goto('/proyectos');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('sitemap, robots y RSS', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    expect(xml).toContain('/proyectos/este-portafolio');
    expect(xml).toContain('hreflang="en"');

    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
    for (const rss of ['/rss.xml', '/en/rss.xml']) {
      const res = await request.get(rss);
      expect(res.headers()['content-type']).toContain('application/rss+xml');
      expect(await res.text()).toContain('<rss version="2.0">');
    }
  });
});
