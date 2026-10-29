import type { ReactNode } from 'react';

/** Diagrama (SVG con los colores de los tokens) en un marco de cristal con pie opcional. */
export function Diagram({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-2xl p-5 glass [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full">
        {children}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-faint">{caption}</figcaption>
      )}
    </figure>
  );
}
