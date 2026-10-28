# 05 · Robot 3D

El robot es la firma del portafolio. Se modela, se riggea y se anima en **Blender** con scripts reproducibles, se exporta a **glTF (.glb) con Draco** y se muestra en la web con **Three.js + GSAP**.

> Las animaciones del robot (gestos, agarrar, soltar, barrer) se hacen **en Blender**, no se generan en la web. La web solo reproduce los clips, mueve la cámara y la mirada, y sincroniza la interfaz con los eventos de cada clip.

## Pipeline

```
blender/build_*.py ──► blender/robot.blend ──► blender/export_glb.py ──► public/models/robot.glb ──► src/three/robot.ts
   (modelado, rig,          (fuente)              (Blender en 2.º plano,        (~0,8 MB, Draco)            (Three.js)
    animaciones)                                   une mallas, Draco)
```

| Script | Qué hace |
|---|---|
| `robot_utils.py` | Utilidades y cotas compartidas (`ARM`, `LEG`) |
| `build_head.py`, `build_torso.py`, `build_waist.py`, `build_arms.py`, `build_legs.py` | Piezas con nombre. Brazos y piernas se modelan del lado `_L` y se espejan a `_R`. |
| `build_details.py` | Placas, costuras, tornillos, pistones, mangueras, tapas (propiedad `detail`) |
| `build_rig.py` | Armature `Robot_Rig` con huesos `B_*`, piezas rígidas colgadas de su hueso y acciones a 30 fps. Ejecuta `build_intro.py`. |
| `build_intro.py` | Clips `Intro` e `Intro_Sweep` con IK analítica hacia `B_Grip_L/R` y eventos |
| `build_all.py` | Ejecuta todo en orden y guarda `blender/robot.blend` |
| `export_glb.py` | Une las piezas por (hueso, material) y exporta con Draco |
| `render_showreel.py` | Render de video con los gestos (`renders/`) |

Para exportar (Blender 5.1):

```bash
blender -b blender/robot.blend -P blender/export_glb.py
```

### Contenido del .glb

- **Mallas** por hueso y material: `<Hueso>`, `<Hueso>_Neon`, `_Metal`, `_Plate`, `_Steel`, `_Cable`, `_Visor`. Aparte quedan `Eye_L/R` y los pistones (`*PistonSleeve_L/R`, `*PistonRod_L/R`), que se reorientan cada frame con `lookAt`.
- **Materiales**: cuerpo negro mate, visor negro espejo, articulaciones gris metálico y líneas de luz emisivas (cian en Blender; la web las recolorea de azul en la cabeza a violeta en la cintura) encendidas por regiones: `Head, Neck, Chest, Spine, Hips, UpperArm, Forearm, Thigh, Shin, Foot`.
- **Clips** (30 fps):

| Clip | Uso en la web |
|---|---|
| `Intro` (6,8 s) | Despierta, atrapa 3 gemas y las suelta delante del pecho |
| `Intro_Sweep` (2,1 s) | Barre el bloque del Hero hacia la izquierda con el brazo izquierdo |
| `Discover` | Sin uso por ahora (mostraba el cuerpo entero; las piernas ya no se ven) |
| `Idle` (cíclico) | Reposo |
| `LookAround` | Aburrimiento (inactividad) |
| `Wave` | Clic en el robot |
| `Stretch` | Gesto ocasional en reposo |
| `WakeUp` | Despertar alternativo (sin gemas) |
| `Blink` | Solo ojos, se combina con cualquier clip |

- **Eventos**: los momentos clave (`grab_icons`, `release_icons`, `grab_title`, `release_title`, `grab_url`, `release_url`, `sweep`…) se guardan en la propiedad `events` de la acción y llegan como `extras` del glTF. `Robot.play(name, { events })` los dispara en su frame.
- **Cámara** `Cam_Intro`: referencia del encuadre del Hero (teleobjetivo, fov 25).

### Presupuesto

- `.glb` < 3 MB (hoy ~0,8 MB). Hay que revisarlo en cada exportación.
- Decodificadores Draco servidos desde `/draco/` (copiados en `postinstall`).

## Clases en la web (`src/three/`)

