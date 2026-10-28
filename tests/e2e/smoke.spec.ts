import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la página carga con el fondo y las fuentes del diseño', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 6, 11)');

  // Las fuentes se descargan solo si se usan: se piden y se comprueba que next/font las sirve.
  const loaded = await page.evaluate(async () => {
    const families = ['Inter', 'JetBrains Mono'];
    const faces = await Promise.all(families.map((f) => document.fonts.load(`16px "${f}"`)));
    return families.filter((_, i) => (faces[i]?.length ?? 0) > 0);
  });
  expect(loaded).toEqual(['Inter', 'JetBrains Mono']);
});

test('sin violaciones de accesibilidad serias ni críticas', async ({ page }) => {
  await page.goto('/');
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)).toEqual([]);
});
