import * as runtime from 'react/jsx-runtime';
import type { ComponentType } from 'react';
import { Callout } from './Callout';
import { Diagram } from './Diagram';
import { Figure } from './Figure';
import { Video } from './Video';

type MDXComponent = ComponentType<{ components?: Record<string, ComponentType<never>> }>;

// Velite compila el MDX a una función (texto); se evalúa una vez por contenido y se guarda.
const cache = new Map<string, MDXComponent>();

function getMDXComponent(code: string): MDXComponent {
  let Component = cache.get(code);
  if (!Component) {
    const fn = new Function(code);
    Component = fn({ ...runtime }).default as MDXComponent;
    cache.set(code, Component);
  }
  return Component;
}

/** Componentes disponibles en el MDX de content/ (docs/07-datos.md). */
const components = { Callout, Diagram, Figure, Video };

/** Cuerpo de un caso de estudio, artículo o página. Solo en Server Components (se compila en el build). */
export function MDXContent({ code }: { code: string }) {
  const Component = getMDXComponent(code);
  return (
    <div className="prose">
      {/* El componente sale de la caché por contenido: no se recrea en cada render. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Component components={components as Record<string, ComponentType<never>>} />
    </div>
  );
}
