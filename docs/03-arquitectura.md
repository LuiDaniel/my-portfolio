# 03 · Arquitectura

## Stack

| Capa | Tecnología | Motivo / ADR |
|---|---|---|
| Framework | **Next.js (App Router)** + React + TypeScript (estricto) | [ADR 0001](adr/0001-nextjs-app-router.md) |
| Estilos | **Tailwind CSS v4** + tokens CSS (`src/styles/tokens.css`) | Sistema de diseño en [04 · Diseño](04-diseno.md) |
| i18n | **next-intl**, rutas traducidas, ES por defecto | [ADR 0002](adr/0002-i18n-next-intl.md) |
| Contenido | **MDX + YAML** en el repo, compilado y validado con **Velite** (esquemas Zod) | [ADR 0003](adr/0003-contenido-mdx-velite.md) |
| Código en artículos | Shiki (resaltado en build) | |
| 3D | **Three.js** puro (clases actuales), montado en un componente cliente | [ADR 0004](adr/0004-threejs-en-componente-cliente.md) |
| Movimiento | **GSAP** + ScrollTrigger, **Lenis** (scroll suave) | |
| Backend | Server Actions / Route Handlers de Next.js | [ADR 0005](adr/0005-vercel-y-servicios.md) |
| Email | **Resend** | |
| Anti-spam | Honeypot + límite de envíos (Upstash Redis) | |
| Datos externos | API de GitHub (repos y actividad), con caché | |
| Analítica | Vercel Web Analytics + Speed Insights (sin cookies, sin banner) | |
| Calidad | ESLint, Prettier, TypeScript, Vitest, Playwright + axe, Lighthouse CI | [06 · Calidad](06-calidad.md) |
| CI/CD | GitHub Actions → Vercel (*preview* por PR, producción desde `main`) | |

## Estructura de carpetas

