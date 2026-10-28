# 03 · Arquitectura

## Stack

| Capa | Tecnología | Motivo / ADR |
|---|---|---|
| Framework | **Next.js (App Router)**, última versión estable, + React + TypeScript estricto | [ADR 0001](adr/0001-nextjs-app-router.md) |
| Estilos | **Tailwind CSS v4** con tokens en `@theme` (`src/styles/tokens.css`) + `src/styles/effects.css` para cristal, borde iluminado y animaciones | [04 · Diseño](04-diseno.md), [ADR 0007](adr/0007-diseno-apple-bento.md) |
| Iconos | **lucide-react** + SVG propios para marcas (GitHub, LinkedIn) | |
| Fuentes | `next/font/google`: **Inter** (variable) y **JetBrains Mono** | |
| i18n | **next-intl**, rutas traducidas, ES por defecto | [ADR 0002](adr/0002-i18n-next-intl.md) |
| Contenido | **JSON + MDX** en `content/`, validado y compilado con **Velite** (esquemas Zod) | [ADR 0006](adr/0006-datos-json-mdx.md), [07 · Datos](07-datos.md) |
| Código en artículos | Shiki (resaltado en build, vía rehype) | |
| 3D (solo intro) | **Three.js** puro (clases del prototipo) en un componente cliente | [ADR 0004](adr/0004-threejs-en-componente-cliente.md) |
| Movimiento | **CSS** para toda la interfaz (transiciones, `@keyframes`, `animation-timeline: view()`); **GSAP** solo para la coreografía de la intro | |
| Scroll suave | Nativo (`scroll-behavior: smooth`); sin librería | |
| Backend | Server Actions y Route Handlers de Next.js | [ADR 0005](adr/0005-vercel-y-servicios.md) |
| Email | **Resend** | |
| Anti-spam | Honeypot + límite de envíos (Upstash Redis) | |
| Datos externos | API GraphQL de GitHub (calendario de contribuciones), con caché de 24 h | |
| Analítica | Vercel Web Analytics + Speed Insights (sin cookies) | |
| Calidad | ESLint, Prettier, TypeScript, Vitest, Playwright + axe, Lighthouse CI | [06 · Calidad](06-calidad.md) |
| CI/CD | GitHub Actions → Vercel (*preview* por PR, producción desde `main`) | |

## Estructura de carpetas (objetivo)

