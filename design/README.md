# design/ · Maquetas de referencia

Maquetas HTML **aprobadas por el usuario**. Son la referencia visual del sitio: al programar en Next.js hay que reproducirlas fielmente (colores, tipografía, espaciados, animaciones e interacciones). Son archivos autocontenidos (HTML + CSS + JS, sin dependencias); no forman parte del build.

| Archivo | Qué es | Estado |
|---|---|---|
| [`home.html`](home.html) | **Home completo**: menú de cristal, hero con bento, Sobre mí, Proyectos, Experiencia, Habilidades, Formación y logros, Blog, Contacto y pie | ✅ Aprobado (2026-10-28). **Fuente de verdad visual.** |
| [`exploracion-estilos.html`](exploracion-estilos.html) | Comparación de seis skills de diseño con un Home de ejemplo cada una | Histórico. Se eligió **Apple Design + UI/UX Pro Max** |

También están publicadas como artefactos privados de claude.ai (requieren iniciar sesión, así que **la copia local es la que manda**):
- Home: https://claude.ai/artifact/VHgS2o8SBiJTNiYA1jH8S3
- Exploración: https://claude.ai/artifact/V9nDcvUairinQpi4e2ag2K

## Cómo verlas

- Doble clic en el archivo (se abre en el navegador), o
- con `npm run design` (Vite sirve esta carpeta): http://localhost:5175/home.html

## Cómo usarlas al programar

1. **Tokens:** el bloque `:root` de `home.html` es el origen de los tokens de [`docs/04-diseno.md`](../docs/04-diseno.md). Si hay diferencias, gana la maqueta; actualiza el documento.
2. **Componentes:** cada bloque comentado (`<!-- === HERO -->`, `SOBRE MÍ`, …) se convierte en un componente de `src/components/sections/`. La tabla de correspondencias está en [`docs/04-diseno.md`](../docs/04-diseno.md#de-la-maqueta-a-los-componentes).
3. **Datos:** los textos de la maqueta son de relleno. En la web vienen de `content/` (JSON + MDX); ver [`docs/07-datos.md`](../docs/07-datos.md). Lo marcado como «ejemplo» o entre corchetes no se copia.
4. **Comportamiento:** el `<script>` del final documenta las interacciones (resaltado del menú, sección activa, luz que sigue al cursor, borde iluminado de tarjetas, reloj, copiar email, validación del formulario). Se reimplementan como hooks o componentes cliente.
5. **Comparar:** al terminar cada sección, abrir la maqueta y la web lado a lado a 1440 px, 1024 px y 390 px de ancho.

## Qué no está en la maqueta

- La **intro del robot** (va antes del Home, solo en la primera visita): ver [`docs/05-robot-3d.md`](../docs/05-robot-3d.md) y el prototipo en `prototype/`.
- Las **páginas interiores** (`/proyectos`, caso de estudio, `/blog`, artículo, `/sobre-mi`, `/cv`, 404): se diseñarán con el mismo lenguaje visual cuando lleguen sus fases.
- El **menú móvil desplegable**: en la maqueta solo está el botón.
