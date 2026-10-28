# 02 · Contenido

Mapa del sitio, qué va en cada sección y qué datos faltan. Todo el contenido existe en **español e inglés** y se edita en `content/` (JSON + MDX, ver [07 · Datos](07-datos.md)).

> Los datos que solo Luis Daniel puede dar están marcados `[pendiente]`. Mientras falten, se usan los de relleno de la maqueta, marcados como borrador. El sitio **no se publica** con `[pendiente]` visibles: una prueba lo impide.

## Mapa del sitio

Decisión: **híbrido**. El Home es una landing larga con el resumen de todo; lo que necesita profundidad o una URL propia va en páginas aparte. Contacto no tiene página propia: es la última sección del Home y está en el pie de todas las páginas.

| Página | Ruta ES | Ruta EN | Contenido | Diseño |
|---|---|---|---|---|
| Home | `/` | `/en` | Intro del robot (1.ª visita) → Home con todas las secciones | ✅ [`design/home.html`](../design/home.html) |
| Proyectos | `/proyectos` | `/en/projects` | Todos los proyectos, filtrables por tecnología y tipo | Por diseñar (mismo lenguaje) |
| Caso de estudio | `/proyectos/[slug]` | `/en/projects/[slug]` | Un proyecto en profundidad | Por diseñar |
| Blog | `/blog` | `/en/blog` | Artículos con etiquetas | Por diseñar |
| Artículo | `/blog/[slug]` | `/en/blog/[slug]` | Un artículo | Por diseñar |
| Sobre mí | `/sobre-mi` | `/en/about` | Historia completa | Por diseñar |
| CV | `/cv` | `/en/cv` | CV en HTML imprimible + PDF | Por diseñar |
| Uses | `/uses` | `/en/uses` | Equipo y herramientas | Por diseñar |
| Colofón | `/colofon` | `/en/colophon` | Cómo se hizo el sitio (robot, stack, decisiones) | Por diseñar |
| 404 | — | — | Ojos LED `surprised` y enlaces de vuelta | Por diseñar |

Además: `rss.xml` por idioma, `sitemap.xml`, `robots.txt` e imágenes Open Graph generadas.

**Menú** (de `site.json`): logo «LD» · Inicio · Sobre mí · Proyectos · Experiencia · Blog · ES/EN · botón «Contacto».
- Inicio, Sobre mí, Proyectos, Experiencia y Contacto llevan a su **sección del Home** (con scroll suave si ya estás en el Home).
- Blog lleva a `/blog`.
- Desde las secciones se enlaza a las páginas completas («Mi historia completa» → `/sobre-mi`, «Ver todos los proyectos» → `/proyectos`, «Ver CV completo» → `/cv`).

## Home (de arriba a abajo)

