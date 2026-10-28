import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Fuera de la app: prototipo Vite (se borra en la fase 9), Blender, maquetas y generados.
    'prototype/**',
    'blender/**',
    'design/**',
    'public/**',
    'renders/**',
  ]),
]);

export default eslintConfig;
