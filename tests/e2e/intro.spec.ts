import { expect, test } from '@playwright/test';

// La intro solo se reproduce con ?intro=play|fast en navegadores automatizados (ver intro-script).
// WebGL por software es lento: se prueba en Chromium y con la versión rápida.
test.describe('intro del robot', () => {
  test.describe.configure({ mode: 'serial' });

  test('termina sola, desmonta la capa y deja el Home visible', async ({ page }) => {
    test.setTimeout(150_000);
    await page.goto('/?intro=fast');
    const overlay = page.locator('#intro-overlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-intro', 'play');
    await expect(page.getByRole('heading', { level: 1 })).toBeHidden();

    await expect(overlay).toHaveCount(0, { timeout: 120_000 });
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem('intro-seen'))).toBe('1');
    // la escena se liberó (en desarrollo, __intro desaparece al hacer dispose)
    expect(
      await page.evaluate(() => 'robot' in ((window as { __intro?: object }).__intro ?? {})),
    ).toBe(false);
  });

  test('«Saltar intro» muestra el Home al momento', async ({ page }) => {
    await page.goto('/?intro=play');
    await page.getByRole('button', { name: 'Saltar intro' }).click();
    await expect(page.locator('#intro-overlay')).toHaveCount(0, { timeout: 5_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Esc también la salta', async ({ page }) => {
    await page.goto('/?intro=play');
    await expect(page.locator('#intro-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#intro-overlay')).toHaveCount(0, { timeout: 5_000 });
  });

  test('con movimiento reducido no hay intro', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?intro=play');
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('fuera de la portada no se activa', async ({ page }) => {
    await page.goto('/blog?intro=play');
    await expect(page.locator('html')).not.toHaveAttribute('data-intro', /.*/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
