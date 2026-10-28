# Roadmap

Cada fase termina en algo revisable. Ninguna fase de implementación empieza sin el visto bueno de Luis Daniel.

## Fase 0 · Documentación ✅

- [x] Visión, contenido, arquitectura, diseño, robot 3D, calidad y ADRs (`docs/`).

## Fase 1 · Contenido

- [ ] Rellenar el inventario de [02 · Contenido](02-contenido.md): perfil, 3–4 proyectos, experiencia, formación, habilidades, uses.
- [ ] Redactar los casos de estudio destacados (ES) con la plantilla.
- [ ] Redactar 3–4 artículos para el lanzamiento (ES).
- [ ] Traducir y adaptar todo al inglés.
- [ ] Reunir capturas y videos de los proyectos; foto opcional.
- [ ] Elegir el dominio.

## Fase 2 · Diseño visual

- [ ] Maquetas de la portada (escritorio y móvil) con la posición final del Hero y del robot.
- [ ] Maquetas de caso de estudio, artículo, CV y 404.
- [ ] Ajustar los tokens de [04 · Diseño](04-diseno.md) según las maquetas.

## Fase 3 · Base de Next.js + robot

- [ ] Crear la app Next.js (TypeScript, Tailwind v4, ESLint, Prettier) en este repo, conservando `blender/`, `public/models/` y `scripts/copy-draco.mjs`.
- [ ] Configurar next-intl (ES/EN, rutas traducidas) y el layout base (header, footer, selector de idioma).
- [ ] Migrar `robot.js`, `eyes.js`, `intro.js` a `src/three/` y dividir `main.js` en `stage`, `introSequence` y `scrollFade`.
- [ ] `RobotStage`, `RobotLoader`, `SkipIntro` y `Hero` con las piezas `links` / `name` / `role`.
- [ ] Nuevo final del barrido: las piezas se quedan en la columna izquierda + plano `heroAside`.
- [ ] Intro solo en la primera visita de la sesión, `prefers-reduced-motion` y respaldo sin WebGL.
- [ ] Salida con scroll: Hero y robot se desvanecen (ya hecho en el prototipo).
- [ ] Retirar el prototipo de Vite (`index.html`, `vite.config.js`, `src/*.js`) cuando la paridad esté comprobada.

## Fase 4 · Secciones y páginas

- [ ] Velite con colecciones y esquemas (proyectos, blog, experiencia, páginas).
- [ ] Secciones de la portada: Sobre mí, Proyectos destacados, Experiencia, Habilidades, Formación, Últimos artículos, Contacto.
- [ ] Páginas: proyectos (lista con filtros + caso de estudio), blog (lista + artículo), sobre mí, uses, colofón, 404.

## Fase 5 · Backend, SEO y CV

- [ ] Formulario de contacto: Server Action, Zod, honeypot, límite de envíos y Resend.
- [ ] Integración con la API de GitHub con caché.
- [ ] Metadatos, imágenes OG, JSON-LD, sitemap, robots y RSS.
- [ ] Página `/cv` imprimible + `npm run cv` (PDF ES/EN).
- [ ] Cabeceras de seguridad.

## Fase 6 · Calidad y lanzamiento

- [ ] Vitest, Playwright + axe, Lighthouse CI.
- [ ] GitHub Actions y Dependabot.
- [ ] Proyecto en Vercel, variables de entorno, dominio y analítica.
- [ ] Lista de comprobación de [06 · Calidad](06-calidad.md#lista-de-comprobación-antes-de-publicar).
- [ ] Lanzamiento 🚀 y enlazar el portafolio en LinkedIn, GitHub y el CV.

## Después del lanzamiento (ideas)

- Tema claro.
- Más gestos del robot en Blender (por ejemplo, señalar la sección de contacto).
- Asistente que responde preguntas sobre tu experiencia usando los mismos datos del CV.
- Página `/now` (en qué estás trabajando ahora).
