# 07 · Datos y contenido editable

**Objetivo:** cambiar casi todo el sitio editando archivos de `content/`, sin tocar componentes. Los datos estructurados van en **JSON** y los textos largos (casos de estudio, artículos, páginas) en **MDX** (Markdown con componentes). Todo se valida al compilar: si falta un campo o hay un error de tipeo, el build falla con un mensaje claro en lugar de romper la web en producción. Decisión en [ADR 0006](adr/0006-datos-json-mdx.md).

## Regla general: ¿dónde va cada texto?

| Tipo de texto | Dónde | Ejemplo |
|---|---|---|
| Contenido del sitio (lo que podrías querer cambiar) | `content/*.json` o `content/**/*.mdx` | tu rol, la frase del hero, un proyecto, un título de sección |
| Texto de interfaz (fijo, igual en cualquier portafolio) | `src/i18n/messages/{es,en}.json` | «Copiar email», «Copiado», errores del formulario, «Saltar intro», etiquetas `aria-label` |
| Diseño (colores, tamaños, animaciones) | `src/styles/tokens.css` | tokens de [04 · Diseño](04-diseno.md) |

## Estructura de `content/`

```
content/
├─ site.json            # configuración general: URL, SEO, menú, intro, pie
├─ profile.json         # quién eres: nombre, rol, estado, ubicación, email, redes, CV
├─ home.json            # textos y orden/visibilidad de las secciones del Home
├─ skills.json          # stack destacado (hero) y habilidades por área con nivel
├─ experience.json      # experiencia laboral (línea de tiempo)
├─ education.json       # universidad, certificaciones y logros
├─ projects/
│  ├─ _plantilla/       # carpeta modelo para copiar (se ignora en el build)
│  └─ <slug>/           # un proyecto = una carpeta
│     ├─ meta.json      # datos comunes a ambos idiomas
│     ├─ es.mdx         # título, resumen y caso de estudio en español
│     ├─ en.mdx         # lo mismo en inglés
│     └─ cover.png      # imágenes del proyecto (portada y capturas)
├─ blog/
│  ├─ _plantilla/
│  └─ <slug>/
│     ├─ es.mdx         # un artículo puede existir solo en un idioma
│     ├─ en.mdx
│     └─ cover.png      # opcional
└─ pages/
   ├─ sobre-mi/{es,en}.mdx
   ├─ colofon/{es,en}.mdx
   └─ uses/{es,en}.mdx
```

- Las carpetas que empiezan por `_` se ignoran (sirven de plantilla).
- El **slug** es el nombre de la carpeta, en minúsculas y con guiones: `plataforma-reservas`. Es la URL: `/proyectos/plataforma-reservas` y `/en/projects/plataforma-reservas`.
- Las imágenes van **dentro de la carpeta del proyecto o artículo** y se referencian con ruta relativa (`./cover.png`). Velite las copia, calcula su tamaño y genera el desenfoque de carga para `next/image`.

## Tipos comunes

