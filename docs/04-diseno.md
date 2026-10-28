# 04 · Diseño

La identidad visual sale del robot: **negro mate, luz azul → violeta en degradados y precisión mecánica**. Profesional y minimalista: varios tonos combinados, nunca un solo color plano ni efecto neón.

## Principios

1. **El contenido manda.** El robot es la firma, no un obstáculo: nada tapa el nombre, los enlaces ni el texto.
2. **El brillo se gana.** El color se usa para acentos (enlaces, foco, estados activos, datos clave). Si todo brilla, nada destaca.
3. **Precisión.** Rejilla estricta, alineaciones limpias, detalles monoespaciados como etiquetas de ingeniería.
4. **Movimiento con propósito.** Cada animación explica algo (aparición, jerarquía, cambio de estado) y respeta `prefers-reduced-motion`.
5. **Legible primero.** Contraste AA como mínimo y textos largos (casos de estudio, blog) cómodos de leer.

## Color

Tema **oscuro** como identidad. Los tokens se definen en `src/styles/tokens.css` y se exponen a Tailwind con `@theme`.

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#05060a` | Fondo de página (el mismo que la escena 3D) |
| `--color-surface` | `#0a0d10` | Tarjetas, bloques de código |
| `--color-surface-2` | `#11161a` | Hover de tarjetas, inputs |
| `--color-border` | `#1b2328` | Bordes y separadores |
| `--color-text` | `#e7eaf3` | Texto principal |
| `--color-text-muted` | `#9aa3b8` | Texto secundario, metadatos |
| `--color-blue` | `#5b8cff` | Azul: enlaces, foco, inicio de los degradados |
| `--color-indigo` | `#7a7cff` | Índigo: tono intermedio, rol del Hero |
| `--color-violet` | `#a46bff` | Violeta: final de los degradados, acentos secundarios |
| `--gradient` | `linear-gradient(100deg, blue, indigo, violet)` | Bordes y detalles destacados |
| `--color-accent-soft` | `rgb(110 120 255 / 0.12)` | Fondos de etiquetas, selección |
| `--color-success` | `#3ddc97` | Formulario enviado, "Abierto a oportunidades" |
| `--color-danger` | `#ff5c7a` | Errores |
| `--gradient-title` | `linear-gradient(100deg, #eef1ff, #a9bcff 35%, #8f86ff 68%, #b98cff)` | Nombre en el Hero y títulos principales |
| `--glow-accent` | `0 0 24px rgb(110 110 255 / 0.12)` | Halo muy sutil de iconos y botones |

Contraste sobre `--color-bg`: el texto principal y el acento superan 12:1, y el texto secundario ~7:1 (AA en todos los tamaños). Nunca se pone texto de color sobre fondos claros del mismo tono.

El **tema claro** queda fuera del lanzamiento. Los tokens están pensados para añadirlo después (`[data-theme="light"]`). El CV impreso sí usa una variante clara propia (`print.css`).

## Tipografía

Con `next/font` (autoalojadas, sin peticiones a Google en tiempo de ejecución).

| Rol | Fuente | Uso |
|---|---|---|
| Texto y títulos | **Inter** (variable) | Todo el contenido |
| Técnica / etiquetas | **JetBrains Mono** | Fechas, etiquetas de stack, kicker del Hero, código, números |

Escala fluida (`clamp`), base 16 px en móvil y 18 px en escritorio:

| Token | Tamaño aprox. (móvil → escritorio) | Uso |
|---|---|---|
| `display` | 40 → 72 px, peso 600, tracking −0.02em | Nombre en el Hero |
| `h1` | 32 → 48 px | Título de página |
| `h2` | 26 → 34 px | Secciones |
| `h3` | 20 → 24 px | Subsecciones, títulos de tarjeta |
| `body` | 16 → 18 px, interlineado 1.65 | Texto |
| `small` | 14 px | Metadatos |
| `mono-label` | 12–13 px, mayúsculas, tracking +0.08em | Etiquetas, kicker |

Ancho de lectura de artículos y casos de estudio: **68ch** como máximo.

## Espaciado, rejilla y forma

