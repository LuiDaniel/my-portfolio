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
| `Intro_Sweep` (2,1 s) | Barre la tarjeta de bienvenida hacia la izquierda con el brazo izquierdo |
| `Discover` | Sin uso por ahora (mostraba el cuerpo entero; las piernas ya no se ven) |
| `Idle` (cíclico) | Reposo durante la pausa (paso 7) |
| `LookAround`, `Wave`, `Stretch` | Sin uso por ahora (el robot ya no se queda en la página) |
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
| `intro.ts` | Gemas de luz (`PointLight` + sprites), anclaje de la tarjeta de bienvenida a `ANCHOR`, vuelo de la gema hasta su pieza, estallido, aparición, barrido y caída |
| `stage.ts` | Renderer, entorno, luces (contorno aparte), halo, degradado de la cintura, bloom, planos de cámara (`SHOTS`), estado animable (`state`), bucle de render, redimensionado |
| `introSequence.ts` | Orquestación: `runIntro`, `sweepIntro`, `pause`, `farewell` (despedida), `skipIntro`; avisa con `onDone` para que entre el Home |

Se migran desde el prototipo (`prototype/src/robot.js`, `eyes.js`, `intro.js` y `main.js`; antes de la fase 1 estaban en `src/`) **sin cambiar la lógica**. Primero se copian en JS (`allowJs`) y se comprueba que la intro es idéntica; después se tipan. Lo nuevo (pausa, despedida, entrada del Home) se escribe directamente en TypeScript.

## Integración de la intro

La intro es una **pantalla de bienvenida temporal**: el robot arma la tarjeta "Bienvenido a mi Portafolio Web", se queda un momento y luego **todo se despide solo, sin necesidad de deslizar**. En ese mismo lugar aparece el **Home** ([`design/home.html`](../design/home.html)), con animaciones de entrada y vida propia. El robot no vuelve a aparecer.