| Tipo | Forma | Notas |
|---|---|---|
| `Texto` | `{ "es": "…", "en": "…" }` | Ambos idiomas obligatorios. Admite `**negrita**` en los campos marcados como *enriquecido*. |
| `Color` | `"blue"`, `"indigo"`, `"violet"`, `"green"`, `"mint"`, `"amber"`, `"coral"` o `"cyan"` | Nombre de un acento de la paleta ([04 · Diseño](04-diseno.md#color)). No se escriben códigos hex, salvo en los chips de tecnología. |
| `Icono` | nombre de un icono de [Lucide](https://lucide.dev/icons), p. ej. `"layers"`, `"graduation-cap"` | Si no existe, se muestra un icono genérico y se avisa en desarrollo. |
| `Fecha` | `"2025-03"` (año-mes) o `"2025-03-14"` | Se formatea según el idioma. |
| `Ruta` | `"/"`, `"/proyectos"`, `"/blog"`, `"/sobre-mi"`, `"/cv"` | Ruta interna en español; next-intl la traduce (`/proyectos` → `/en/projects`). |
| `Sección` | `"about"`, `"projects"`, `"experience"`, `"skills"`, `"education"`, `"blog"`, `"contact"` | Id de una sección del Home (también es su ancla: `/#projects`). |

## Archivos y campos

### `site.json`

```json
{
  "url": "https://[dominio]",
  "seo": {
    "title": { "es": "Luis Daniel · Desarrollador Full Stack", "en": "Luis Daniel · Full Stack Developer" },
    "description": { "es": "Portafolio de Luis Daniel…", "en": "Portfolio of Luis Daniel…" }
  },
  "nav": [
    { "label": { "es": "Inicio", "en": "Home" }, "route": "/" },
    { "label": { "es": "Sobre mí", "en": "About" }, "route": "/", "section": "about" },
    { "label": { "es": "Proyectos", "en": "Projects" }, "route": "/", "section": "projects" },
    { "label": { "es": "Experiencia", "en": "Experience" }, "route": "/", "section": "experience" },
    { "label": { "es": "Blog", "en": "Blog" }, "route": "/blog" }
  ],
  "navCta": { "label": { "es": "Contacto", "en": "Contact" }, "route": "/", "section": "contact" },
  "intro": {
    "enabled": true,
    "kicker": { "es": "Bienvenido a mi", "en": "Welcome to my" },
    "title": { "es": "Portafolio Web", "en": "Portfolio" },
    "url": "[dominio]"
  },
  "footer": {
    "about": { "es": "Desarrollador full stack. Este sitio está hecho con Next.js, Three.js y un robot modelado en Blender.", "en": "…" },
    "groups": [
      { "title": { "es": "Navegación", "en": "Navigation" }, "links": [ { "label": { "es": "Proyectos", "en": "Projects" }, "route": "/proyectos" } ] }
    ]
  }
}
```

- `intro.enabled: false` desactiva la intro del robot en todo el sitio.

### `profile.json`

```json
{
  "name": "Luis Daniel",
  "fullName": "Luis Daniel [apellidos]",
  "initials": "LD",
  "role": { "es": "Desarrollador Full Stack", "en": "Full Stack Developer" },
  "tagline": { "es": "Construyo aplicaciones web completas, **del modelo de datos a la interfaz**: …", "en": "…" },
  "status": { "available": true, "label": { "es": "Disponible para nuevas oportunidades", "en": "Open to new opportunities" } },
  "location": { "city": "[ciudad]", "country": "[país]", "timezone": "America/Lima" },
  "workModes": { "es": "remoto o híbrido", "en": "remote or hybrid" },
  "responseTime": { "es": "Respondo en menos de 24 horas.", "en": "I reply within 24 hours." },
  "email": "[correo]",
  "github": { "username": "[usuario]" },
  "socials": [
    { "id": "github", "label": "GitHub", "url": "https://github.com/[usuario]", "handle": "@[usuario]" },
    { "id": "linkedin", "label": "LinkedIn", "url": "https://www.linkedin.com/in/[usuario]", "handle": "/in/[usuario]" }
  ],
  "cv": { "es": "/cv/cv-es.pdf", "en": "/cv/cv-en.pdf" }
}
```

- `tagline` es *enriquecido* (admite `**negrita**`).
- `status.available: false` oculta la píldora verde del hero.
- `timezone` (formato IANA) alimenta el reloj del bento: muestra **tu** hora, no la de quien visita.
- `socials[].id` elige el icono y el color de relleno al pasar el cursor: `github`, `linkedin`, `x`, `youtube`, `devto`, `email`.

### `home.json`

```json
{
  "sections": [
    { "id": "about", "visible": true },
    { "id": "projects", "visible": true },
    { "id": "experience", "visible": true },
    { "id": "skills", "visible": true },
    { "id": "education", "visible": true },
    { "id": "blog", "visible": true },
    { "id": "contact", "visible": true }
  ],
  "hero": {
    "primaryCta": { "label": { "es": "Ver proyectos", "en": "View projects" }, "route": "/", "section": "projects" },
    "secondaryCta": { "label": { "es": "Descargar CV", "en": "Download CV" }, "action": "cv" },
    "bento": { "featuredProject": "plataforma-reservas", "showGithub": true, "showClock": true }
  },
  "about": {
    "eyebrow": { "es": "Sobre mí", "en": "About" },
    "title": { "es": "Ingeniería y producto,", "en": "Engineering and product," },
    "titleSoft": { "es": "en el mismo lugar.", "en": "in one place." },
    "paragraphs": [ { "es": "Soy desarrollador full stack…", "en": "I'm a full stack developer…" } ],
    "values": [
      { "icon": "layers", "color": "blue", "title": { "es": "De punta a punta", "en": "End to end" }, "text": { "es": "…", "en": "…" } }
    ]
  },
  "projects": { "eyebrow": { "es": "Proyectos destacados", "en": "Featured projects" }, "title": { "es": "Lo que he construido.", "en": "What I've built." }, "limit": 3 },
  "experience": { "eyebrow": { "es": "Experiencia", "en": "Experience" }, "title": { "es": "Dónde he trabajado.", "en": "Where I've worked." } },
  "skills": { "eyebrow": { "es": "Habilidades", "en": "Skills" }, "title": { "es": "Herramientas que uso.", "en": "Tools I use." } },
  "education": { "eyebrow": { "es": "Formación y logros", "en": "Education and achievements" }, "title": { "es": "Lo que sigo aprendiendo.", "en": "What I keep learning." } },
  "blog": { "eyebrow": { "es": "Blog", "en": "Blog" }, "title": { "es": "Notas técnicas.", "en": "Technical notes." }, "limit": 3 },
  "contact": { "eyebrow": { "es": "Contacto", "en": "Contact" }, "title": { "es": "¿Hablamos?", "en": "Let's talk" }, "text": { "es": "Si tienes una vacante…", "en": "…" } }
}
```

- **Reordenar** el Home = cambiar el orden de `sections`. **Ocultar** una sección = `"visible": false`. El hero va siempre primero.
- El menú solo muestra enlaces a secciones visibles.
- `about.paragraphs` es *enriquecido*. El primer párrafo se muestra más grande.
- `bento.featuredProject` es el slug del proyecto de la tarjeta grande del hero. Si no existe, el build falla.
- `blog.limit` y `projects.limit` limitan cuántos se muestran en el Home.

### `skills.json`

```json
{
  "featured": [
    { "name": "TypeScript", "color": "#3178c6" },
    { "name": "React", "color": "#61dafb" }
  ],
  "areas": [
    {
      "id": "frontend", "icon": "monitor", "color": "blue",
      "title": { "es": "Frontend", "en": "Frontend" },
      "items": [
        { "name": "React", "level": "daily" },
        { "name": "Three.js", "level": "experienced" },
        { "name": "Svelte", "level": "learning" }
      ]
    }
  ]
}
```

- `featured` son los chips del bento del hero (con el color de cada tecnología, en hex).
- `level`: `daily` (uso a diario), `experienced` (con experiencia) o `learning` (aprendiendo). Se dibujan relleno, con borde y discontinuo.

### `experience.json`

```json
[
  {
    "id": "dietrim",
    "role": { "es": "Desarrollador full stack freelance", "en": "Freelance full stack developer" },
    "org": "Dietrim", "url": "https://[dominio-de-dietrim]",
    "type": "freelance",
    "start": "2024-03", "end": null,
    "color": "mint",
    "highlights": { "es": ["Diseño y desarrollo de sitios y aplicaciones web…"], "en": ["…"] },
    "stack": ["React", "Node", "PostgreSQL"]
  }
]
```

- Se ordena solo por `start` (más reciente arriba). `end: null` = trabajo actual: muestra «hoy» y la píldora «Actual».
- `type`: `job`, `freelance`, `internship`, `volunteer` o `academic`.

### `education.json`

```json
{
  "degree": { "es": "Ingeniería de Sistemas", "en": "Systems Engineering" },
  "university": "[universidad]", "city": "[ciudad]",
  "status": { "es": "En curso", "en": "In progress" },
  "progress": { "current": 7, "total": 10, "unit": { "es": "ciclo", "en": "term" } },
  "courses": [ { "es": "Bases de datos", "en": "Databases" } ],
  "certifications": [ { "title": "[certificación]", "issuer": "[emisor]", "year": 2025, "url": "https://…", "color": "blue" } ],
  "achievements": [ { "title": { "es": "[hackatón]", "en": "[hackathon]" }, "detail": { "es": "[puesto]", "en": "[place]" }, "year": 2025, "icon": "trophy", "color": "amber" } ]
}
```

- Sin `progress`, la barra de avance no se muestra.
- Listas vacías (`[]`) ocultan su tarjeta.

### Proyecto: `content/projects/<slug>/meta.json`

```json
{
  "period": { "start": "2025-03", "end": "2025-07" },
  "stack": ["Next.js", "Node", "PostgreSQL"],
  "color": "blue",
  "cover": "./cover.png",
  "links": { "demo": "https://…", "repo": "https://github.com/…" },
  "featured": true,
  "order": 1,
  "draft": false
}
```

- `color`: degradado de la tarjeta (`blue` = azul → violeta, `mint` = verde → cian, `amber` = ámbar → coral…).
- `cover` es opcional. Sin portada se dibuja la maqueta abstracta de la tarjeta.
- `featured: true` lo muestra en el Home, ordenado por `order` (1 = el grande).
- `draft: true` lo oculta en producción y lo deja visible en desarrollo.

### Proyecto: `es.mdx` / `en.mdx`

```mdx
---
title: Plataforma de reservas
summary: Reservas en tiempo real con pagos integrados y panel de administración.
kind: Web · Full stack
role: Desarrollador full stack en un equipo de 3
---

## Contexto y problema
…
## Mi rol
…
## Solución
<Figure src="./captura-1.png" alt="Panel de reservas" />
## Arquitectura
## Decisiones técnicas
## Retos
## Resultados
## Qué haría distinto
```

Las secciones siguen la plantilla de caso de estudio de [02 · Contenido](02-contenido.md#plantilla-de-caso-de-estudio). Componentes disponibles en MDX: `Figure`, `Callout`, `Diagram`, `Video`.

### Artículo: `content/blog/<slug>/es.mdx`

```mdx
---
title: Cómo hice un robot 3D en Blender y lo llevé a la web
description: Modelado por scripts, rig, exportación con Draco y animación con Three.js.
date: 2026-11-10
tags: [Blender, Three.js, 3D]
color: violet
cover: ./cover.png
draft: false
---
```

`color` define el degradado de la portada si no hay `cover`. El tiempo de lectura y la tabla de contenidos se calculan solos.

## Recetas

**Agregar un proyecto**
1. Copia `content/projects/_plantilla/` como `content/projects/mi-proyecto/`.
2. Rellena `meta.json`, `es.mdx` y `en.mdx`, y pon las imágenes en la misma carpeta.
3. Para que salga en el Home: `"featured": true` y un `"order"`.
4. Ejecuta `npm run dev`: si algo está mal, la terminal dice qué archivo y qué campo.

**Agregar un artículo:** copia `content/blog/_plantilla/` y rellena `es.mdx` (y `en.mdx` si lo traduces). Se publica cuando `draft` es `false`.

**Cambiar tu disponibilidad:** `profile.json` → `status.available` y `status.label`.

**Agregar un trabajo:** añade un objeto a `experience.json` (el orden es automático).

**Agregar o subir de nivel una habilidad:** `skills.json` → `areas[].items`.

**Ocultar o reordenar secciones del Home:** `home.json` → `sections`.

**Cambiar el proyecto grande del hero:** `home.json` → `hero.bento.featuredProject`.

**Agregar una certificación o un logro:** `education.json`.

**Actualizar el CV:** edita perfil, experiencia, formación o habilidades y ejecuta `npm run cv`. Regenera `public/cv/cv-es.pdf` y `cv-en.pdf` desde los mismos datos.

**Cambiar un texto de la interfaz** («Copiar email», errores del formulario…): `src/i18n/messages/{es,en}.json`.

## Validación y errores

- Velite valida cada archivo con su esquema (`velite.config.ts`) en `npm run dev` y `npm run build`. Un error indica archivo, campo y motivo.
- `npm run test` incluye pruebas de contenido:
  - todos los `Texto` tienen `es` y `en`;
  - `featuredProject` existe;
  - cada proyecto destacado tiene `es.mdx` y `en.mdx`;
  - los colores e iconos existen;
  - no hay slugs repetidos.
- **Datos de relleno:** mientras falte información real, los proyectos y artículos de ejemplo de la maqueta van con `"draft": true`, y los campos pendientes se marcan como `[pendiente]`. Una prueba impide publicar si queda algún `[pendiente]` en contenido visible en producción.

## Cómo llegan los datos a los componentes

```
content/*.json, content/**/*.mdx
        │  Velite (esquemas Zod, imágenes, MDX compilado) → .velite/ (tipado, generado)
        ▼
src/lib/content.ts   ← única puerta de entrada: getSite(locale), getProfile(locale), getHome(locale),
        │               getSkills(locale), getExperience(locale), getEducation(locale),
        │               getProjects(locale, { featured? }), getProject(locale, slug),
        │               getPosts(locale, { limit? }), getPost(locale, slug), getPage(locale, slug)
        ▼
Server Components (las secciones reciben datos ya resueltos al idioma: string, no { es, en })
```

- Los componentes **nunca** importan JSON ni `.velite/` directamente: siempre pasan por `src/lib/content.ts`, que resuelve el idioma, ordena, filtra borradores y une `meta.json` con el MDX de cada proyecto.
- `.velite/` se genera solo y está en `.gitignore`.
