// Genera public/cv/cv-es.pdf y cv-en.pdf imprimiendo /cv y /en/cv con Playwright (A4, print.css).
// Uso: npm run cv (compila antes). Arranca `next start` en un puerto libre y lo cierra al terminar.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const PORT = 3100;
const base = `http://localhost:${PORT}`;
const next = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const server = spawn(process.execPath, [next, 'start', '-p', String(PORT)], { stdio: 'inherit' });

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${base}/cv`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('next start no respondió');
}

try {
  await waitForServer();
  mkdirSync('public/cv', { recursive: true });
  const browser = await chromium.launch();
  for (const [path, file] of [
    ['/cv', 'public/cv/cv-es.pdf'],
    ['/en/cv', 'public/cv/cv-en.pdf'],
  ]) {
    const page = await browser.newPage();
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const pages = await page.evaluate(() =>
      Math.ceil(document.querySelector('.cv-sheet').scrollHeight / 1050),
    );
    console.log(`✓ ${file} (≈ ${pages} página${pages > 1 ? 's' : ''} A4)`);
    await page.close();
  }
  await browser.close();
} finally {
  server.kill();
}
