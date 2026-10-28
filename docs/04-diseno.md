# 04 · Diseño

**Fuente de verdad visual: [`design/home.html`](../design/home.html)**, la maqueta aprobada del Home (2026-10-28). Este documento la traduce a tokens, componentes y reglas. Si algo no coincide, gana la maqueta y hay que actualizar este documento. Decisión en [ADR 0007](adr/0007-diseno-apple-bento.md).

**Dirección:** *Apple Design* (cristal translúcido, tipografía grande con tracking negativo, respuesta inmediata al pulsar, movimiento sin rebotes) + *bento* de *UI/UX Pro Max* (tarjetas con información, cada una con personalidad propia). Fondo casi negro, **índigo/violeta como color dominante** y unos pocos acentos con significado fijo.

## Principios

1. **El contenido manda.** Nombre, rol, CTA y enlaces se leen de un vistazo; el resto acompaña.
2. **Un color domina, los acentos significan algo.** Azul → índigo → violeta en todo lo principal. El resto de colores se usan solo para su función (verde = GitHub/disponible, ámbar = formación/experiencia, coral = blog, cian = herramientas).
3. **Cada tarjeta tiene personalidad**, pero todas comparten radio, bordes, cristal e interacción.
4. **Todo responde.** Al pasar el cursor algo cambia, al pulsar se hunde. Nada es estático, pero nada distrae.
5. **Accesible y rápido por defecto.** Contraste AA, foco visible, `prefers-reduced-motion` y `prefers-reduced-transparency`.

## Color

Una sola apariencia **oscura** (decisión deliberada: es la identidad del robot). Tokens en `src/styles/tokens.css`, expuestos a Tailwind v4 con `@theme`.

**Nombres en el código:** las tablas usan los nombres cortos de la maqueta; en `tokens.css` llevan el prefijo de Tailwind para que generen clases: `--bg` → `--color-bg` (`bg-bg`), `--muted` → `--color-muted` (`text-muted`), `--violet` → `--color-violet`, la escala de GitHub → `--color-gh-0…4`, `--spring` → `--ease-spring` (`ease-spring`), radios `--radius-card` (24 px) y `--radius-box` (32 px), contenedor `--container-site` (`max-w-site`). `--grad`, `--pad-l/r` y `--section-gap` quedan en `:root` (no generan clases). La paleta por defecto de Tailwind está anulada: no hay más colores que estos. Las animaciones son clases `animate-rise`, `animate-pop`, `animate-drop`, `animate-drift`, `animate-pulse`, `animate-sheen` y `animate-wheel`, y los materiales `glass`, `glow-edge` y `reveal` (`src/styles/effects.css`).

### Base

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#05060b` | Fondo de página |
| `--bg-2` | `#0a0b14` | Fondos alternos |
| `--fg` | `#f4f5fb` | Texto principal, botón primario |
| `--muted` | `rgb(226 230 245 / .66)` | Texto secundario |
| `--faint` | `rgb(226 230 245 / .55)` | Metadatos, etiquetas mono (la maqueta usa .42; se sube a .55 para cumplir contraste AA) |
| `--glass` | `rgb(255 255 255 / .055)` | Superficie de cristal |
| `--glass-hi` | `rgb(255 255 255 / .1)` | Cristal en hover / seleccionado |
| `--edge` | `rgb(255 255 255 / .11)` | Bordes de 1 px |

### Marca (dominante)

| Token | Valor | Uso |
|---|---|---|
| `--blue` | `#5b84ff` | Inicio de degradados, foco |
| `--indigo` | `#7b74ff` | Tono medio |
| `--violet` | `#a77bff` | Final de degradados |
| `--grad` | `linear-gradient(100deg, blue, indigo 50%, violet)` | Rol del hero, logo «LD», botón de iconos, bordes destacados |

### Acentos (con significado fijo)

| Token | Valor | Significado |
|---|---|---|
| `--green` | `#39d353` + escala de GitHub `#161b22 #0e4429 #006d32 #26a641 #39d353` | Actividad de GitHub |
| `--mint` | `#3ddc97` | Estado «disponible», trabajo actual, éxito del formulario |
| `--amber` | `#f6b55a` | Formación, experiencia (inicio de la línea de tiempo) |
| `--coral` | `#ff7d93` | Blog, errores del formulario, segundero del reloj |
| `--cyan` | `#4cc9f0` | Habilidades / herramientas |