| Archivo | Responsabilidad |
|---|---|
| `robot.ts` | Carga (Draco), mixer, `play`/`enqueue` de gestos con eventos, `pose`, `startIdle`, `gripPosition`, mirada al cursor sobre `B_Neck`/`B_Head`, parpadeo, expresiones, neón por regiones, pistones, `hitTest`. Los huesos que se giran a mano se reinician a su pose base cada frame, porque algunos clips no traen pista de todos los huesos. |
| `eyes.ts` | Patrones LED 10×6 (`normal`, `happy`, `focus`, `surprised`, `love`, `bored`, `off`) dibujados en un `CanvasTexture` |
| `intro.ts` | Gemas de luz (`PointLight` + sprites), anclaje del bloque del Hero a `ANCHOR`, vuelo de la gema hasta su componente, estallido, aparición y barrido |
| `stage.ts` | Renderer, entorno, luces (contorno aparte), halo, suelo, bloom, planos de cámara (`SHOTS`), estado animable (`state`), bucle de render, redimensionado |
| `introSequence.ts` | Orquestación: `runIntro`, `sweepIntro`, `finishIntro`, `skipIntro` |
| `scrollFade.ts` | Timeline de ScrollTrigger que desvanece el Hero y el robot al bajar |

Se migran desde el prototipo (`src/robot.js`, `src/eyes.js`, `src/intro.js`, `src/main.js`) **sin cambiar la lógica**. Primero en JS (`allowJs`) y después se tipan.

## Integración de la intro

### Componentes de React

```
app/[locale]/page.tsx (servidor)
├─ <RobotLoader />          HTML/CSS: pantalla negra + ojos LED + % de carga
├─ <RobotStage />           cliente, next/dynamic con ssr:false: <canvas> fijo + escena
├─ <SkipIntro />            cliente: botón "Saltar intro"
├─ <Hero />                 servidor: enlaces, nombre y rol (traducidos) en el HTML
├─ <section id="intro" />   espacio de scroll en el que se desvanecen Hero y robot (100vh)
└─ <About /> <FeaturedProjects /> … <Contact />
```

`RobotStage` crea la escena en un `useEffect` y devuelve una función que la libera: mata los tweens y ScrollTriggers (con `gsap.context`), detiene el bucle, quita listeners y llama a `dispose()` de geometrías, materiales, texturas y renderer. Así no hay fugas al navegar a otra página ni con el doble montaje de React en desarrollo.

El robot **solo vive en la portada**. Las demás páginas no cargan Three.js. La 404 usa los ojos LED en 2D (`surprised`), sin cargar el modelo.

### El Hero en el HTML

El bloque del Hero tiene tres piezas (`data-part`), en el orden en que llegan las gemas:

| `data-part` | Gema | Contenido |
|---|---|---|
| `links` | 1 · mano der. (`grab_icons`) | GitHub, LinkedIn, CV: `<a>` reales con `aria-label` |
| `name` | 2 · mano izq. (`grab_title`) | Kicker "Hola, soy" / "Hi, I'm" + nombre completo (`<h1>`) |
| `role` | 3 · mano der. (`grab_url`) | "Full Stack Developer · Estudiante de Ing. de Sistemas" |

Los nombres de los eventos del clip se mantienen. `introSequence.ts` traduce `icons → links`, `title → name` y `url → role`, así que no hace falta reexportar desde Blender.

**Sin parpadeo inicial ni contenido perdido:** un script mínimo en `<head>` (antes del primer pintado) decide si se reproduce la intro y pone `data-intro="play"` en `<html>`. Solo con ese atributo el CSS oculta las piezas del Hero. Sin JS, con `prefers-reduced-motion`, sin WebGL o en visitas repetidas, el Hero se ve desde el primer pintado.

### Coreografía

