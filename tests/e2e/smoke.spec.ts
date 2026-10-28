import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la página carga con el fondo y las fuentes del diseño', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 6, 11)');

  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  });
  expect(loaded).toEqual(expect.arrayContaining(['Inter', 'JetBrains Mono']));
});

test('sin violaciones de accesibilidad serias ni críticas', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});
