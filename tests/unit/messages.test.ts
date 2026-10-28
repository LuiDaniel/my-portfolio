import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';

// Rutas de todas las hojas: { a: { b: 'x' } } → ['a.b'].
function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('mensajes de interfaz (ADR 0002)', () => {
  it('es.json y en.json tienen las mismas claves', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('ningún texto está vacío', () => {
    for (const messages of [es, en]) {
      const empty = keys(messages).filter((path) => {
        const value = path
          .split('.')
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], messages);
        return typeof value !== 'string' || value.trim() === '';
      });
      expect(empty).toEqual([]);
    }
  });
});
