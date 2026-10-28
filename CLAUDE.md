# Portafolio de Luis Daniel

El usuario habla español: **responde siempre en español**.

Portafolio personal de un **desarrollador full stack y estudiante de Ingeniería de Sistemas**, para postular a empleos (no para conseguir clientes; eso lo hace su otra web, Dietrim). Bilingüe ES/EN. Empieza con una intro 3D de un robot hecho en Blender y sigue con un Home de estilo Apple + bento.

## Reglas de trabajo (obligatorias)

1. **No implementar sin permiso.** Ante una idea o petición nueva: proponer un plan o preguntas y **esperar el «empieza»** del usuario. Se programa **por fases** ([`docs/roadmap.md`](docs/roadmap.md)), una a la vez, siguiendo «Cómo trabajar cada fase».
2. **Leer antes de tocar:** este archivo, el documento de `docs/` que corresponda y, si hay interfaz, [`design/home.html`](design/home.html).
3. **El diseño es la maqueta.** `design/home.html` es la fuente de verdad visual del Home (aprobada). Reprodúcela fielmente y compárala en el navegador a 1440, 1024 y 390 px. Las páginas sin maqueta se diseñan primero (maqueta en `design/` + aprobación) y se programan después.
4. **Los datos van en `content/`** (JSON + MDX), nunca escritos en los componentes ([`docs/07-datos.md`](docs/07-datos.md)). Lo que falta va como `[pendiente]` o borrador: **no inventes datos personales**.
5. **Las animaciones del robot se hacen en Blender** (scripts de `blender/`), no se generan en la web.
6. **Verificar siempre:** `npm run check` en verde y, si hay interfaz, revisión en el navegador (`.claude/launch.json`). Informar con honestidad de lo que no se pudo verificar.
7. **Documentar los cambios:** si cambia una decisión, actualizar `docs/` y, si es de arquitectura, escribir un ADR nuevo en `docs/adr/`.
8. Commits en español con estilo convencional (`feat:`, `fix:`, `docs:`…), uno por paso verificado, en una rama por fase. **Sin la línea `Co-Authored-By: Claude`** ni otra atribución a Claude, en commits y PRs: deben aparecer solo a nombre del usuario (Luis Daniel), que es el autor configurado en git.

## Fuentes de verdad

| Tema | Dónde |
|---|---|
| Objetivo, público, criterios de éxito | [`docs/01-vision.md`](docs/01-vision.md) |
| Mapa del sitio, secciones, datos pendientes | [`docs/02-contenido.md`](docs/02-contenido.md) |
| Stack, carpetas, rutas, backend, scripts | [`docs/03-arquitectura.md`](docs/03-arquitectura.md) |
| Tokens, componentes, movimiento | [`docs/04-diseno.md`](docs/04-diseno.md) + [`design/home.html`](design/home.html) |
| Robot: Blender → glTF → web, intro | [`docs/05-robot-3d.md`](docs/05-robot-3d.md) |
| Rendimiento, accesibilidad, SEO, pruebas | [`docs/06-calidad.md`](docs/06-calidad.md) |
| Contenido editable (JSON + MDX) | [`docs/07-datos.md`](docs/07-datos.md) |
| Fases y tareas | [`docs/roadmap.md`](docs/roadmap.md) |
| Decisiones | [`docs/adr/`](docs/adr/) |

## Estado actual (2026-10-28)

