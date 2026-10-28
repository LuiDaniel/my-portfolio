# Roadmap · Plan de implementación

La implementación va **por fases**. Cada fase termina en algo que se puede ver y probar, con `npm run check` en verde y un commit. **Ninguna fase empieza sin el visto bueno de Luis Daniel** («empieza»).

## Cómo trabajar cada fase

1. **Leer antes de tocar:** `CLAUDE.md`, el documento de la fase, [`design/home.html`](../design/home.html) si hay interfaz y [07 · Datos](07-datos.md) si hay contenido.
2. **Proponer** el plan de la fase (archivos y pasos) y **esperar el «empieza»**.
3. **Trabajar en `main`** (sin ramas): por eso cada paso tiene que dejar el proyecto funcionando.
4. **Pasos pequeños:** cada paso compila y se verifica antes del siguiente. Un commit por paso.
5. **Verificar** con los «Hecho cuando» de la fase. Si hay interfaz: navegador a 1440, 1024 y 390 px y comparación con la maqueta.
6. **Actualizar la documentación** si algo cambió (y un ADR si es una decisión de arquitectura).
7. **Cerrar** con un resumen: qué se hizo, cómo se verificó y qué queda.

Reglas que evitan errores:
- No inventar datos: lo que falta va con `[pendiente]` o como borrador.
- No cambiar de librería ni de enfoque sin un ADR acordado.
- No borrar `prototype/`, `blender/` ni `public/models/` (salvo en la fase 9).
- No modificar las animaciones del robot en la web: se cambian en Blender ([05](05-robot-3d.md)).
- Antes de usar una API de Next.js, next-intl o Velite, comprobar la documentación de la **versión instalada** (por ejemplo, `proxy.ts` frente a `middleware.ts`).

---

## Fase 0 · Documentación y diseño del Home ✅

- [x] Documentación (`docs/`), ADRs y guía de datos.
- [x] Intro del robot en el prototipo: paleta azul/violeta, cintura para arriba, tarjeta que queda a la izquierda.
- [x] Maqueta del Home aprobada: `design/home.html`.

## Fase 1 · Base del proyecto ✅

**Objetivo:** app Next.js vacía con las herramientas de calidad, sin perder el prototipo.