> Decisión del usuario (2026-10-28). Estilo de salida elegido: **caída** (ver [Salida: opciones](#salida-opciones)).

### Componentes de React

```
app/[locale]/layout.tsx     <NavBar /> (oculto mientras corre la intro), <Footer />
app/[locale]/page.tsx (servidor)
├─ <Hero />                 el hero de design/home.html, con datos de content/
├─ <About /> <FeaturedProjects /> … <Contact />   en el orden de home.json
└─ <IntroOverlay />         cliente, solo en la primera visita (y si site.json → intro.enabled): capa fija por encima de todo
   ├─ <RobotLoader />       HTML/CSS: pantalla negra + ojos LED + % de carga
   ├─ <RobotStage />        next/dynamic con ssr:false: <canvas> + escena
   ├─ <WelcomeCard />       iconos, "Bienvenido a mi Portafolio Web" y dominio (decorativo)
   └─ <SkipIntro />         botón "Saltar intro"
```

- El **Home es HTML del servidor** desde el primer byte: SEO, lectores de pantalla y LCP no dependen de la intro. Mientras la intro corre, el Home está oculto (`visibility: hidden`) y el scroll bloqueado.
- La intro es decorativa (`aria-hidden`, salvo el botón "Saltar intro"): el contenido real (nombre, rol, enlaces) está en el Home.
- Al terminar la salida, `IntroOverlay` se desmonta: `RobotStage` libera la escena (mata tweens, detiene el bucle, quita listeners y llama a `dispose()` de geometrías, materiales, texturas y renderer). Three.js deja de consumir GPU y memoria.
- Las demás páginas no cargan Three.js. La 404 usa los ojos LED en 2D (`surprised`).

**Sin parpadeo inicial:** un script mínimo en `<head>` (antes del primer pintado) decide si se reproduce la intro y pone `data-intro="play"` en `<html>`. Solo con ese atributo se monta la capa de la intro y se oculta el Home. Sin JS, con `prefers-reduced-motion`, sin WebGL o en visitas repetidas, el Home se ve desde el primer pintado.

### La tarjeta de bienvenida

Tres piezas (`data-part`) en el orden en que llegan las gemas. Los nombres de los eventos del clip (`grab_icons`, `grab_title`, `grab_url`…) no cambian, así que no hay que reexportar desde Blender.

Los textos salen de `site.json → intro` ([07 · Datos](07-datos.md#sitejson)).

| `data-part` | Gema | Contenido |
|---|---|---|
| `icons` | 1 · mano der., violeta | Iconos decorativos: código, perfil, GitHub |
| `title` | 2 · mano izq., azul | "Bienvenido a mi" + **Portafolio Web** (degradado blanco → azul → violeta) |
| `url` | 3 · mano der., violeta | Dominio del portafolio (`site.json → intro.url`) |

### Coreografía

| # | Momento | Duración | Qué pasa |
|---|---|---|---|
| 1 | **Carga** | lo que tarde | Pantalla negra con los ojos LED (azul → violeta) y el %. Scroll bloqueado. "Saltar intro" ya disponible. |
| 2 | **Despertar** | ~0,9 s | Plano `eyes`: los ojos se encienden con un parpadeo de arranque y empieza `Intro`, pausado justo antes de estirar el brazo. |
| 3 | **Silueta** | 1,5 s | La cámara se aleja al plano `hero` (fov 25): luz de contorno azul/violeta + halo. Robot de la cintura para arriba. |
| 4 | **Gemas** | ~6 s | En cada `grab_*` se enciende una gema en `B_Grip_*`; en cada `release_*` vuela a su pieza, estalla y la pieza se materializa delante del pecho (`ANCHOR`). |
| 5 | **Lectura** | 1,5 s | Tarjeta completa, quieta. |
| 6 | **Barrido** | ~2 s | `Intro_Sweep`: en el evento `sweep` las piezas salen despedidas y frenan en la columna izquierda (FLIP); la cámara pasa a `heroAside` (robot en el tercio derecho) y se encienden luces y líneas. |
| 7 | **Pausa** | ~1 s | El estado de la captura de referencia: tarjeta a la izquierda, robot iluminado a la derecha que sigue el cursor con la mirada. **Sin aviso "desliza"**: no hace falta hacer nada. |
| 8 | **Despedida** | ~1,2 s | Salida automática con **caída** (opción A, elegida): la tarjeta cae y se desvanece y el robot se apaga y se hunde en el fondo. |
| 9 | **Home** | ~1,4 s (empieza a mitad del paso 8) | En la misma pantalla entra el Home con su coreografía ([02 · Contenido](02-contenido.md#1-hero), [04 · Diseño](04-diseno.md#transición-intro--home)). Al terminar se desbloquea el scroll y aparece el aviso "desliza" hacia las secciones. |

Primera visita: el Home queda visible a los **≈ 12 s** (o al instante con "Saltar intro").

### Salida: opciones

**A · Caída — ELEGIDA.** Sobria, no caricaturesca:
- **Tarjeta:** cada pieza cae 40–60 px con gravedad (`power2.in`, 0,6 s), con un giro mínimo (≤ 3°), algo de desenfoque y fundido; escalonadas 80 ms, primero la de abajo (dominio), luego título e iconos.
- **Robot:** "se apaga": los ojos parpadean a `off`, las líneas de luz se apagan de la cintura hacia la cabeza (el encendido al revés), bajan luces y halo, y el escenario baja ~4vh mientras se desvanece (0,8 s).

**B · Disolución** (descartada). Todo sube un poco y se difumina (blur + fundido, 0,7 s) mientras el robot se apaga igual que en A.

**C · Rápida.** Fundido simple de todo en 0,5 s. Para `prefers-reduced-motion` se usa siempre esta.

### Saltar intro y visitas repetidas

- **"Saltar intro"** (y la tecla `Esc`): mata la timeline, hace la despedida corta (C) y entra el Home.
- **Primera visita de la sesión**: intro completa. Se guarda `sessionStorage['intro-seen']` (con `try/catch`). En las siguientes visitas de la sesión no hay intro: el Home aparece directamente **con su animación de entrada** (nunca estático).
- **`prefers-reduced-motion`**: sin intro; el Home aparece con un fundido corto, sin desplazamientos ni movimiento ambiental.

### Solo de la cintura para arriba

Las piernas no se muestran nunca: `robot.ts` oculta las mallas de `B_Thigh/Shin/Foot`, y un degradado al color de fondo (`.stage-fade`, dentro del escenario) funde al robot desde la cintura (`WAIST_FADE`, alturas en metros proyectadas a la pantalla cada frame).

### Interacción durante la intro

- **Mirada**: desde el barrido hasta la despedida, cabeza y cuello siguen el cursor; en móvil, el giroscopio (`deviceorientation`, pidiendo permiso en iOS al primer toque).
- El resto del tiempo el robot sigue el clip; no hay clic ni gestos de inactividad (el robot ya no se queda en la página).

### Implementación en Next.js (fase 5)

- `src/three/robot.js`, `eyes.js` e `intro.js` son copias del prototipo (solo cambian la ruta de Draco, `/draco/`, y el nodo raíz de la tarjeta, que ahora se pasa al constructor). `stage.js` y `introSequence.js` salen de `main.js`.
- `src/components/intro/IntroOverlay.tsx` + `intro.css`: capa fija (`#intro-overlay`) que solo se ve con `<html data-intro="play">`. Mientras está, el resto de la página tiene `visibility: hidden` y las animaciones de entrada del Home en pausa; al quitar el atributo, el Home entra con su coreografía.
- Pausa de 1 s tras el barrido, despedida con caída (0,6 s la tarjeta, 0,8 s el escenario) y el Home empieza a los 0,6 s de la despedida. «Saltar intro» o `Esc`: fundido de 0,5 s.
- Al terminar se llama a `dispose()` (bucle, listeners, geometrías, materiales, texturas, composer y contexto WebGL).

### El prototipo

El prototipo de Vite (`prototype/`) llegaba hasta el paso 7 con una salida con scroll. Se borró en la fase 9, cuando la intro de Next.js ya lo había superado; sigue en el historial de git.

## Rendimiento y respaldos

- Pixel ratio máximo de 2 (1,5 en móvil) y bloom a media resolución en móvil.
- El bucle de render se pausa con la pestaña oculta y se detiene del todo (con `dispose`) al terminar la intro.
- `renderer.compile` antes de empezar, para evitar tirones en el primer frame.
- **Sin WebGL o si falla la carga del modelo**: sin intro: el Home aparece directamente con su animación de entrada. Los errores se registran, pero nunca bloquean el contenido.
- El `.glb` se precarga con `<link rel="preload" as="fetch" crossorigin>` solo en la portada.

## Depuración

En desarrollo, `window.__intro` expone `robot`, `camera`, `state`, `scene` e `intro`.