```
portafolio/
├─ .claude/launch.json         # servidores de vista previa: "next" (3000) y "prototype" (5173)
├─ .github/workflows/          # ci.yml, lighthouse.yml
├─ blender/                    # scripts del robot (modelado, rig, animaciones, exportación) → ver 05
├─ content/                    # ★ CONTENIDO EDITABLE (JSON + MDX) → ver 07
│  ├─ site.json, profile.json, home.json, skills.json, experience.json, education.json
│  ├─ projects/<slug>/{meta.json, es.mdx, en.mdx, imágenes}
│  ├─ blog/<slug>/{es.mdx, en.mdx, imágenes}
│  └─ pages/{sobre-mi,colofon,uses}/{es,en}.mdx
├─ design/                     # ★ maquetas aprobadas (home.html = fuente de verdad visual)
├─ docs/                       # documentación + adr/
├─ prototype/                  # prototipo Vite de la intro (referencia; se borra en la fase 9)
├─ public/
│  ├─ models/robot.glb         # modelo del robot (Draco, ~0,8 MB)
│  ├─ draco/                   # decodificadores (postinstall; ignorados por git)
│  ├─ cv/                      # cv-es.pdf, cv-en.pdf (generados con npm run cv)
│  └─ favicon.svg, apple-touch-icon.png
├─ referencias/                # imágenes de referencia del robot
├─ scripts/
│  ├─ copy-draco.mjs           # copia los decodificadores de three a public/draco
│  └─ build-cv.ts              # imprime /cv y /en/cv a PDF con Playwright
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx         # <html lang>, fuentes, Ambient, NavBar, Footer, proveedores
│  │  │  ├─ page.tsx           # Home: IntroOverlay (1.ª visita) + Hero + secciones según home.json
│  │  │  ├─ proyectos/page.tsx, proyectos/[slug]/page.tsx
│  │  │  ├─ blog/page.tsx, blog/[slug]/page.tsx
│  │  │  ├─ sobre-mi/page.tsx, cv/page.tsx, uses/page.tsx, colofon/page.tsx
│  │  │  ├─ opengraph-image.tsx
│  │  │  ├─ rss.xml/route.ts
│  │  │  └─ not-found.tsx
│  │  ├─ actions/contact.ts    # Server Action del formulario
│  │  ├─ sitemap.ts, robots.ts
│  │  └─ globals.css           # importa tokens.css y effects.css
│  ├─ components/
│  │  ├─ layout/               # Ambient, NavBar, MobileMenu, LocaleSwitch, Footer
│  │  ├─ sections/             # Hero, hero/Bento*, About, FeaturedProjects, Experience,
│  │  │                        # Skills, Education, LatestPosts, Contact, ContactForm
│  │  ├─ ui/                   # Card, Button, SocialIcon, StatusPill, SectionHead, Chip, Tag,
│  │  │                        # ProjectCard, PostCard, TimelineItem, Icon, RichText
│  │  ├─ intro/                # IntroOverlay, RobotStage, RobotLoader, WelcomeCard, SkipIntro
│  │  ├─ mdx/                  # Figure, Callout, Diagram, Video (usables en MDX)
│  │  └─ seo/                  # JsonLd
│  ├─ hooks/                   # usePointerGlow, useScrollSpy, useCopy, useReducedMotion
│  ├─ i18n/                    # routing.ts, request.ts, navigation.ts, messages/{es,en}.json
│  ├─ lib/                     # content.ts (★ única puerta a los datos), github.ts, mail.ts,
│  │                           # rate-limit.ts, format.ts, rich-text.ts
│  ├─ styles/                  # tokens.css, effects.css, print.css
│  ├─ three/                   # robot.ts, eyes.ts, intro.ts, stage.ts, introSequence.ts
│  └─ proxy.ts                 # next-intl (en Next < 16 se llama middleware.ts)
├─ tests/
│  ├─ unit/                    # Vitest: contenido, utilidades, i18n
│  └─ e2e/                     # Playwright: navegación, intro, Home, formulario, axe
├─ velite.config.ts            # colecciones y esquemas de content/
├─ next.config.ts, tsconfig.json, eslint.config.mjs, .prettierrc, vitest.config.ts, playwright.config.ts
├─ .env.example
└─ CLAUDE.md, README.md, package.json
```

`.velite/` (salida generada), `.next/`, `public/draco/` y `node_modules/` van en `.gitignore`.

## Rutas, idiomas y anclas

- Idiomas `es` (por defecto) y `en`, con `localePrefix: 'as-needed'`: español en `/…`, inglés en `/en/…`.
- Rutas traducidas (`pathnames` de next-intl): `/proyectos` ↔ `/en/projects`, `/sobre-mi` ↔ `/en/about`, `/colofon` ↔ `/en/colophon`; `/blog`, `/cv` y `/uses` son iguales. Las carpetas de `app/` usan el nombre en español.
- **Anclas del Home** (iguales en ambos idiomas): `#about`, `#projects`, `#experience`, `#skills`, `#education`, `#blog`, `#contact`. Son los `id` de `home.json → sections`.
- El proxy de next-intl detecta el idioma del navegador **solo en la primera visita**; después manda la elección del usuario (cookie).
- Cada página declara `canonical` y `alternates.languages` (hreflang).
- Un artículo puede existir en un solo idioma: el selector de idioma lleva entonces a la lista del blog del otro idioma.

## Datos

Todo el contenido vive en `content/` y se lee **solo** a través de `src/lib/content.ts`. Esquemas, archivos y recetas en [07 · Datos](07-datos.md).

```
content/ ──Velite (Zod + MDX + imágenes)──► .velite/ ──► src/lib/content.ts ──► Server Components
```

- **Velite** se integra con Next.js como indica su guía oficial: se arranca desde `next.config.ts` (modo *watch* en desarrollo, *clean* en build).
- `content.ts` devuelve los datos ya resueltos al idioma (`string`, no `{ es, en }`), ordenados y sin borradores en producción.
- **Texto enriquecido:** los campos marcados como tal admiten solo `**negrita**`, que convierte `lib/rich-text.ts`. Sin HTML arbitrario, para que no haya inyección de código.

## Renderizado

