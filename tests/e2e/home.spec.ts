import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SECTIONS = ['about', 'projects', 'experience', 'skills', 'education', 'blog', 'contact'];

test.describe('Home', () => {
  test('muestra el hero y todas las secciones visibles en ES y EN', async ({ page }) => {
    for (const [url, role] of [
      ['/', 'Desarrollador Full Stack'],
      ['/en', 'Full Stack Developer'],
    ] as const) {
      await page.goto(url);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Luis Daniel');
      await expect(page.getByText(role, { exact: true })).toBeVisible();
      for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test('sin violaciones de accesibilidad serias ni críticas', async ({ page }) => {
    // Sin animaciones: la aparición con scroll deja el contenido aún no visto al 15 % de opacidad
    // y axe mediría ese contraste intermedio, no el final.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes[0]?.html}`)).toEqual([]);
  });

  test('el formulario valida en el cliente y envía con la Server Action', async ({ page }) => {
    await page.goto('/#contact');
    const form = page.locator('#contact form');
    await form.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(form.getByRole('status')).toHaveText('Escribe tu nombre.');
    await expect(form.getByLabel('Nombre')).toBeFocused();

    await form.getByLabel('Nombre').fill('Ada Lovelace');
    await form.getByLabel('Email').fill('ada@example.com');
    await form.getByLabel('Mensaje').fill('Hola, me interesa tu perfil para un puesto.');
    await form.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(form.getByRole('status')).toHaveText('¡Gracias! Te responderé pronto.');
    await expect(form.getByLabel('Nombre')).toHaveValue('');
  });

  test('el menú marca la sección visible al hacer scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'en móvil los enlaces están en el menú desplegable');
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    await expect(nav.getByRole('link', { name: 'Inicio', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    await expect(nav.getByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('el icono de email copia la dirección', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'permiso de portapapeles solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.getByRole('button', { name: 'Copiar email' }).first().click();
    await expect(page.getByText('Copiado ✓').first()).toBeVisible();
  });
});
