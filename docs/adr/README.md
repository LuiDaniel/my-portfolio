# Registro de decisiones de arquitectura (ADR)

Cada decisión importante de arquitectura se documenta en un archivo corto e inmutable. Si una decisión cambia, se escribe un ADR nuevo que **reemplaza** al anterior, y el antiguo se marca como "Reemplazado por XXXX".

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-nextjs-app-router.md) | Next.js (App Router) como framework | Aceptado |
| [0002](0002-i18n-next-intl.md) | Español e inglés con next-intl y rutas traducidas | Aceptado |
| [0003](0003-contenido-mdx-velite.md) | Contenido en MDX/YAML dentro del repo, validado con Velite | Reemplazado por 0006 |
| [0004](0004-threejs-en-componente-cliente.md) | Three.js puro dentro de un componente cliente (sin React Three Fiber) | Aceptado |
| [0005](0005-vercel-y-servicios.md) | Vercel + Resend + Upstash para despliegue y backend | Aceptado |
| [0006](0006-datos-json-mdx.md) | Contenido editable en `content/`: JSON para datos y MDX para textos largos | Aceptado |
| [0007](0007-diseno-apple-bento.md) | Diseño Apple Design + bento, con `design/home.html` como referencia | Aceptado |

## Plantilla

```markdown
# NNNN · Título en forma de decisión

- **Estado:** Propuesto | Aceptado | Reemplazado por NNNN
- **Fecha:** AAAA-MM-DD

## Contexto
Qué problema hay y qué fuerzas influyen (requisitos, restricciones).

## Decisión
Qué se decide, en una o dos frases claras.

## Alternativas consideradas
- Opción A: por qué no.
- Opción B: por qué no.

## Consecuencias
Qué se gana, qué se pierde y qué hay que hacer a partir de ahora.
```