Los nombres `blue`, `indigo`, `violet`, `green`, `mint`, `amber`, `coral` y `cyan` son los valores permitidos en el campo `color` de los JSON ([07 · Datos](07-datos.md#tipos-comunes)). Con `color-mix()` se derivan los fondos (16–22 %) y bordes (30–45 %) de cada acento.

**Contraste** sobre `--bg`: `--fg` ≈ 18:1, `--muted` ≈ 7:1, `--faint` (.55) ≈ 5:1. Con .42, como en la maqueta, quedaría en ≈ 3,3:1 y no cumple AA en texto pequeño. Sobre cristal el fondo es algo más claro: axe lo verifica en CI. Los acentos se usan en iconos, bordes y texto ≥ 12 px, nunca en párrafos largos.

### Atmósfera

- Tres **manchas** difuminadas (`blur(90px)`, opacidad .4–.55): azul `#2546d8` arriba a la derecha, violeta `#6b2fd9` en el centro derecho y azul profundo `#1b2a7a` abajo a la izquierda. Derivan con ciclos de 28, 34 y 40 s.
- **Luz que sigue al cursor:** círculo radial de 640 px con `rgb(120 130 255 / .09)`. Solo con puntero fino y sin `reduced-motion`.
- **Grano:** puntos de 1 px con 3 % de blanco cada 4 px.

## Tipografía

| Rol | Fuente | Notas |
|---|---|---|
| Interfaz y títulos | **Inter** (variable, `opsz`) con `next/font`; en Apple se antepone la del sistema (`-apple-system`, SF Pro) | Tracking negativo en grande |
| Etiquetas y datos | **JetBrains Mono** | Mayúsculas, tracking +0,08–0,1 em, 11–13 px |

| Estilo | Tamaño | Interlineado / tracking | Uso |
|---|---|---|---|
| `display` | `clamp(52px, 8.4vw, 112px)`, 700 | .98 / −0,045 em | Nombre (h1) |
| `role` | `clamp(26px, 3.4vw, 44px)`, 600, con `--grad` animado | 1,1 / −0,03 em | Rol bajo el nombre |
| `h2` | `clamp(34px, 4.6vw, 56px)`, 700 | 1,02 / −0,04 em | Título de sección (con parte final en `--faint`) |
| `h3` | 17–28 px, 600–700 | −0,01/−0,02 em | Tarjetas |
| `lede` | `clamp(17px, 1.35vw, 19px)` | 1,6 | Frase del hero, intro de sección |
| `body` | 15–16 px | 1,55 | Texto |
| `eyebrow` | 12 px mono, mayúsculas, +0,1 em | — | Encima de cada `h2`, con un punto de color |

Ancho de lectura máximo: **46ch** en el hero, **58ch** en «Sobre mí» y **68ch** en artículos y casos de estudio.

## Espaciado, rejilla y forma

- Contenedor de **1240 px** como máximo. Márgenes laterales `max(24px, safe-area)`.
- Separación entre secciones: `clamp(80px, 11vw, 140px)`.
- **Hero:** dos columnas (`1.05fr / 1fr`), texto a la izquierda y bento a la derecha. Altura mínima `max(100vh, 720px)`. Por debajo de 980 px, una columna con el bento debajo.
- Radios: chips y botones `999px`; tarjetas **24 px**; cajas grandes (contacto) **32 px**; miniaturas internas 14–18 px; iconos cuadrados 11–14 px.
- Separaciones de rejilla: 14 px (bento), 16 px (rejillas de sección).
- Bordes de 1 px `--edge`. La profundidad se marca con cristal y brillo, no con sombras grandes.

## Materiales

- **Cristal:** `background: var(--glass)`, `border: 1px solid var(--edge)`, `backdrop-filter: blur(26px) saturate(160%)` y un brillo superior interior (`inset 0 1px 0 rgb(255 255 255 / .06)`). El menú usa más blur (22 px), fondo `rgb(16 18 30 / .58)` y sombra `0 10px 40px rgb(0 0 0 / .35)`.
- **Borde iluminado:** en hover, la tarjeta pinta un borde de 1 px con un degradado radial de 260 px centrado en el cursor (variables `--mx` y `--my`), del color de su acento (`--glow`).
- Con `prefers-reduced-transparency: reduce`: superficies sólidas `#10121c` sin blur.

## Componentes

| Componente | Descripción | Interacción |
|---|---|---|
| `NavBar` | Píldora de cristal flotante centrada arriba: logo «LD» en degradado, enlaces, separador, selector ES/EN y botón «Contacto» blanco | Un resaltado se **desliza** entre enlaces al pasar el cursor (0,45 s, sin rebote); el enlace de la sección visible queda marcado (*scrollspy*). Contacto se hunde al pulsar. En < 980 px los enlaces se cambian por un botón de menú. |
| `StatusPill` | Píldora de cristal con punto `--mint` que late (pulso de 2,4 s) | — |
| `Button` | `primary` (fondo `--fg`, texto oscuro) y `glass` | Pulsar: escala .97. Hover: primario con halo índigo y flecha que avanza 3 px; cristal con icono que baja 2 px. |
| `SocialIcon` | Círculo de **44 px** (la maqueta usa 42) con icono de 18 px | Hover: sube 3 px, se rellena **de abajo arriba** con el color de la red (GitHub gris → violeta, LinkedIn azul, email coral → violeta), el icono gira −6° y aparece una etiqueta. El de email copia la dirección. |
| `Card` | Base de todas las tarjetas: radio 24 px, padding 22 px, cristal y borde iluminado | Hover: sube 3 px. |
| `BentoFeatured` | Tarjeta ancha con brillo azul/violeta, texto y miniatura de la app | La miniatura sube y gira −1°; la flecha «Ver caso de estudio» se va en diagonal. |
| `BentoStack` | Fondo mate `#0c0e18` con rejilla de puntos; chips con punto del color de cada tecnología | Chip: sube 2 px y el borde toma su color. |
| `BentoGithub` | Fondo con tinte verde, contador y mapa de contribuciones con la **escala de verdes de GitHub** y leyenda «Menos / Más» | Datos reales de la API ([03](03-arquitectura.md#github)). |
| `BentoEducation` | Cristal con brillo ámbar, icono en degradado ámbar → coral, título y píldora «En curso» | — |
| `BentoClock` | Reloj **analógico** (horas, minutos y segundero coral) + hora digital mono. Fondo de **cielo de día** (7–19 h: azul → violeta) o **de noche** (violeta oscuro con estrellas) | Usa la zona horaria de `profile.json`. |
| `SectionHead` | Eyebrow mono con punto de color + `h2` + enlace «Ver más» a la derecha | La flecha avanza 4 px en hover. |
| `ValueCard` | Icono cuadrado con el acento al 18 % + título + texto | — |
| `ProjectCard` | Miniatura 16:10 (imagen o maqueta abstracta sobre degradado de dos colores) + tipo en mono del color + título + resumen + tags. La tarjeta grande ocupa dos filas. | La imagen hace zoom 1,04. |
| `TimelineItem` | Línea vertical en degradado ámbar → violeta; nodo de 14 px con borde y brillo del color de la entrada; fechas en mono a la derecha; píldora «Actual» en `--mint` | — |
| `SkillArea` | Icono + título; chips con tres estilos: **relleno** (a diario), **borde** (con experiencia) y **discontinuo** (aprendiendo), más una leyenda en la cabecera de la sección | Chip: sube 2 px. |
| `EducationCard` | Universidad con brillo ámbar/coral y **barra de avance** en degradado; listas de certificaciones y logros con insignias de color | — |
| `PostCard` | Portada 16:9 en degradado (o imagen) con palabra grande en `overlay` e icono; fecha y minutos en mono; título y extracto | El icono de la portada gira −12°. |
| `ContactPanel` | Caja grande de cristal con brillos en dos esquinas: texto + accesos directos (email que se copia, LinkedIn, GitHub) + formulario | Acceso: se desplaza 4 px a la derecha y el borde toma su color. Campos: borde índigo y halo al enfocar. |
| `Footer` | Cristal oscuro: marca, tres columnas de enlaces, línea de copyright | — |

## De la maqueta a los componentes

| Bloque de `design/home.html` | Componente / archivo | Datos |
|---|---|---|
| `.ambient` | `components/layout/Ambient.tsx` (cliente: luz del cursor) | — |
| `.nav-wrap` | `components/layout/NavBar.tsx` (cliente) | `site.json → nav, navCta` |
| `HERO` (texto) | `components/sections/Hero.tsx` | `profile.json`, `home.json → hero` |
| `HERO` (`.bento`) | `components/sections/hero/Bento*.tsx` | `home.json → hero.bento`, `skills.json → featured`, `education.json`, `profile.json → location` |
| `SOBRE MÍ` | `components/sections/About.tsx` | `home.json → about` |
| `PROYECTOS` | `components/sections/FeaturedProjects.tsx` + `ui/ProjectCard.tsx` | `content/projects/*` (`featured`) |
| `EXPERIENCIA` | `components/sections/Experience.tsx` + `ui/TimelineItem.tsx` | `experience.json` |
| `HABILIDADES` | `components/sections/Skills.tsx` | `skills.json → areas` |
| `FORMACIÓN Y LOGROS` | `components/sections/Education.tsx` | `education.json` |
| `BLOG` | `components/sections/LatestPosts.tsx` + `ui/PostCard.tsx` | `content/blog/*` |
| `CONTACTO` | `components/sections/Contact.tsx` + `ContactForm.tsx` (cliente) | `home.json → contact`, `profile.json` |
| `PIE` | `components/layout/Footer.tsx` | `site.json → footer`, `profile.json → socials` |

## Movimiento

Curva base `--spring: cubic-bezier(.22, 1, .36, 1)`: críticamente amortiguada, sin rebote (Apple Design).

| Momento | Animación | Duración / retardo |
|---|---|---|
| Entrada del menú | Baja 14 px + escala .96 → 1 + fundido | .9 s |
| Entrada del texto del hero | Sube 18 px + desenfoque 8 px → 0 + fundido | .9 s, escalonado 70 ms desde 150 ms |
| Entrada de las tarjetas del bento | Sube 16 px + escala .96 + desenfoque 6 px | .9 s, escalonado 80 ms desde 500 ms |
| Secciones al hacer scroll | Sube 48 px + escala .97 + desenfoque 6 px, de opacidad .15 a 1 | Ligado al scroll (`animation-timeline: view()`, rango `entry 0% → cover 30%`). Sin soporte, el contenido se ve sin animación. |
| Hover de tarjetas, iconos y chips | Desplazamientos de 2–4 px, rellenos y giros | .35–.5 s con `--spring` |
| Pulsar | Escala .94–.97 | .1–.12 s `ease-out` |
| Resaltado del menú | `left` y `width` | .45 s `--spring` |
| Ambiente | Manchas que derivan; degradado del rol que se desliza (6 s ida y vuelta); punto de estado que late (2,4 s) | Bucles lentos |

- Solo se animan `transform`, `opacity` y `filter` (nada que provoque *reflow*).
- **`prefers-reduced-motion`:** sin animaciones de entrada, ambiente ni scroll suave; las interacciones cambian al instante.

### Transición intro → Home

Tras la pausa de ~1 s, la intro se despide sola con la **caída** ([05 · Robot 3D](05-robot-3d.md#salida-opciones)) y en la misma pantalla el Home hace su entrada normal (tabla de arriba), empezando a mitad de la despedida. En visitas sin intro, el Home hace la misma entrada al cargar.

## Iconografía e imágenes

- **Lucide** (`lucide-react`): trazo 1,8–2 px, `currentColor`. Los logos de marca (GitHub, LinkedIn) en SVG propio.
- Portadas de proyectos en 16:10 y de artículos en 16:9, con `next/image` (AVIF/WebP, `sizes`, desenfoque de carga).
- Diagramas de arquitectura en SVG con los colores de los tokens.

## Accesibilidad visual

- Foco visible: anillo de 2 px `--blue` con separación de 3 px.
- Áreas táctiles de 44 × 44 px como mínimo.
- Los niveles de habilidad tienen leyenda en texto, no solo estilo.
- Enlaces dentro de párrafos, subrayados.

## Robot (solo intro)

Ojos LED con degradado azul → violeta por filas, líneas de luz de azul (cabeza) a violeta (cintura), contornos azul y violeta. La 404 usa los ojos en 2D con la expresión `surprised`. Detalle en [05 · Robot 3D](05-robot-3d.md).
