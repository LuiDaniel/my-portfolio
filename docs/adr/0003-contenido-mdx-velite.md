# 0003 · Contenido en MDX/YAML dentro del repo, validado con Velite

- **Estado:** Reemplazado por [0006](0006-datos-json-mdx.md) (2026-10-28): los datos estructurados pasan de YAML/TS a JSON y todo el contenido se mueve a `content/`.
- **Fecha:** 2026-10-16

## Contexto

El sitio tiene contenido estructurado (proyectos, experiencia, formación, habilidades) y contenido largo (casos de estudio, artículos). Los mismos datos deben alimentar varias vistas: portada, páginas de detalle, `/cv`, PDF, JSON-LD e imágenes OG. Hay un solo autor, que trabaja en el editor y con Git.

## Decisión

- El contenido vive en el repositorio: **MDX** para texto largo y **YAML / TypeScript** para datos estructurados.
- **Velite** compila las colecciones en build, las valida con esquemas tipo Zod y genera tipos TypeScript.
- Una sola fuente de verdad: ninguna vista copia datos de otra.

## Alternativas consideradas

- **CMS headless** (Sanity, Contentful…): interfaz de edición cómoda, pero añade un servicio externo, cuentas y latencia a un sitio con un solo autor.
- **Content Collections**: equivalente a Velite. Es una alternativa válida si Velite diera problemas con la versión de Next.js.
- **`@next/mdx` + lectura manual de archivos**: sin validación de esquemas ni tipos generados.

## Consecuencias

- Un error en el contenido (campo que falta, fecha inválida) rompe el build, no la página en producción.
- Cambiar contenido requiere un commit, lo que deja historial y *previews* por PR.
- Los componentes usables dentro del MDX se mantienen en `src/components/mdx/`.
