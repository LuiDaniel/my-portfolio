# 0002 · Español e inglés con next-intl y rutas traducidas

- **Estado:** Aceptado
- **Fecha:** 2026-10-16

## Contexto

El portafolio se usará para postular tanto en el mercado hispanohablante como a puestos remotos internacionales. Todo el contenido (interfaz, proyectos, artículos, CV) debe existir en ambos idiomas y posicionarse bien en buscadores.

## Decisión

- **next-intl** con dos idiomas: `es` (por defecto) y `en`.
- Prefijo solo cuando hace falta (`as-needed`): español en `/…`, inglés en `/en/…`.
- Rutas traducidas (`/proyectos` ↔ `/en/projects`, `/sobre-mi` ↔ `/en/about`).
- Textos de interfaz en `src/i18n/messages/{es,en}.json`. El contenido va en `content/`: los JSON con campos `{ "es", "en" }` y el contenido largo en MDX separado por idioma (`es.mdx`, `en.mdx`). Ver [07 · Datos](../07-datos.md).
- El idioma del navegador se detecta solo en la primera visita. Después manda la elección del usuario.

## Alternativas consideradas

- **i18n a mano con `[locale]`**: posible, pero habría que reimplementar negociación de idioma, formateo de fechas y rutas traducidas.
- **Prefijo siempre (`/es/…`)**: más uniforme, pero las URLs en español quedan más largas sin ganar nada.
- **Solo un idioma**: limita las oportunidades remotas.

## Consecuencias

- Cada página declara `hreflang` y `canonical`.
- Un test de Vitest exige que `es.json` y `en.json` tengan las mismas claves.
- Mantener dos versiones del contenido duplica el trabajo de redacción; un artículo puede publicarse primero en un idioma.
