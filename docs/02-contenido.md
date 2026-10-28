# 02 · Contenido

Mapa del sitio, qué va en cada sección y el inventario de datos que hay que reunir. Todo el contenido existe en **español e inglés**.

> Los campos marcados como `[PENDIENTE]` los completa Luis Daniel. Mientras falten, el sitio usa textos de relleno marcados como borrador y no se publica.

## Mapa del sitio

| Página | Ruta ES | Ruta EN | Contenido |
|---|---|---|---|
| Portada | `/` | `/en` | Intro del robot (Hero) + resumen de todas las secciones |
| Proyectos | `/proyectos` | `/en/projects` | Todos los proyectos, filtrables por tecnología y tipo |
| Caso de estudio | `/proyectos/[slug]` | `/en/projects/[slug]` | Un proyecto en profundidad |
| Blog | `/blog` | `/en/blog` | Lista de artículos con etiquetas |
| Artículo | `/blog/[slug]` | `/en/blog/[slug]` | Un artículo |
| CV | `/cv` | `/en/cv` | CV en HTML (imprimible) + descarga en PDF |
| Sobre mí | `/sobre-mi` | `/en/about` | Historia larga, intereses, valores |
| Uses | `/uses` | `/en/uses` | Equipo, editor, herramientas |
| Colofón | `/colofon` | `/en/colophon` | Cómo se hizo el sitio (robot, stack, decisiones) |
| 404 | — | — | El robot con los ojos `surprised` y enlaces de vuelta |

Además: `rss.xml` (blog por idioma), `sitemap.xml`, `robots.txt` e imágenes Open Graph generadas.

**Navegación principal:** Inicio · Proyectos · Blog · Sobre mí · CV · selector ES/EN · botón "Contacto". En móvil, menú desplegable. El pie lleva redes, email, RSS y enlace al colofón.

## Portada (de arriba a abajo)

### 1. Hero (intro del robot)