- **Fase 0 terminada:** documentación completa y Home diseñado y aprobado (`design/home.html`).
- **Siguiente:** fase 1 (base Next.js), cuando el usuario diga «empieza».
- **Código actual:** solo el **prototipo de la intro** en Vite + Three.js (`index.html`, `vite.config.js`, `src/*.js`; `npm run dev` → http://localhost:5173). En la fase 1 se mueve a `prototype/` y la raíz pasa a ser la app Next.js.
- Rama de trabajo actual: `rediseno-intro` (aún sin fusionar con `main`).

## Decisiones del usuario que no hay que olvidar

- **Stack:** Next.js + React + TypeScript, Tailwind v4, next-intl (ES en `/`, EN en `/en`), JSON + MDX con Velite, Resend + Upstash, Vercel. Blog desde el lanzamiento.
- **Sitio híbrido:** Home largo con todas las secciones + páginas propias para proyectos, casos de estudio, blog, sobre mí y CV. Contacto es una sección, no una página.
- **Diseño:** Apple Design + bento (UI/UX Pro Max). **Índigo/violeta dominante** sobre casi negro, con algunos acentos de color con significado (verde GitHub, ámbar, coral, cian); cada tarjeta con personalidad propia. Profesional y minimalista, sin efecto neón.
- **Hero:** nombre grande, «Desarrollador Full Stack» debajo, frase de valor, «Ver proyectos» / «Descargar CV», iconos redondos pequeños (GitHub, LinkedIn, email) con animación al pasar el cursor. La condición de estudiante va en el bento, no en el título.
- **Intro del robot:** solo en la primera visita de la sesión, con «Saltar intro». El robot se ve **de la cintura para arriba** (no le gustan las piernas: ocultas + degradado). Arma la tarjeta «Bienvenido a mi Portafolio Web», la barre a la izquierda, ~1 s de pausa y **se despide sola con una caída** (sin deslizar). En la misma pantalla entra el Home animado. **El robot solo existe en la intro.**
- **El Home nunca es estático:** animaciones de entrada, ambiente y microinteracciones.
- **Datos editables sin tocar código:** `content/*.json` y MDX. Agregar un proyecto = copiar una carpeta.

## Robot 3D (Blender)

Diseño original (inspirado en `referencias/5.jpg`, sin copiar ningún robot comercial): casco ovalado con visor negro espejo y **ojos de matriz LED** (10×6); cuello delgado con cables; torso en forma de escudo; cintura delgada; brazos por segmentos con pistones; manos con dedos articulados; piernas completas (ocultas en la web). Cuerpo negro mate, articulaciones gris metálico y líneas de luz emisivas (cian en Blender; la web las recolorea de azul a violeta).

- **Scripts reproducibles** en `blender/`: `build_head.py`, `build_torso.py`, `build_waist.py`, `build_arms.py`, `build_legs.py`, `build_details.py` (`build_all.py` los ejecuta y guarda `blender/robot.blend`). Cotas compartidas (`ARM`, `LEG`) en `robot_utils.py`. Brazos y piernas se modelan del lado `_L` y se espejan a `_R`. Los detalles llevan la propiedad `detail`; los pistones tienen camisa (`*Sleeve`, pieza superior) y vástago (`*Rod`, pieza inferior), que la web reorienta con `lookAt`.
- **Rig** (`build_rig.py`): armature `Robot_Rig` con huesos `B_*`; piezas rígidas colgadas de su hueso. Clips a 30 fps: `WakeUp`, `Discover`, `Idle` (cíclico), `LookAround`, `Wave`, `Stretch`, `Blink` (solo ojos), `Intro` (6,8 s) e `Intro_Sweep` (2,1 s), estos dos creados por `build_intro.py`. En `Intro`/`Intro_Sweep` los brazos van por IK analítica hacia `B_Grip_L/R` (pinza = `PINCH_ANGLES`/`PINCH_THUMB`), con curvas de interpolación cúbica monótona. Los momentos clave (`grab_*`, `release_*`, `sweep`) se guardan en la propiedad `events` de la acción y se exportan como `extras` del glTF. `Cam_Intro` es el encuadre de la web.
- **Exportar:** `blender -b blender/robot.blend -P blender/export_glb.py` → `public/models/robot.glb` (Draco, ~0,8 MB). Une las piezas por (hueso, material) en mallas `<Hueso>`, `_Neon`, `_Metal`, `_Plate`, `_Steel`, `_Cable` y `_Visor`; deja aparte `Eye_L/R` y los pistones.
- **Prototipo web** (`src/` hasta la fase 1, luego `prototype/src/`):
  - `robot.js`: carga Draco, mixer, `play`/`enqueue` con eventos del clip, mirada al cursor sobre `B_Neck`/`B_Head`, parpadeo, expresiones, líneas de luz por regiones (azul → violeta según la altura del hueso), pistones y piernas ocultas (`B_Thigh/Shin/Foot`). Los huesos que se giran a mano se reinician cada frame a su pose base. La mirada ignora proyecciones NaN (lienzo a 0 px).
  - `eyes.js`: patrones LED (`normal`, `happy`, `focus`, `surprised`, `love`, `bored`, `off`) en un `CanvasTexture`, con degradado por filas.
  - `intro.js`: gemas de luz (izquierda azul, derecha violeta), tarjeta anclada a `ANCHOR`, vuelo de cada gema a su pieza y barrido FLIP a la columna izquierda (`.is-settled`).
  - `main.js`: escena, luces (contorno azul/violeta), halo, bloom, degradado de la cintura (`WAIST_FADE`, `.stage-fade`), planos `eyes → hero → heroAside` y salida con scroll (provisional: en Next.js será la despedida automática). En desarrollo, `window.__intro` expone `robot`, `camera`, `state`, `scene` e `intro`.
- `prefers-reduced-motion`: sin intro.

## Entorno

Windows 11. Blender 5.1 (`C:\Program Files\Blender Foundation\Blender 5.1`). Servidor MCP `blender` disponible para trabajar en Blender en vivo. Skill `apple-design` instalada (guía de movimiento e interacción).