| Página | Estrategia |
|---|---|
| Home, proyectos, blog, sobre mí, CV, uses, colofón | **Estática** (SSG) con `generateStaticParams` por idioma y slug |
| Tarjeta de GitHub | Datos obtenidos en el servidor con revalidación de 24 h |
| Reloj del bento | El servidor pinta la esfera sin agujas; el cliente las coloca (evita diferencias de hidratación) |
| Formulario de contacto | Server Action |
| Imágenes OG | `next/og` |

- **Componentes de servidor por defecto.** Llevan `'use client'` solo: `Ambient`, `NavBar` (resaltado y *scrollspy*), `MobileMenu`, `LocaleSwitch`, `SocialIcon` (copiar email), `BentoClock`, `ContactForm`, todo `intro/` y lo que use `usePointerGlow`.
- **Borde iluminado de tarjetas:** un único listener (`usePointerGlow` en el layout) actualiza `--mx` y `--my` de la tarjeta bajo el cursor. No hay un listener por tarjeta.
- **Intro:** `RobotStage` se carga con `next/dynamic` y `ssr: false`. El Home es HTML del servidor; la intro es una capa encima que se desmonta al terminar ([05 · Robot 3D](05-robot-3d.md#integración-de-la-intro)).

## Backend

### Formulario de contacto (`src/app/actions/contact.ts`)

1. Valida con Zod: nombre 2–80, email válido, mensaje 10–2000 caracteres.
2. Honeypot: un campo oculto que, si viene relleno, se descarta en silencio.
3. Límite: 3 envíos por IP cada 10 min (Upstash Ratelimit). Sin variables de Upstash (desarrollo) no hay límite.
4. Envía con Resend a `CONTACT_TO_EMAIL`, con `reply-to` del visitante. Sin `RESEND_API_KEY` (desarrollo), el mensaje se escribe en consola.
5. Devuelve un estado tipado (`ok`, `invalid` con errores por campo, `rate_limited`, `error`) que el formulario muestra con `useActionState`. Funciona sin JS (mejora progresiva).

### GitHub

`src/lib/github.ts` consulta la API GraphQL (`user.contributionsCollection.contributionCalendar`) con `GITHUB_TOKEN` (permiso de solo lectura), con `revalidate: 86400`. Devuelve el total y las semanas con su nivel (0–4), que se dibujan con la escala de verdes de GitHub. Si no hay token o la API falla, la tarjeta se oculta: nunca rompe la página.

### Variables de entorno (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
GITHUB_TOKEN=
```

## CV en PDF

`/cv` es una página HTML pensada para imprimir (`print.css`, A4, tema claro). `npm run cv` compila, arranca el servidor y usa Playwright para imprimir `/cv` y `/en/cv` en `public/cv/cv-es.pdf` y `cv-en.pdf`. Los PDF se suben al repo y se regeneran cuando cambian perfil, experiencia, formación o habilidades.

## Scripts de `package.json`

| Script | Qué hace |
|---|---|
| `dev` | Next.js en desarrollo (Velite en modo *watch*) → http://localhost:3000 |
| `build` / `start` | Build de producción / servirlo |
| `lint` / `format` | ESLint / Prettier |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest (incluye pruebas de contenido) |
| `test:e2e` | Playwright + axe |
| `check` | `lint` + `typecheck` + `test` + `build` (lo mismo que CI) |
| `cv` | Genera los PDF del CV |
| `prototype` | Prototipo Vite de la intro → http://localhost:5173 (hasta la fase 9) |
| `postinstall` | Copia los decodificadores Draco |

## Convenciones

- TypeScript estricto (`strict`, `noUncheckedIndexedAccess`). Sin `any` salvo justificado con un comentario.
- Nombres: componentes en `PascalCase.tsx`, el resto en `camelCase.ts`, slugs en `kebab-case`.
- Ningún texto escrito a mano en los componentes: el contenido sale de `content/` y la interfaz de `messages/{es,en}.json`.
- Ningún color o tamaño suelto en los componentes: se usan los tokens.
- Commits en español con estilo convencional (`feat:`, `fix:`, `docs:`, `chore:`, `test:`). Un commit por paso verificado y una rama por fase; `main` siempre desplegable.
- Las decisiones nuevas de arquitectura se registran como ADR en `docs/adr/`.
