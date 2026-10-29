import { expect, test } from '@playwright/test';

// Cada ruta en español y su equivalente en inglés, con el h1 esperado.
const ROUTES = [
  { es: '/proyectos', en: '/en/projects', h1: ['Proyectos', 'Projects'] },
  { es: '/blog', en: '/en/blog', h1: ['Blog', 'Blog'] },
  { es: '/sobre-mi', en: '/en/about', h1: ['Sobre mí', 'About'] },
  { es: '/cv', en: '/en/cv', h1: ['CV', 'CV'] },
  { es: '/uses', en: '/en/uses', h1: ['Uses', 'Uses'] },
  { es: '/colofon', en: '/en/colophon', h1: ['Colofón', 'Colophon'] },
  {
    es: '/proyectos/este-portafolio',
    en: '/en/projects/este-portafolio',
    h1: ['Este portafolio y su robot 3D', 'This portfolio and its 3D robot'],
  },
  {
    es: '/blog/robot-3d-blender',
    en: '/en/blog/robot-3d-blender',
    h1: [
      'Cómo hice un robot 3D en Blender y lo llevé a la web',
      'How I built a 3D robot in Blender and brought it to the web',
    ],
  },
] as const;

test.describe('rutas', () => {
  for (const route of ROUTES) {
    test(`${route.es} y ${route.en}`, async ({ page }) => {
      for (const [i, lang] of (['es', 'en'] as const).entries()) {
        const response = await page.goto(route[lang]);
        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.h1[i]!);
      }
    });
  }

  test('las rutas desconocidas dan un 404 traducido', async ({ page }) => {
    const es = await page.goto('/no-existe');
    expect(es?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');

    const en = await page.goto('/en/no-existe');
    expect(en?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  });
});

test.describe('idioma', () => {
  test('cambiar de idioma conserva la página y la elección se recuerda', async ({
    page,
    isMobile,
  }) => {
    // En móvil el selector está dentro del menú desplegable.
    const switchTo = async (name: string, menu: string) => {
      if (isMobile) await page.getByRole('button', { name: menu }).click();
      await page.getByRole('link', { name }).locator('visible=true').first().click();
    };

    await page.goto('/proyectos/este-portafolio');
    await switchTo('EN · English', 'Abrir menú');
    await expect(page).toHaveURL(/\/en\/projects\/este-portafolio$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await switchTo('ES · Español', 'Open menu');
    await expect(page).toHaveURL(/\/proyectos\/este-portafolio$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    // Con la cookie en inglés, entrar a / lleva a /en aunque el navegador esté en español.
    await page.goto('/en/about');
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('la primera visita usa el idioma del navegador', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await context.close();
  });
});

test.describe('menú', () => {
  test('marca la página actual', async ({ page, isMobile }) => {
    test.skip(isMobile, 'en móvil los enlaces están en el menú desplegable');
    await page.goto('/blog');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page');
  });

  test('en móvil se abre, navega y se cierra con Esc', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'el botón de menú solo aparece por debajo de 980 px');
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Abrir menú' });
    await button.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await page.locator('#mobile-menu').getByRole('link', { name: 'Blog' }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator('#mobile-menu')).toBeHidden();
  });
});
