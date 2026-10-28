# 0008 · Sin Cache Components por ahora: SSG + `revalidate`

- **Estado:** Aceptado
- **Fecha:** 2026-10-28

## Contexto

Next.js 16.4 trae dos opciones nuevas que su plantilla (`create-next-app`) activa por defecto: `cacheComponents` y `partialPrefetching`. Con ellas, la configuración por ruta (`dynamic`, `revalidate`, `fetchCache`) deja de existir: se cachea con la directiva `'use cache'` y `cacheLife`, y todo dato que cambie en cada visita debe ir dentro de `<Suspense>`.

La arquitectura ([03](../03-arquitectura.md#renderizado)) es de páginas estáticas: todo el contenido sale de `content/` en el build, y el único dato externo es el calendario de GitHub, que se renueva cada 24 h. next-intl solo se integra bien con Cache Components desde Next 16.3 (`next/root-params`, agosto de 2026), y todavía hay problemas conocidos (su `Link`; `setRequestLocale` obliga a renderizar en cada visita).

## Decisión

No activar `cacheComponents` ni `partialPrefetching`. Se mantiene el modelo clásico: SSG con `generateStaticParams` por idioma y slug, y `revalidate: 86400` en la llamada a GitHub.

## Alternativas consideradas

- **Activar Cache Components desde el principio:** es hacia donde va Next.js y ahora no hay código que adaptar. Pero su ventaja es mezclar partes estáticas y dinámicas en la misma página, algo que este sitio casi no necesita, y añadiría riesgo en la fase 2 (next-intl), con una integración reciente y documentada sobre todo por terceros.

## Consecuencias

- La configuración sigue la documentación de next-intl y Velite sin adaptaciones.
- Si más adelante se quiere activar, el cambio está acotado: `lib/github.ts` pasa de `revalidate` a `'use cache'` + `cacheLife('days')`, y se sigue la guía oficial `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`. Se hará con un ADR nuevo que reemplace a este.
- Buen momento para revisarlo: cuando next-intl lo documente como configuración recomendada.