Referencia visual: [`design/home.html`](../design/home.html). Componentes en [04 · Diseño](04-diseno.md#de-la-maqueta-a-los-componentes).

### Intro (solo la primera visita de la sesión)

El robot (de la cintura para arriba) atrapa tres gemas y arma la tarjeta **«Bienvenido a mi Portafolio Web»** con tres iconos decorativos y el dominio. La barre a la izquierda, se queda ~1 s y **todo se despide solo** (caída), sin deslizar. En la misma pantalla entra el Home. Botón «Saltar intro» visible todo el tiempo. Detalle en [05 · Robot 3D](05-robot-3d.md#integración-de-la-intro). Textos en `site.json → intro`.

### 1. Hero

| Elemento | Contenido | Datos |
|---|---|---|
| Estado | Píldora «Disponible para nuevas oportunidades» con punto verde | `profile.status` |
| Nombre (`h1`) | «Luis Daniel» | `profile.name` |
| Rol | «Desarrollador Full Stack», en degradado | `profile.role` |
| Frase de valor | «Construyo aplicaciones web completas, **del modelo de datos a la interfaz**…» | `profile.tagline` |
| Botones | «Ver proyectos» (principal) · «Descargar CV» (cristal) | `home.hero.primaryCta / secondaryCta`, `profile.cv` |
| Redes | Iconos redondos: GitHub, LinkedIn, email (se copia) | `profile.socials`, `profile.email` |
| Bento: proyecto destacado | Tarjeta ancha con miniatura | `home.hero.bento.featuredProject` |
| Bento: stack | Chips con el color de cada tecnología | `skills.featured` |
| Bento: GitHub | Contribuciones reales del último año | API de GitHub (`profile.github.username`) |
| Bento: formación | «Ingeniería de Sistemas · En curso» | `education` |
| Bento: hora local | Reloj analógico con tu zona horaria | `profile.location` |
| Aviso | «Desliza», con ratón animado | — |

Decisión de jerarquía (2026-10-28): **nombre grande, rol justo debajo**, y la condición de estudiante en el bento, para no competir con lo principal.

### 2. Sobre mí
Título en dos tonos, 2–3 párrafos (el primero más grande) y tres tarjetas de valores con icono y color. Enlace «Mi historia completa» → `/sobre-mi`. Datos: `home.about`.

### 3. Proyectos destacados
Tres tarjetas: una grande (dos filas, normalmente **este portafolio con el robot**) y dos medianas. Cada una con miniatura, tipo en mono, título, resumen y tecnologías. Enlace «Ver todos los proyectos». Datos: proyectos con `featured: true`, ordenados por `order`.

### 4. Experiencia
Línea de tiempo vertical (ámbar → violeta). Cada entrada: rol, organización, fechas, 2–4 logros y tecnologías; la actual con la píldora «Actual». Primera entrada: **Dietrim (freelance)**. Enlace «Ver CV completo». Datos: `experience.json`.

### 5. Habilidades
Seis áreas (Frontend, Backend, Datos, DevOps y cloud, Herramientas, Fundamentos), cada una con su icono y color, y tres niveles honestos, sin porcentajes:
- **Uso a diario:** lo podrías usar en una entrevista técnica sin preparación.
- **Con experiencia:** lo has usado en proyectos reales.
- **Aprendiendo:** lo estás estudiando ahora.

Datos: `skills.json → areas`.

### 6. Formación y logros
Universidad con barra de avance y cursos relevantes; certificaciones; logros (hackatones, concursos, becas). Datos: `education.json`.

### 7. Blog
Los 3 artículos más recientes del idioma actual. Enlace «Todos los artículos». Datos: `content/blog`.

### 8. Contacto
«¿Hablamos?»: texto, accesos directos (email que se copia, LinkedIn, GitHub) y formulario (nombre, email, mensaje). Datos: `home.contact`, `profile`.

### Pie
Marca y frase, enlaces de navegación, recursos (CV, RSS, colofón, uses) y redes. Datos: `site.footer`.

## Plantilla de caso de estudio

Cada proyecto es una carpeta en `content/projects/<slug>/` con `meta.json`, `es.mdx`, `en.mdx` e imágenes ([07 · Datos](07-datos.md#proyecto-contentprojectsslugmetajson)). El cuerpo sigue siempre estas secciones:

1. **Contexto y problema.** Para quién y qué problema resolvía.
2. **Mi rol.** Qué hiciste tú exactamente, sobre todo si fue en equipo.
3. **Solución.** Qué hace, con capturas o un video corto.
4. **Arquitectura.** Diagrama (componentes, datos, servicios externos) y explicación.
5. **Decisiones técnicas.** 2–4 decisiones con las alternativas que consideraste y por qué elegiste esa.
6. **Retos.** El problema más difícil y cómo lo resolviste.
7. **Resultados.** Métricas (usuarios, rendimiento, tiempo ahorrado, nota, premio) o resultados cualitativos.
8. **Qué haría distinto.** Lo aprendido y lo que mejorarías hoy.

## Artículos para el lanzamiento (3–4)

1. «Cómo hice un robot 3D en Blender y lo llevé a la web»: modelado por scripts, rig, exportación con Draco y animación con Three.js. Ya existe todo el material.
2. Un análisis a fondo de uno de los proyectos destacados. `[pendiente: cuál]`
3. Un tema técnico que domines (diseño de APIs, autenticación, optimización de consultas…). `[pendiente]`
4. Opcional: «Cómo construí este portafolio con Next.js» (i18n, contenido en JSON/MDX, CV en PDF desde los mismos datos).

## Datos pendientes

| Dato | Archivo |
|---|---|
| Apellidos, email, ciudad, país, zona horaria | `profile.json` |
| Usuarios de GitHub y LinkedIn (y otras redes) | `profile.json` |
| Frase de valor definitiva (ES/EN) | `profile.json → tagline` |
| Dominio | `site.json` |
| 3–4 proyectos reales: descripción, stack, enlaces, capturas, caso de estudio | `content/projects/` |
| Dietrim: fechas, logros, stack, enlace | `experience.json` (y quizá un caso de estudio) |
| Otras experiencias (prácticas, voluntariado, docencia) | `experience.json` |
| Universidad, ciclo actual y total, cursos | `education.json` |
| Certificaciones y logros | `education.json` |
| Habilidades reales y su nivel | `skills.json` |
| Textos de «Sobre mí» (corto y página completa) | `home.json → about`, `content/pages/sobre-mi` |
| Equipo y herramientas | `content/pages/uses` |
| Foto (opcional) | `content/pages/sobre-mi/` |

## Estilo de redacción

- Primera persona, frases cortas, verbos de acción («diseñé», «reduje», «migré»).
- Métricas concretas cuando existan; si no, resultados cualitativos sin inflarlos.
- La versión en inglés no es una traducción literal: se adapta para que suene natural.
- Nada de relleno («apasionado por la tecnología»): mostrar con ejemplos.