```
portafolio/
├─ .github/workflows/          # ci.yml (lint, tipos, tests, build), lighthouse.yml
├─ blender/                    # scripts de modelado, rig y exportación del robot (ver 05)
├─ docs/                       # esta documentación + adr/
├─ referencias/                # imágenes de referencia del robot
├─ public/
│  ├─ models/robot.glb         # modelo exportado (Draco)
│  ├─ draco/                   # decodificadores (copiados en postinstall, ignorados por git)
│  ├─ cv/                      # cv-es.pdf, cv-en.pdf (generados)
│  └─ favicon.svg, …
├─ scripts/
│  ├─ copy-draco.mjs           # copia los decodificadores Draco de three a public/
│  └─ build-cv.ts              # genera los PDF del CV con Playwright desde /cv y /en/cv
├─ src/
│  ├─ app/
│  │  ├─ [locale]/
│  │  │  ├─ layout.tsx         # <html lang>, fuentes, header, footer, proveedores
│  │  │  ├─ page.tsx           # portada: Hero (intro) + secciones
│  │  │  ├─ proyectos/page.tsx
│  │  │  ├─ proyectos/[slug]/page.tsx
│  │  │  ├─ blog/page.tsx
│  │  │  ├─ blog/[slug]/page.tsx
│  │  │  ├─ cv/page.tsx
│  │  │  ├─ sobre-mi/page.tsx
│  │  │  ├─ uses/page.tsx
│  │  │  ├─ colofon/page.tsx
│  │  │  ├─ opengraph-image.tsx
│  │  │  └─ not-found.tsx
│  │  ├─ [locale]/rss.xml/route.ts
│  │  ├─ sitemap.ts
│  │  ├─ robots.ts
│  │  └─ actions/contact.ts    # Server Action del formulario
│  ├─ components/
│  │  ├─ ui/                   # Button, Link, Tag, Card, Badge, Section, Container…
│  │  ├─ layout/               # Header, Footer, LocaleSwitcher, MobileMenu
│  │  ├─ sections/             # Hero, About, FeaturedProjects, Experience, Skills,
│  │  │                        # Education, LatestPosts, Contact
│  │  ├─ mdx/                  # componentes usables dentro del MDX (Callout, Figure, Diagram…)
│  │  ├─ robot/
│  │  │  ├─ RobotStage.tsx     # componente cliente: canvas + ciclo de vida de la escena
│  │  │  ├─ RobotLoader.tsx    # pantalla negra con los ojos LED (HTML/CSS)
│  │  │  └─ SkipIntro.tsx
│  │  └─ seo/                  # JsonLd (Person, Article, BreadcrumbList)
│  ├─ three/                   # código 3D independiente de React
│  │  ├─ robot.ts              # clase Robot (carga, mixer, gestos, mirada, neón, pistones)
│  │  ├─ eyes.ts               # patrones LED de los ojos
│  │  ├─ intro.ts              # gemas y animación de los componentes del Hero
│  │  ├─ stage.ts              # renderer, luces, halo, bloom, planos de cámara
│  │  ├─ introSequence.ts      # runIntro / sweep / finish / skip
│  │  └─ scrollFade.ts         # al bajar, el Hero y el robot se desvanecen
│  ├─ content/                 # fuente de verdad del contenido (ver abajo)
│  │  ├─ projects/{es,en}/*.mdx
│  │  ├─ blog/{es,en}/*.mdx
│  │  ├─ experience/*.yaml
│  │  └─ pages/{es,en}/*.mdx   # sobre-mí, colofón
│  ├─ data/                    # profile.ts, education.ts, skills.ts, socials.ts, uses.ts
│  ├─ i18n/
│  │  ├─ routing.ts            # idiomas, prefijos y rutas traducidas
│  │  ├─ request.ts            # carga de mensajes por petición
│  │  └─ messages/{es,en}.json # textos de interfaz
│  ├─ lib/                     # github.ts, rate-limit.ts, mail.ts, utils (fechas, slug, lectura)
│  ├─ styles/                  # tokens.css, globals.css, print.css (CV)
│  └─ proxy.ts                 # detección de idioma (next-intl); `middleware.ts` en Next < 16
├─ tests/
│  ├─ unit/                    # Vitest: esquemas, utilidades, i18n completo
│  └─ e2e/                     # Playwright: navegación, intro, formulario, accesibilidad (axe)
├─ velite.config.ts            # colecciones y esquemas de contenido
├─ next.config.ts
├─ tsconfig.json, eslint.config.mjs, .prettierrc, vitest.config.ts, playwright.config.ts
├─ .env.example
├─ CLAUDE.md, README.md
└─ package.json
```

## Rutas e idiomas

- Idiomas: `es` (por defecto) y `en`. Prefijo **solo cuando hace falta** (`localePrefix: 'as-needed'`): español en `/…`, inglés en `/en/…`.
- Rutas traducidas con `pathnames` de next-intl: `/proyectos` ↔ `/en/projects`, `/sobre-mi` ↔ `/en/about`, `/colofon` ↔ `/en/colophon`. Las carpetas de `app/` usan el nombre en español.
- El proxy (middleware) de next-intl detecta el idioma del navegador **solo en la primera visita** a `/`. Después manda la elección del usuario (cookie de next-intl).
- Cada página declara `alternates.languages` (hreflang) y `canonical`.
- Los artículos pueden existir en un solo idioma: el selector lleva a la lista del blog del otro idioma si falta la traducción.

## Modelo de datos

Una sola fuente de verdad: los mismos datos alimentan la portada, las páginas, `/cv`, los PDF, el JSON-LD y las imágenes OG.

```ts
// velite.config.ts (resumen)
projects   → { slug, locale, title, summary, role, period: { start, end? }, team, stack[], type,
               links: { demo?, repo?, post? }, cover, featured, order, draft, body (MDX) }
posts      → { slug, locale, title, description, date, updated?, tags[], cover?, draft,
               readingTime, toc, body (MDX) }
experience → { id, role: { es, en }, org, url?, kind: 'job'|'freelance'|'internship'|'volunteer',
               start, end?, location, highlights: { es[], en[] }, stack[] }
pages      → { slug, locale, title, body (MDX) }        // sobre-mí, colofón
```