- [x] Mover el prototipo a `prototype/` (`index.html`, `vite.config.js`, `src/*.js` y `src/style.css` → `prototype/`), con `prototype/` como raíz y `publicDir: '../public'` en su `vite.config.js`. Script `npm run prototype`. Comprobar que la intro sigue funcionando.
- [x] Crear la app Next.js (App Router, TypeScript estricto, `src/`, alias `@/*`, ESLint) en la raíz, conservando `blender/`, `public/models/`, `scripts/copy-draco.mjs` (en `postinstall`), `design/`, `docs/` y `referencias/`.
- [x] Tailwind CSS v4 + `src/styles/tokens.css` con **todos** los tokens de [04 · Diseño](04-diseno.md#color) en `@theme` + `effects.css` (cristal, borde iluminado, keyframes `rise`, `pop`, `drop`, `drift`, `pulse`, `sheen`, `reveal` y `wheel`).
- [x] Fuentes con `next/font`: Inter (variable, `opsz`) y JetBrains Mono.
- [x] Prettier, Vitest, Playwright + axe (configurados, con una prueba mínima cada uno) y el script `check`.
- [x] `.env.example`, `.gitignore` (`.next/`, `.velite/`, `public/draco/`, `.env*` salvo `.env.example`) y `.claude/launch.json` con `next` (3000), `prototype` (5173) y `design` (5175).
- [x] GitHub Actions `ci.yml`: install → lint → formato → typecheck → test → build.

Versiones y notas de Next.js 16.4 en [03 · Arquitectura](03-arquitectura.md#versiones-fijadas-fase-1-2026-10-28).

**Hecho cuando:** `npm run check` pasa · `npm run dev` muestra una página con fondo `--bg` y las dos fuentes · `npm run prototype` reproduce la intro como antes.

## Fase 2 · Idiomas y estructura ✅

**Objetivo:** el esqueleto navegable en ES/EN con el menú y el pie del diseño.

- [x] next-intl: `routing.ts` (`es` por defecto, `as-needed`, `pathnames` traducidos), `request.ts`, `navigation.ts`, `proxy.ts` y `messages/{es,en}.json` con los textos de interfaz.
- [x] `app/[locale]/layout.tsx` con `<html lang>`, fuentes, `Ambient` (manchas, grano, luz del cursor), `NavBar` y `Footer` (aún con datos fijos de prueba).
- [x] `NavBar` como en la maqueta: cristal, logo, resaltado deslizante, ES/EN funcional, botón «Contacto», botón de menú y `MobileMenu` en < 980 px.
- [x] Páginas vacías de todas las rutas (con su título) y `not-found`.
- [x] Prueba de paridad de claves `es`/`en` y E2E: cambiar de idioma conserva la página.

Notas: el idioma se lee con `next/root-params` (sin `setRequestLocale`); las rutas sin idioma (p. ej. `/archivo.txt`) van a `app/global-not-found.tsx`; menú y pie usan datos provisionales de `src/lib/site-fixture.ts` hasta la fase 3.

**Hecho cuando:** se navega por todas las rutas en los dos idiomas · el menú se ve y se comporta como en la maqueta (comparado a 1440, 1024 y 390 px) · `npm run check` pasa.

## Fase 3 · Capa de datos ✅

**Objetivo:** todo el contenido sale de `content/`, validado.

- [x] `velite.config.ts` con las colecciones y esquemas de [07 · Datos](07-datos.md) (JSON *single*, proyectos `meta.json` + MDX, blog, páginas, imágenes), ejecutado desde los scripts de npm (ver [03](03-arquitectura.md#datos)).
- [x] `content/` con los datos **reales que haya** y el relleno de la maqueta para el resto: proyectos y artículos de ejemplo con `draft: true` y `[pendiente]` donde falte.
- [x] Plantillas `content/projects/_plantilla/` y `content/blog/_plantilla/`.
- [x] `src/lib/content.ts` (getters tipados por idioma, orden, borradores, unión `meta.json` + MDX) y `src/lib/rich-text.ts`.
- [x] `NavBar` y `Footer` leen `site.json` y `profile.json`.
- [x] Pruebas de contenido ([06 · Calidad](06-calidad.md#pruebas)).

**Hecho cuando:** cambiar un texto en `content/*.json` cambia la web sin tocar código · un error a propósito en un JSON rompe `npm run dev` con un mensaje que dice archivo y campo · `npm run check` pasa.

## Fase 4 · Home

**Objetivo:** el Home idéntico a `design/home.html`, alimentado por `content/`. Por pasos, comparando cada uno con la maqueta:

- [ ] 4.1 Componentes base: `Card` (cristal + borde iluminado con `usePointerGlow`), `Button`, `SocialIcon`, `StatusPill`, `SectionHead`, `Chip`, `Tag`, `Icon`, `RichText`.
- [ ] 4.2 Hero: texto, botones, redes (copiar email con `useCopy`) y animación de entrada.
- [ ] 4.3 Bento: `BentoFeatured`, `BentoStack`, `BentoGithub` (+ `lib/github.ts`; sin token se oculta), `BentoEducation` y `BentoClock` (zona horaria de `profile.json`).
- [ ] 4.4 Secciones: Sobre mí, Proyectos destacados, Experiencia, Habilidades, Formación y logros, Blog y Contacto (formulario solo en interfaz, con validación en cliente). Orden y visibilidad desde `home.json`.
- [ ] 4.5 *Scrollspy* del menú, aparición con scroll (`animation-timeline`), `prefers-reduced-motion` y `prefers-reduced-transparency`.
- [ ] 4.6 E2E: el Home se ve en ES/EN, ocultar una sección en `home.json` la quita, axe sin errores serios.

**Hecho cuando:** comparación lado a lado con la maqueta a 1440, 1024 y 390 px sin diferencias visibles (salvo datos reales) · todas las interacciones de la maqueta funcionan · Lighthouse en el Home ≥ 90 en rendimiento y 100 en accesibilidad · `npm run check` pasa.

## Fase 5 · Intro del robot

**Objetivo:** la intro en Next.js, con la salida automática hacia el Home ([05 · Robot 3D](05-robot-3d.md)).

- [ ] 5.1 Copiar `prototype/src/*.js` a `src/three/` (en JS) y dividir `main.js` en `stage` e `introSequence`. `RobotStage` (`ssr: false`) con limpieza completa al desmontarse.
- [ ] 5.2 `IntroOverlay` con `RobotLoader`, `WelcomeCard` (textos de `site.json → intro`) y `SkipIntro`. Script en `<head>` que decide `data-intro="play"`.
- [ ] 5.3 Paridad con el prototipo hasta el barrido (pasos 1–6). Comparar con `npm run prototype`.
- [ ] 5.4 Nuevo: pausa de ~1 s → despedida con **caída** → entrada del Home → desmontar y liberar la escena.
- [ ] 5.5 «Saltar intro» + `Esc`, solo la primera visita de la sesión, `prefers-reduced-motion`, sin WebGL o con error de carga → Home directo.
- [ ] 5.6 Pasar `src/three/` a TypeScript.
- [ ] 5.7 E2E con `?intro=fast` (solo fuera de producción).

**Hecho cuando:** la intro es igual a la del prototipo hasta el barrido · termina sola y deja el Home animado · sin errores ni fugas al navegar (memoria estable tras ir y volver al Home 5 veces) · `npm run check` pasa.

## Fase 6 · Páginas interiores

**Objetivo:** el resto del sitio con el mismo lenguaje visual. **Primero el diseño:** maqueta en `design/` → aprobación → implementación, página por página.

- [ ] `/proyectos` (lista con filtros) y `/proyectos/[slug]` (caso de estudio con la plantilla de [02](02-contenido.md#plantilla-de-caso-de-estudio)).
- [ ] `/blog` (etiquetas) y `/blog/[slug]` (Shiki, tabla de contenidos, tiempo de lectura).
- [ ] `/sobre-mi`, `/uses`, `/colofon` (MDX de `content/pages`).
- [ ] 404 con los ojos LED `surprised`.
- [ ] Componentes MDX: `Figure`, `Callout`, `Diagram`, `Video`.

**Hecho cuando:** cada página coincide con su maqueta aprobada en ES/EN · añadir un proyecto siguiendo la receta de [07](07-datos.md#recetas) lo publica sin tocar código · `npm run check` pasa.

## Fase 7 · Contacto y CV

- [ ] Server Action del formulario: Zod, honeypot, Upstash y Resend ([03](03-arquitectura.md#formulario-de-contacto-srcappactionscontactts)), con mejora progresiva.
- [ ] `/cv` imprimible (`print.css`) desde los mismos datos + `npm run cv` → `public/cv/*.pdf`.

**Hecho cuando:** un envío real llega al correo (en *preview*) · enviar más de 3 veces devuelve «demasiados intentos» · los PDF se generan en ES/EN y caben en una página A4.

## Fase 8 · SEO, calidad y rendimiento

- [ ] Metadatos por página, `opengraph-image`, JSON-LD (`Person`, `Article`, `CreativeWork`, `BreadcrumbList`), `sitemap.ts`, `robots.ts` y RSS por idioma.
- [ ] Cabeceras de seguridad (CSP, HSTS…) en `next.config.ts`.
- [ ] E2E completos + axe en todas las páginas y en ambos idiomas; Lighthouse CI con los presupuestos de [06](06-calidad.md#presupuestos-de-rendimiento).

**Hecho cuando:** todos los presupuestos de [06 · Calidad](06-calidad.md) se cumplen en CI.

## Fase 9 · Contenido real y lanzamiento

- [ ] Rellenar todos los `[pendiente]` ([02](02-contenido.md#datos-pendientes)), 3–4 casos de estudio y 3–4 artículos en ES/EN.
- [ ] Quitar `draft` del contenido real y borrar el de ejemplo.
- [ ] Borrar `prototype/` y quitar Vite de las dependencias.
- [ ] Vercel: proyecto, variables de entorno, dominio, analítica. Dependabot.
- [ ] Lista de comprobación de [06 · Calidad](06-calidad.md#lista-de-comprobación-antes-de-publicar).

**Hecho cuando:** el sitio está en el dominio, la lista de comprobación completa y el portafolio enlazado desde LinkedIn, GitHub y el CV.

---

## Ideas para después

- Tema claro.
- Más gestos del robot hechos en Blender.
- Asistente que responde preguntas sobre tu experiencia con los datos de `content/`.
- Página `/now` (en qué estás ahora).
