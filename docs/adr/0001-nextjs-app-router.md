# 0001 · Next.js (App Router) como framework

- **Estado:** Aceptado
- **Fecha:** 2026-10-16

## Contexto

El prototipo de la intro está hecho con Vite + Three.js sin framework. El portafolio completo necesita muchas páginas (proyectos, blog, CV, sobre mí…), dos idiomas, contenido en MDX, SEO, imágenes OG, un formulario con backend y buen rendimiento. Además, el sitio sirve como muestra técnica para empleos full stack, donde React y Next.js son de las tecnologías más pedidas.

## Decisión

Usar **Next.js con App Router**, React y TypeScript estricto. Las páginas se generan estáticas siempre que sea posible, y las funciones de servidor (formulario, GitHub) usan Server Actions y Route Handlers.

## Alternativas consideradas

- **Astro**: ideal para sitios de contenido (menos JS por defecto, islas). Se descartó porque el portafolio también quiere demostrar dominio de React/Next.js, y Next cubre el backend en el mismo proyecto.
- **Mantener Vite sin framework**: habría que construir a mano rutas, i18n, MDX, SEO y backend. Mucho trabajo de infraestructura que no aporta al objetivo.
- **Remix / React Router**: válido, pero con menos ecosistema para generación estática de contenido e imágenes OG.

## Consecuencias

- El código del robot pasa a un componente cliente cargado sin SSR ([ADR 0004](0004-threejs-en-componente-cliente.md)).
- Hay que vigilar el JS que se envía al cliente: Server Components por defecto y presupuestos en CI ([06 · Calidad](../06-calidad.md)).
- El despliegue natural es Vercel ([ADR 0005](0005-vercel-y-servicios.md)).
- El prototipo de Vite se retira cuando la versión de Next.js alcance paridad.
