import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');

// Valores permitidos en el campo `color` de los JSON (docs/07-datos.md): cada uno necesita su token.
const CONTENT_COLORS = ['blue', 'indigo', 'violet', 'green', 'mint', 'amber', 'coral', 'cyan'];

describe('tokens.css', () => {
  it.each(CONTENT_COLORS)('define el color de contenido «%s»', (name) => {
    expect(tokens).toMatch(new RegExp(`--color-${name}:\\s*#[0-9a-f]{6};`));
  });

  it('define los cinco niveles de GitHub', () => {
    for (const level of [0, 1, 2, 3, 4]) expect(tokens).toContain(`--color-gh-${level}:`);
  });

  it('usa --faint al 55 % para cumplir contraste AA', () => {
    expect(tokens).toMatch(/--color-faint:\s*rgb\(226 230 245 \/ 0\.55\)/);
  });
});
