# 0006 · Contenido editable en `content/`: JSON para datos y MDX para textos largos

- **Estado:** Aceptado (reemplaza a [0003](0003-contenido-mdx-velite.md))
- **Fecha:** 2026-10-28

## Contexto

Luis Daniel quiere cambiar la mayor parte del sitio (proyectos, experiencia, textos del Home, estado de disponibilidad, orden de las secciones) **sin editar código**, y agregar un proyecto nuevo con el menor esfuerzo posible. La ADR 0003 repartía los datos entre YAML (`src/content`) y TypeScript (`src/data`), lo que obligaba a tocar código para muchos cambios.

## Decisión

- Todo el contenido vive en una carpeta raíz **`content/`**:
  - **JSON** para datos estructurados (`site`, `profile`, `home`, `skills`, `experience`, `education` y el `meta.json` de cada proyecto), con textos bilingües `{ "es", "en" }`;
  - **MDX** para el texto largo (casos de estudio, artículos, páginas), un archivo por idioma.
- **Un proyecto = una carpeta** (`meta.json` + `es.mdx` + `en.mdx` + imágenes). Hay plantilla en `_plantilla/`.
- **Velite** valida todo con esquemas Zod y genera tipos. Los componentes acceden solo a través de `src/lib/content.ts`.
- `home.json` controla el **orden y la visibilidad** de las secciones del Home.
- Los textos de interfaz genéricos siguen en `src/i18n/messages/{es,en}.json`.

Detalle completo en [07 · Datos](../07-datos.md).

## Alternativas consideradas

- **YAML** (como en 0003): más cómodo de escribir, pero se equivoca fácil con la indentación. JSON lo valida cualquier editor y es lo que el usuario propuso.
- **CMS headless** (Sanity, Contentful…): editar desde un panel web, pero añade un servicio externo, cuentas y latencia para un único autor.
- **Todo en MDX con frontmatter:** duplicaría en cada idioma los datos comunes de un proyecto (stack, enlaces, fechas).

## Consecuencias

- Cambiar contenido = editar un JSON o MDX y hacer commit (con historial y *preview* por PR).
- Un error de datos rompe el build con un mensaje claro, no la web en producción.
- Hay que mantener los esquemas de `velite.config.ts` sincronizados con [07 · Datos](../07-datos.md).
