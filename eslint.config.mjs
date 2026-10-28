import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // Quitar campos con { campo, ...resto } es intencionado.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true, varsIgnorePattern: '^_' },
      ],
    },
  },
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
    '.velite/**',
  ]),
]);

export default eslintConfig;