- Escala de espaciado de base 4 px (la de Tailwind). Secciones separadas por 96–160 px en escritorio y 64–96 px en móvil.
- Contenedor de 1200 px como máximo y 12 columnas en escritorio. Márgenes laterales de 16 px en móvil, 32 px en tablet y 48 px en escritorio. Nunca hay scroll horizontal.
- **Portada con el robot:** contenido en las columnas 1–6 y robot en el tercio derecho (escritorio). En móvil el robot queda detrás del contenido, atenuado, y el contenido ocupa todo el ancho.
- Radios: 6 px (etiquetas, inputs), 10 px (botones), 16 px (tarjetas).
- Bordes finos (1 px). La profundidad se marca con superficies y brillo, no con sombras grandes.

## Componentes base (`src/components/ui`)

| Componente | Notas |
|---|---|
| `Button` | Variantes `primary` (borde en degradado azul → violeta, halo sutil en hover), `ghost` y `link`. Tamaños `sm`/`md`. Siempre con foco visible. |
| `IconLink` | Iconos del Hero (GitHub, LinkedIn, CV), con el estilo actual de `.hero-icon`: círculo con borde fino lavanda y fondo casi transparente. Tienen `aria-label`. |
| `Tag` | Etiqueta monoespaciada para el stack, con fondo `accent-soft` |
| `Card` | Superficie + borde. En hover sube 2 px y el borde se ilumina. Puede contener una imagen. |
| `Section` | Encabezado con número y kicker monoespaciado (`02 — Proyectos`) + título |
| `Timeline` | Línea vertical con nodos que se iluminan en degradado al entrar en pantalla |
| `SkillGroup` | Lista por área con indicador de nivel de 3 estados (no porcentaje) |
| `StatusBadge` | Punto verde pulsante + "Abierto a oportunidades" |
| `Prose` | Estilos de MDX: títulos, listas, citas, tablas, código (Shiki, tema oscuro a juego), figuras |
| `Callout`, `Figure`, `Diagram` | Componentes para MDX |

## Iconografía e imágenes

- Iconos de línea (estilo Lucide, trazo 1.5–2 px, `currentColor`). Los de marca (GitHub, LinkedIn) en SVG propio.
- Portadas de proyectos en 16:10, con `next/image` (AVIF/WebP, `sizes` correctos) y fondo oscuro coherente.
- Diagramas de arquitectura en SVG, con los colores de los tokens para que se lean bien en el tema oscuro.

## Movimiento

| Tipo | Duración | Curva |
|---|---|---|
| Hover / foco | 150–200 ms | `ease-out` |
| Aparición de elementos al hacer scroll | 400–600 ms, escalonado de 60 ms | `power2.out` |
| Transiciones de cámara del robot | 1.2–1.6 s | `power1/2.inOut` |
| Intro completa | ≤ 10 s, con "Saltar intro" | Ver [05](05-robot-3d.md) |

- Las animaciones de interfaz usan transform y opacity (nada que provoque reflow).
- Lenis da el scroll suave; los anclajes y el teclado siguen funcionando.
- Con **`prefers-reduced-motion`**: sin intro ni parallax ni scroll suave. La portada aparece armada y los elementos se muestran sin desplazamiento (fundido de 150 ms como máximo).

## Ojos del robot

El robot solo aparece en la intro. Sus ojos LED (degradado azul → violeta) usan `normal` durante la intro y `happy` al hacer clic (con el gesto `Wave`). La 404 usa los ojos en 2D con `surprised`.

## Accesibilidad visual

- Foco visible en todo elemento interactivo: anillo de 2 px `--color-accent` con separación de 2 px.
- Áreas táctiles de 44×44 px como mínimo.
- Ningún contenido depende solo del color (los niveles de habilidad llevan texto).
- Enlaces del texto subrayados, no solo en color.

## Referencias de estilo

- Prototipo actual de la intro (`src/style.css`): de ahí salen el estilo de `.hero-icon`, el degradado del título y el color del rol.
- `referencias/`: imágenes del robot. `renders/`: videos de la intro y el showreel.
