# Portafolio personal con robot 3D

El usuario habla español: responde siempre en español.

## Objetivo
Portafolio web personal con una intro 3D de un robot, controlada por scroll.

### Coreografía de la intro
1. **Despertar**: pantalla negra → se encienden dos ojos de puntitos LED cian (parpadeo). Funciona también como pantalla de carga mientras baja el modelo.
2. **Revelación**: al hacer scroll la cámara se aleja → cara → cabeza → torso; se encienden las líneas de neón del cuerpo.
3. **Cuerpo completo**: la cámara orbita un poco para mostrar el cuerpo; el robot hace un gesto (estirarse, girar la cabeza, saludar).
4. **Se acomoda**: el robot se encoge / se mueve a un lado y aparece el portafolio (nombre, proyectos, contacto).

Extras: la cabeza y los ojos siguen el cursor (en móvil, el giroscopio); animación de reposo/aburrimiento; los ojos cambian según la sección; reacciona al clic. Respetar `prefers-reduced-motion`.

### Stack
- Three.js (o React Three Fiber) + GSAP ScrollTrigger.
- Modelo `.glb` comprimido con Draco, idealmente < 3 MB, con animaciones.

## Diseño del robot (original, inspirado en `referencias/5.jpg`; no copiar exacto un robot comercial)
- **Cabeza**: casco alargado tipo huevo, visor frontal negro espejo; detrás, **ojos de matriz de puntos LED cian** (ref `1.png`), animables (parpadear, entrecerrar).
- **Cuello**: delgado, con cables visibles.
- **Torso**: forma de escudo, hombros anchos que se estrechan a una cintura delgada, negro mate, línea curva en el pecho.
- **Cintura**: columna delgada con cables.
- **Brazos**: por segmentos (hombro, brazo, codo, antebrazo robusto con detalle mecánico).
- **Manos**: dedos articulados simplificados (refs `2.png`, `3.png`).
- **Piernas**: simples pero completas (ref `4.png`), para mostrar el cuerpo entero.
- **Materiales**: cuerpo negro mate; visor negro espejo; articulaciones gris metálico oscuro.
- **Neón cian/turquesa**: anillos que brillan en cuello, hombros, codos, muñecas y cintura + cables que brillan como "venas" (material emisivo).
- Construir por **piezas separadas y con nombre** (Head, Visor, Eye_L, Eye_R, Torso, UpperArm_L…), con esqueleto, para poder animarlas en la web.
- Optimizado para web (pocos polígonos, materiales PBR simples compatibles con glTF).

## Plan
1. ✅ Conexión: `uv` instalado; servidor MCP `blender` registrado en `~/.claude.json`; add-on en `Descargas/blender-mcp-addon.py`.
2. Modelado por piezas en Blender vía MCP → capturas desde varios ángulos → ajustes con el usuario.
   - Cada pieza se genera con un script reproducible en `blender/` (orden: `build_head.py`, `build_torso.py`, `build_waist.py`, `build_arms.py`, `build_legs.py`, `build_details.py`; `build_all.py` los ejecuta todos y guarda `blender/robot.blend`). Utilidades y cotas compartidas (`ARM`, `LEG`) en `robot_utils.py`. Brazos y piernas se modelan del lado _L y se espejan a _R.
   - `build_details.py` añade placas, costuras, tornillos, pistones hidráulicos, mangueras y tapas de articulación; sus objetos llevan la propiedad `detail` y cuelgan de su pieza. Pistones: camisa (`*Sleeve`) en la pieza superior y vástago (`*Rod`) en la inferior → en la web conviene reorientarlos con `lookAt` al doblar la articulación.
   - ✅ Cabeza (estilo ref 5), cuello, torso, cintura/pelvis, brazos, manos y piernas (estilo refs 2/3/4, por indicación del usuario). Robot completo ~1,81 m en pose A.
