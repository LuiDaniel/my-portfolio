// Coreografía de la intro (docs/05-robot-3d.md#coreografía). Los pasos 1–6 son los de
// main.js del prototipo original sin cambios; lo nuevo es la pausa, la despedida con caída (opción A),
// «Saltar intro» y la entrada del Home en la misma pantalla.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Robot } from './robot.js';
import { Intro } from './intro.js';
import { LIT, Stage } from './stage.js';

// Los tiempos de la coreografía están en segundos a velocidad 1; SPEED los acelera todos a la vez
// (clips de Blender y animaciones de GSAP), así que robot, gemas y tarjeta siguen sincronizados.
const SPEED = 1.25;
const PAUSE = 0.6; // s con la tarjeta a la izquierda y el robot mirando al cursor
const READ = 1.4; // s para leer la tarjeta completa antes del barrido

/**
 * Arranca la intro. Devuelve un controlador con `skip()` y `dispose()`.
 * @param {{
 *   root: HTMLElement, canvas: HTMLCanvasElement, fade: HTMLElement, stage: HTMLElement,
 *   onProgress: (pct: number) => void, onReady: () => void,
 *   onHome: () => void, onDone: () => void, fast?: boolean
 * }} opts
 */
export function startIntro(opts) {
  const { root, canvas, fade, onProgress, onReady, onHome, onDone } = opts;
  const mobile = matchMedia('(pointer: coarse)').matches;
  const view = new Stage({ canvas, fade, mobile });
  const { scene, camera, state } = view;
  const robot = new Robot(scene);
  const shot = (name) => view.shot(name);
  let intro = null;
  let introActive = false;
  let ended = false;
  let disposed = false;
  const tweens = []; // timelines propios, para poder matarlos al saltar

  // Modo rápido para las pruebas (?intro=fast, nunca en producción): todo va 6 veces más rápido.
  const speed = opts.fast ? 6 : SPEED;
  gsap.globalTimeline.timeScale(speed);

  if (process.env.NODE_ENV !== 'production') window.__intro = { robot, camera, state, scene };

  robot
    .load('/models/robot.glb', (p) => onProgress(Math.round(p * 100)))
    .then(begin)
    .catch((err) => {
      console.error('[intro] No se pudo cargar el robot:', err);
      skip(); // sin modelo no hay intro: el Home aparece directamente
    });

  // Si se saltó la intro mientras cargaba (ended), no se arranca la escena: compilar los shaders y
  // dibujar bloquearía la página durante el fundido en un equipo lento.
  async function begin() {
    if (disposed || ended) return;
    onProgress(100);
    robot.mixer.timeScale = speed;
    await document.fonts.ready; // el layout de la tarjeta depende de las fuentes
    if (disposed || ended) return;
    intro = new Intro({ scene, camera, robot, root });
    if (window.__intro) window.__intro.intro = intro;

    // centro de los ojos (para el primer plano)
    robot.pose('Intro');
    robot.root.updateMatrixWorld(true);
    view.eyeCenter.set(0, 0, 0);
    for (const m of robot.eyeMeshes) view.eyeCenter.add(m.getWorldPosition(new THREE.Vector3()));
    view.eyeCenter.multiplyScalar(1 / robot.eyeMeshes.length);

    view.start((dt, t) => {
      robot.lookAtScreen(view.pointer.x, view.pointer.y, camera);
      robot.neonLevel = state.neon;
      robot.update(dt, t);
      if (intro && introActive) {
        camera.updateMatrixWorld();
        intro.layout();
        intro.update(dt);
      }
    });
    runIntro();
  }

  // ---------------------------------------------------------------- 1–5: despertar, silueta, gemas
  function runIntro() {
    introActive = true;
    Object.assign(state, shot('eyes'), { light: 0, rim: 0, halo: 0, neon: 0 });
    robot.eyePower = 0;
    robot.autoBlink = false; // el clip ya parpadea
    robot.look.weight = 0; // el clip mueve la cabeza (mira cada gema)
    view.renderer.compile(scene, camera);
    onReady();

    let clip = null;
    const tl = gsap
      .timeline({ delay: 0.3 })
      // 1. Despertar: solo se ven los ojos, que se encienden con un parpadeo de arranque
      .to(robot, { eyePower: 1, duration: 0.05 }, 0)
      .to(robot, { eyePower: 0.15, duration: 0.05 }, 0.1)
      .to(robot, { eyePower: 1, duration: 0.08 }, 0.2)
      // el clip levanta la cabeza y parpadea dos veces; se detiene justo antes de estirar el brazo
      .add(() => {
        robot
          .play('Intro', {
            fade: 0,
            events: {
              grab_icons: () => intro.grab('icons'),
              release_icons: () => intro.release('icons'),
              grab_title: () => intro.grab('title'),
              release_title: () => intro.release('title'),
              grab_url: () => intro.grab('url'),
              release_url: () => intro.release('url'),
            },
          })
          .then(() => !ended && tweens.push(gsap.delayedCall(READ, sweepIntro)));
        clip = robot.current;
      }, 0.35)
      .add(() => (clip.timeScale = 0), 0.35 + 0.55)
      // 2. La cámara se aleja: aparece la silueta (luz de contorno + halo detrás)
      .to(state, { ...shot('hero'), rim: 1, halo: 1, duration: 1.2, ease: 'power2.inOut' }, 0.6)
      .add(() => (view.lockedShot = 'hero'))
      // 3. Retoma el clip: atrapa las gemas (los eventos del clip arman la tarjeta)
      .add(() => (clip.timeScale = 1), 1.55);
    tweens.push(tl);
  }

  // ---------------------------------------------------------------- 6: barrido
  function sweepIntro() {
    robot
      .play('Intro_Sweep', {
        fade: 0.35,
        events: {
          sweep: () => {
            intro.sweep();
            view.lockedShot = null;
            tweens.push(
              gsap.to(state, {
                ...shot('heroAside'),
                ...LIT,
                duration: 1.6,
                ease: 'power2.inOut',
                onComplete: () => (view.lockedShot = 'heroAside'),
              }),
            );
          },
        },
      })
      .then(finishIntro);
  }

  // ---------------------------------------------------------------- 7: pausa (mira al cursor)
  function finishIntro() {
    if (ended) return;
    intro.finish();
    introActive = false;
    robot.autoBlink = true;
    tweens.push(gsap.to(robot.look, { weight: 1, duration: 1.2 }));
    tweens.push(gsap.delayedCall(PAUSE, farewell));
  }

  // ---------------------------------------------------------------- 8–9: despedida con caída + Home
  function farewell() {
    if (ended) return;
    ended = true;
    const parts = ['url', 'title', 'icons'].map((k) => root.querySelector(`[data-part="${k}"]`));
    const tl = gsap.timeline({ onComplete: end });
    // la tarjeta cae con gravedad, primero el dominio, luego título e iconos
    tl.to(
      parts,
      {
        y: () => gsap.utils.random(40, 60),
        rotation: () => gsap.utils.random(-3, 3),
        filter: 'blur(4px)',
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
        stagger: 0.08,
      },
      0,
    );
    // el robot «se apaga»: los ojos parpadean a off, las líneas de luz se apagan de la cintura a la
    // cabeza (el encendido al revés), bajan luces y halo, y el escenario se hunde y se desvanece
    tl.to(robot, { eyePower: 0.2, duration: 0.05 }, 0)
      .to(robot, { eyePower: 1, duration: 0.05 }, 0.1)
      .to(robot, { eyePower: 0, duration: 0.1 }, 0.2)
      .to(state, { neon: 0, light: 0, rim: 0, halo: 0, duration: 0.7, ease: 'power1.in' }, 0)
      .to(opts.stage, { y: '4vh', opacity: 0, duration: 0.8, ease: 'power2.in' }, 0.3)
      // el fondo de la capa se aclara para que el Home entre en la misma pantalla
      .to(opts.stage.parentElement, { backgroundColor: 'rgba(5, 6, 10, 0)', duration: 0.6 }, 0.5)
      // el Home empieza su entrada a mitad de la despedida
      .add(onHome, 0.6);
    tweens.push(tl);
  }

  /** «Saltar intro» (o Esc, o un error): despedida corta (fundido de 0,5 s) y entra el Home. */
  function skip() {
    if (disposed) return;
    ended = true;
    for (const t of tweens) t.kill();
    gsap.globalTimeline.timeScale(1);
    // La escena se congela durante el fundido: seguir dibujándola en un equipo lento frenaría la
    // animación (GSAP compensa los fotogramas largos) y el Home tardaría en aparecer.
    view.stop();
    onHome();
    gsap.to(opts.stage.parentElement, { opacity: 0, duration: 0.5, onComplete: end });
  }

  function end() {
    gsap.globalTimeline.timeScale(1);
    onDone();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    ended = true;
    for (const t of tweens) t.kill();
    gsap.killTweensOf([state, robot, robot.look]);
    gsap.globalTimeline.timeScale(1);
    view.dispose();
    if (window.__intro) delete window.__intro;
  }

  return { skip, dispose };
}
