import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)), // prototype/, se lance desde donde se lance
  publicDir: '../public', // comparte public/models y public/draco con la app Next.js
  base: './', // rutas relativas: funciona también en GitHub Pages / subcarpetas
});