Datos que no son contenido largo van en `src/data/*.ts`, tipados y con textos `{ es, en }`.

**Reglas:**
- Velite valida en build: un campo que falta o una fecha inválida rompe el build, no la página en producción.
- `draft: true` se ve en desarrollo y se excluye en producción.
- Un test comprueba que cada proyecto destacado existe en ambos idiomas.

## Renderizado

| Página | Estrategia |
|---|---|
| Portada, proyectos, blog, CV, sobre mí, uses, colofón | **Estática** (SSG) con `generateStaticParams` por idioma y slug |
| Actividad de GitHub (en portada o proyectos) | Estática con **revalidación** cada 24 h |
| Formulario de contacto | Server Action (función serverless) |
| Imágenes OG | Generadas con `next/og` en build |

El 3D **no** se renderiza en el servidor: `RobotStage` se carga con `next/dynamic` y `ssr: false`. Todo el texto del Hero sí viene en el HTML del servidor (SEO, lectores de pantalla, sin saltos de layout). La integración está en [05 · Robot 3D](05-robot-3d.md#integración-de-la-intro).

## Backend

### Formulario de contacto (`src/app/actions/contact.ts`)

1. Valida con Zod (nombre 2–80, email válido, mensaje 10–2000 caracteres).
2. Honeypot: un campo oculto que, si viene relleno, se descarta en silencio.
3. Límite: 3 envíos por IP cada 10 min (Upstash Ratelimit).
4. Envía con Resend a `CONTACT_TO_EMAIL`, con `reply-to` del visitante.
5. Devuelve un estado tipado (`ok` / `invalid` con errores por campo / `rate_limited` / `error`) que el formulario muestra con `useActionState`. Funciona sin JS (mejora progresiva).

### GitHub (`src/lib/github.ts`)

API REST con `GITHUB_TOKEN` (solo lectura): repos fijados, estrellas y lenguaje de los repos de cada proyecto. Se cachea con `revalidate: 86400`. Si la API falla, se muestran los datos del último build y nunca se rompe la página.

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

Sin `RESEND_API_KEY` en desarrollo, el formulario escribe el mensaje en consola en vez de enviarlo.

## CV en PDF

`/cv` es una página HTML pensada para imprimir (`print.css`, una página A4). `npm run cv` arranca el build local y usa Playwright para imprimir `/cv` y `/en/cv` en `public/cv/cv-es.pdf` y `public/cv/cv-en.pdf`. Los PDF se suben al repo, y hay que regenerarlos cuando cambian perfil, experiencia, formación o habilidades.

## Scripts de `package.json`

| Script | Qué hace |
|---|---|
| `dev` | Next.js en desarrollo (+ Velite en modo watch) |
| `build` / `start` | Build de producción / servirlo |
| `lint` / `format` | ESLint / Prettier |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest |
| `test:e2e` | Playwright (incluye axe) |
| `cv` | Genera los PDF del CV |
| `postinstall` | Copia los decodificadores Draco |

## Convenciones

- TypeScript estricto. Componentes de servidor por defecto y `'use client'` solo donde haga falta (robot, menú móvil, formulario, selector de idioma).
- Nombres de archivo: componentes en `PascalCase.tsx`, el resto en `camelCase.ts`; slugs en `kebab-case`.
- Ningún texto de interfaz escrito a mano en los componentes: todo pasa por `messages/{es,en}.json`.
- Commits en español, con estilo convencional (`feat:`, `fix:`, `docs:`…). Una rama y un PR por tarea, y `main` siempre desplegable.
- Las decisiones de arquitectura nuevas se registran como ADR en `docs/adr/`.
