// Texto enriquecido de content/: solo **negrita** (sin HTML, así no hay inyección de código).

export type RichSegment = { text: string; strong: boolean };

export function parseRichText(input: string): RichSegment[] {
  return input
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4
        ? { text: part.slice(2, -2), strong: true }
        : { text: part, strong: false },
    );
}

/** El mismo texto sin marcas (para metadatos y atributos). */
export const plainText = (input: string) => input.replaceAll('**', '');
