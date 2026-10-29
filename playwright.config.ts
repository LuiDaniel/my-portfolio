import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  // next dev compila cada ruta en la primera visita: margen para el arranque en frío.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Navegador en español: en la primera visita el proxy elige el idioma por Accept-Language.
    locale: 'es-ES',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /intro.spec/ },
    { name: 'webkit-movil', use: { ...devices['iPhone 15'] }, testIgnore: /intro.spec/ },
    {
      // La intro dibuja WebGL por software (sin GPU) y satura la CPU: va sola, al final.
      name: 'intro',
      testMatch: /intro.spec/,
      dependencies: ['chromium', 'webkit-movil'],
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