Ver la coreografía completa en [05 · Robot 3D](05-robot-3d.md#integración-de-la-intro). El robot atrapa tres gemas, cada una trae una pieza:

| Gema | Pieza | Contenido |
|---|---|---|
| 1 (mano der.) | Enlaces | Iconos clicables: GitHub, LinkedIn, CV (PDF) |
| 2 (mano izq.) | Nombre | `Luis Daniel [apellidos PENDIENTE]` |
| 3 (mano der.) | Rol | "Full Stack Developer · Estudiante de Ing. de Sistemas" / "Full Stack Developer · Systems Engineering Student" |

Tras el barrido, el bloque queda como cabecera en la columna izquierda, y se añaden debajo:
- Frase de valor (una línea). `[PENDIENTE]` Ejemplo: "Construyo aplicaciones web completas, del modelo de datos a la interfaz."
- Estado: "Abierto a oportunidades · [ciudad, país] · remoto". `[PENDIENTE]`
- Botón "Saltar intro" (solo mientras corre la intro).

### 2. Salida de la intro

Al hacer scroll, el Hero sube y se desvanece y el robot también: **el robot solo existe en la intro** (siempre de la cintura para arriba). Sin texto propio: es la transición hacia "Sobre mí".

### 3. Sobre mí (resumen)

2–3 párrafos cortos: quién eres, qué te gusta construir, qué buscas. Foto opcional. Enlace a `/sobre-mi`.

### 4. Proyectos destacados

3–4 tarjetas grandes de casos de estudio (marcados `featured: true`) con imagen, una línea de impacto y tecnologías. Enlace a `/proyectos`.

### 5. Experiencia

Línea de tiempo: empleos, freelance (Dietrim), prácticas, voluntariado, docencia o liderazgo de grupos. Cada entrada: rol, organización, fechas, 2–4 logros con verbos de acción y métricas cuando existan.

### 6. Habilidades

Agrupadas por área, con tres niveles honestos (sin porcentajes):

- **Uso a diario** — lo que podrías usar en una entrevista técnica sin preparación.
- **Con experiencia** — lo has usado en proyectos reales.
- **Aprendiendo** — lo estás estudiando ahora.

Áreas: Frontend · Backend · Bases de datos · DevOps / Cloud · Herramientas · Fundamentos (estructuras de datos, algoritmos, redes, sistemas operativos, ingeniería de software).

### 7. Formación y logros

Universidad, carrera, ciclo actual y fecha estimada de egreso; cursos relevantes; certificaciones; logros (hackatones, concursos de programación, becas, publicaciones).

### 8. Últimos artículos

Los 3 artículos más recientes del idioma actual. Enlace a `/blog` y al RSS.

### 9. Contacto

Una frase ("¿Tienes una vacante o quieres hablar de un proyecto técnico?"), formulario (nombre, email, mensaje), email visible y enlaces a redes.

## Plantilla de caso de estudio

Cada proyecto es un archivo MDX en `src/content/projects/{es,en}/<slug>.mdx`.

**Metadatos (frontmatter):** `title`, `summary` (una línea de impacto), `role`, `period` (inicio–fin), `team` (solo o tamaño del equipo), `stack` (lista), `type` (web, móvil, API, datos, herramienta, académico…), `links` (demo, repo, artículo), `cover` (imagen), `featured`, `order`, `draft`.

**Cuerpo (secciones fijas):**

1. **Contexto y problema.** Para quién y qué dolor resolvía.
2. **Mi rol.** Qué hiciste tú exactamente, sobre todo si fue en equipo.
3. **Solución.** Qué hace, con capturas o un video corto.
4. **Arquitectura.** Diagrama (componentes, datos, servicios externos) y explicación.
5. **Decisiones técnicas.** 2–4 decisiones con las alternativas que consideraste y por qué elegiste esa.
6. **Retos.** El problema más difícil y cómo lo resolviste.
7. **Resultados.** Métricas (usuarios, rendimiento, tiempo ahorrado, nota, premio) o resultados cualitativos.
8. **Qué haría distinto.** Lo aprendido y lo que mejorarías hoy.

## Plantilla de artículo

`src/content/blog/{es,en}/<slug>.mdx` con `title`, `description`, `date`, `updated?`, `tags`, `cover?`, `draft`. Código con resaltado, imágenes optimizadas, tiempo de lectura calculado y tabla de contenidos automática.

**Artículos para el lanzamiento** (3–4):

1. "Cómo hice un robot 3D en Blender y lo llevé a la web": modelado por scripts, rig, exportación con Draco y animación con Three.js. Ya existe todo el material.
2. Un análisis a fondo de uno de los proyectos destacados. `[PENDIENTE: cuál]`
3. Un tema técnico que domines (por ejemplo, autenticación, diseño de APIs, optimización de consultas). `[PENDIENTE]`
4. Opcional: "Cómo construí este portafolio con Next.js" (i18n, MDX, CV en PDF desde los mismos datos).

## Inventario de datos (por rellenar)

### Perfil — `src/data/profile.ts`

| Campo | Valor |
|---|---|
| Nombre completo | `[PENDIENTE]` |
| Rol / titular (ES/EN) | Full Stack Developer · Estudiante de Ing. de Sistemas |
| Frase de valor (ES/EN) | `[PENDIENTE]` |
| Ubicación y zona horaria | `[PENDIENTE]` |
| Disponibilidad | `[PENDIENTE]` (prácticas / tiempo completo / remoto / híbrido) |
| Idiomas y nivel | `[PENDIENTE]` |
| Email de contacto | `[PENDIENTE]` |
| GitHub, LinkedIn, otras redes | `[PENDIENTE]` |
| Foto | `[PENDIENTE]` (opcional) |
| Dominio | `[PENDIENTE]` (p. ej. `nombre.dev`) |

### Proyectos — `src/content/projects/`

| # | Proyecto | Tipo | Stack | Demo / Repo | ¿Destacado? |
|---|---|---|---|---|---|
| 1 | `[PENDIENTE]` | | | | |
| 2 | `[PENDIENTE]` | | | | |
| 3 | `[PENDIENTE]` | | | | |
| 4 | `[PENDIENTE]` | | | | |
| — | Dietrim (freelance) | Web | `[PENDIENTE]` | `[PENDIENTE]` | `[PENDIENTE]` |
| — | Este portafolio + robot 3D | Web / 3D | Next.js, Three.js, Blender | repo | Sí |

### Experiencia — `src/content/experience/*.yaml`

| Rol | Organización | Inicio – Fin | Logros |
|---|---|---|---|
| Desarrollador freelance | Dietrim | `[PENDIENTE]` | `[PENDIENTE]` |
| `[PENDIENTE]` | | | |

### Formación — `src/data/education.ts`

| Campo | Valor |
|---|---|
| Universidad | `[PENDIENTE]` |
| Carrera | Ingeniería de Sistemas |
| Ciclo actual / egreso estimado | `[PENDIENTE]` |
| Cursos relevantes | `[PENDIENTE]` |
| Certificaciones | `[PENDIENTE]` |
| Logros (hackatones, concursos, becas) | `[PENDIENTE]` |

### Habilidades — `src/data/skills.ts`

Lista por área con nivel (`daily` · `experienced` · `learning`). `[PENDIENTE]`

### Uses — `src/data/uses.ts`

Equipo, sistema operativo, editor y extensiones, terminal, herramientas. `[PENDIENTE]`

## Estilo de redacción

- Primera persona, frases cortas, verbos de acción ("diseñé", "reduje", "migré").
- Métricas concretas cuando existan; si no, resultados cualitativos sin inflarlos.
- La versión en inglés no es una traducción literal: se adapta para que suene natural.
- Nada de relleno ("apasionado por la tecnología"): mostrar con ejemplos.