| # | Momento | Qué pasa |
|---|---|---|
| 1 | **Carga** | Pantalla negra con los ojos LED y el %. El scroll está bloqueado (`lenis.stop()` + `overflow: hidden`). "Saltar intro" ya está disponible. |
| 2 | **Despertar** | Plano `eyes`: los ojos se encienden con un parpadeo de arranque y empieza `Intro`, que se pausa justo antes de estirar el brazo. |
| 3 | **Silueta** | La cámara se aleja al plano `hero` (fov 25): solo luz de contorno + halo. |
| 4 | **Gemas** | Sigue `Intro`. En cada `grab_*` se enciende una gema en `B_Grip_*`, y en cada `release_*` vuela hasta su pieza, estalla y la pieza se materializa. El bloque está centrado delante del pecho (`ANCHOR`). |
| 5 | **Lectura** | 2,4 s quieto con el Hero completo. |
| 6 | **Barrido → Hero** | `Intro_Sweep`. En el evento `sweep`, las piezas **no salen de pantalla**: se deslizan (técnica FLIP, con la inclinación y el desenfoque actuales, pero acotados) hasta su sitio definitivo en la **columna izquierda** del Hero. A la vez, la cámara pasa al plano `heroAside` (robot en el tercio derecho). |
| 7 | **Se ilumina** | Suben luz y líneas (`light: 0.4`, `neon: 1`), la mirada sigue al cursor, aparecen la frase de valor, el estado y el aviso "desliza". Se desbloquea el scroll. |

Duración total: ≈ 10 s.

**Detalle del paso 6:** el bloque de la intro está posicionado en absoluto (anclado al pecho). La columna izquierda del Hero tiene huecos reservados con el mismo tamaño que cada pieza, así que el layout final no salta. Al barrer, se mide el hueco de cada pieza (`getBoundingClientRect`), se anima la pieza hasta él y, al terminar, se devuelve al flujo normal (`position: static`) y se limpian los `transform`.

### Saltar intro y visitas repetidas

- **"Saltar intro"** (y la tecla `Esc`) mata la timeline. El robot queda en `Idle` y la cámara en `heroAside`, las piezas en su sitio, las luces encendidas y el scroll desbloqueado. Si el modelo aún no ha cargado, la portada se muestra armada y el robot aparece con un fundido al cargar.
- **Primera visita de la sesión**: intro completa. Después se guarda `sessionStorage['intro-seen']` (con `try/catch`), y en las siguientes visitas de la sesión la portada aparece armada, igual que al saltar.
- **`prefers-reduced-motion`**: sin intro; al bajar, Hero y robot solo se desvanecen (sin desplazarse). Portada armada, robot en `Idle` estático sin seguimiento del cursor ni gestos automáticos.

### Solo de la cintura para arriba

Las piernas no se muestran nunca: `robot.ts` oculta las mallas de `B_Thigh/Shin/Foot`, y un degradado al color de fondo (`.stage-fade`, dentro del escenario) funde al robot desde la cintura (`WAIST_FADE`, alturas en metros proyectadas a la pantalla cada frame).

### Salida con scroll (el robot solo vive en la intro)

Timeline de ScrollTrigger con `scrub` sobre `#intro` (100vh): el Hero sube un poco y se desvanece; justo después, el escenario 3D (robot + degradado) hace lo mismo. Con el escenario transparente se deja de renderizar. Después empieza "Sobre mí".

### Interacción

- **Mirada**: cabeza y cuello siguen el cursor; en móvil, el giroscopio (`deviceorientation`, pidiendo permiso en iOS al primer toque).
- **Clic** en el robot (raycast con `hitTest`): `Wave` + ojos `happy`. Se ignora durante la intro o si el clic cae en un enlace o botón.
- **Inactividad** de más de 20 s: ojos `bored` + `LookAround`.

## Rendimiento y respaldos

- Pixel ratio máximo de 2 (1,5 en móvil) y bloom a media resolución en móvil.
- El bucle de render se pausa con la pestaña oculta y cuando el canvas no aporta (por ejemplo, con el robot fuera del encuadre).
- `renderer.compile` antes de empezar, para evitar tirones en el primer frame.
- **Sin WebGL o si falla la carga del modelo**: imagen fija del robot (`public/images/robot-poster.avif`, renderizada desde Blender) y la portada armada. Los errores se registran, pero nunca bloquean el contenido.
- El `.glb` se precarga con `<link rel="preload" as="fetch" crossorigin>` solo en la portada.

## Depuración

En desarrollo, `window.__intro` expone `robot`, `camera`, `state`, `scene` e `intro`.