3. ✅ Esqueleto + animaciones (`build_rig.py`): armature `Robot_Rig` con huesos `B_*`; piezas rígidas colgadas de su hueso (sin pesos). Acciones a 30 fps: `WakeUp`, `Idle` (cíclica), `LookAround`, `Wave`, `Stretch`, `Blink` (solo ojos, para combinar). Parpadeo/entrecerrar = escala vertical de `B_Eye_L/R`; seguimiento del cursor en la web = rotar `B_Head`/`B_Neck`.
4. ✅ Exportar `.glb` (Draco) a `public/models/robot.glb` con `blender/export_glb.py` (Blender en segundo plano: `blender -b blender/robot.blend -P blender/export_glb.py`). Une las piezas por (hueso, material) → mallas `<Hueso>`, `<Hueso>_Neon`, `_Metal`, `_Plate`, `_Steel`, `_Cable`, `_Visor`; deja aparte `Eye_L/R` y los pistones (`*PistonSleeve_L/R`, `*PistonRod_L/R`). ~0,8 MB.
   - Intro de la portada (`build_intro.py`, lo ejecuta `build_rig.py`): acciones `Intro` (6,8 s: despierta y atrapa en el aire 3 gemas invisibles, mano der → iconos, izq → título, der → URL, y las suelta delante del pecho) e `Intro_Sweep` (2,1 s: barre todo hacia la izquierda de la pantalla con el brazo izq). Brazos por IK analítica hacia `B_Grip_L/R` (punto entre pulgar e índice en pinza; pinza = `PINCH_ANGLES`/`PINCH_THUMB` en `build_rig.py`). Canales `Curves` con interpolación cúbica monótona (claves independientes por canal: sin tirones). Los momentos clave (`grab_*`, `release_*`, `sweep`…) se guardan en la propiedad `events` de la acción y se exportan como `extras` del glTF. `Cam_Intro` = encuadre de la web.
5. Web (Vite + Three.js + GSAP ScrollTrigger; `npm run dev`). ✅ Intro de la portada hecha (por tiempo, no scroll); después sigue el recorrido con scroll de prueba. Pendiente: la página principal (contenido, secciones, ojos por sección, aburrimiento).
   - Intro: pantalla negra → ojos (parpadeo) → la cámara se aleja al plano `hero` (torso para arriba, fov 25, silueta: solo luces de contorno + halo) → clip `Intro`; en cada `grab_*` se enciende una gema en `B_Grip_*` y en `release_*` la gema vuela el último tramo hasta su componente HTML, estalla y este se materializa (los componentes van en un bloque compacto `.hero-stack`, como en la referencia, centrado delante del pecho) → 2,4 s para leer → `Intro_Sweep` (los componentes salen despedidos a la izquierda) → se ilumina el robot y se activa el scroll. Scroll bloqueado durante la intro.
   - `src/intro.js`: clase `Intro` (gemas de luz con `PointLight`, bloque de `#hero` anclado a `ANCHOR`, vuelo de la gema a su componente, animaciones de aparición y barrido).
   - `src/main.js`: escena, luces (contorno aparte: `state.rim`), halo, bloom, pantalla de carga, orquestación de la intro y timeline de scroll sobre `#intro` (planos `hero → torso → body → aside`; `state.neon` enciende el neón por regiones; al 50 % se lanza `Discover`), clic en el robot = `Wave`.
   - `src/robot.js`: clase `Robot` (carga Draco, mixer, `play`/`enqueue` de gestos con `events` del clip, `gripPosition`, mirada al cursor sobre `B_Neck`/`B_Head`, parpadeo, expresiones, neón por regiones, pistones que se reorientan cada frame).
   - `src/eyes.js`: patrones 10×6 de los ojos LED (`normal`, `happy`, `focus`, `surprised`, `love`, `bored`, `off`) dibujados en un `CanvasTexture`.
   - Ojo: algunos clips no traen pista de todos los huesos → los huesos que se giran a mano se reinician a su pose base cada frame. `prefers-reduced-motion`: sin animaciones, la portada ya armada con el robot en silueta.
   - En modo dev, `window.__intro` expone `robot`, `camera`, `state`, `scene` para depurar.

Entorno: Windows 11, Blender 5.1 (`C:\Program Files\Blender Foundation\Blender 5.1`).
