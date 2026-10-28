// Intro: pantalla negra -> el robot abre los ojos (parpadea) -> la cámara se aleja y aparece su
// silueta (cintura para arriba; más abajo se funde con el fondo) -> atrapa en el aire tres gemas
// de luz y con cada una arma un componente de la portada -> los barre hacia la izquierda, donde se
// quedan, mientras él se aparta a la derecha y se ilumina.
// Después: al hacer scroll, la portada y el robot se desvanecen (el robot solo vive en la intro).
import './style.css';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Robot } from './robot.js';
import { Intro } from './intro.js';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ---------------------------------------------------------------- renderer + escena
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const BG = 0x05060a;
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 6, 14);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 50);

// luces: al principio todo a oscuras. Las de contorno (rim) dibujan la silueta en la intro: azul
// por un lado y violeta por el otro, para que el borde del robot sea un degradado.
const lights = [
  [new THREE.DirectionalLight(0xf2f4ff, 1.3), [-2.2, 3.0, 2.6], false], // principal
  [new THREE.DirectionalLight(0xb4c0ff, 0.3), [2.6, 1.4, 2.0], false], // relleno
  [new THREE.DirectionalLight(0x5f8cff, 2.6), [-1.8, 2.4, -2.4], true], // contorno azul
  [new THREE.DirectionalLight(0xa47cff, 2.2), [1.9, 1.8, -2.2], true], // contorno violeta
].map(([l, p, rim]) => {
  l.position.set(...p);
  l.userData = { base: l.intensity, rim };
  scene.add(l);
  return l;
});

// halo muy tenue detrás del robot (índigo en el centro, violeta hacia fuera): recorta su silueta
// oscura contra el fondo
const halo = new THREE.Mesh(
  new THREE.PlaneGeometry(4.2, 4.2),
  new THREE.MeshBasicMaterial({
    map: radialTexture([
      [0, 'rgba(38,50,150,0.42)'],
      [0.45, 'rgba(62,40,135,0.16)'],
      [1, 'rgba(0,0,0,0)'],
    ]),
    transparent: true,
    depthWrite: false,
    fog: false,
    opacity: 0,
  }),
);
halo.position.set(0, 1.45, -1.4);
scene.add(halo);

function radialTexture(stops) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [at, color] of stops) grd.addColorStop(at, color);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// resplandor de las líneas de luz, los ojos y las gemas (contenido: sin efecto neón)
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.38, 0.35, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- planos de cámara (robot mira a +Z)
const narrow = () => innerWidth / innerHeight < 0.85;
const eyeCenter = new THREE.Vector3(0, 1.6, 0.12); // se mide del modelo al cargarlo
const HERO_FOV = 25;
const SHOTS = {
  // intro: solo los ojos, muy de cerca
  eyes: () => ({ pos: [eyeCenter.x, eyeCenter.y, eyeCenter.z + (narrow() ? 1.0 : 0.62)], target: eyeCenter.toArray(), fov: HERO_FOV }),
  // intro: torso para arriba, teleobjetivo (poca perspectiva) = Cam_Intro de Blender. En pantallas
  // estrechas la cámara se aleja para que quepan los hombros.
  hero: () => {
    const fitWidth = 0.42 / (Math.tan(THREE.MathUtils.degToRad(HERO_FOV / 2)) * (innerWidth / innerHeight));
    return { pos: [0, 1.38, Math.max(2.3, fitWidth)], target: [0, 1.38, 0], fov: HERO_FOV };
  },
  // tras el barrido: el mismo plano desplazado para que el robot quede en el tercio derecho y los
  // componentes a la izquierda. En pantallas estrechas el robot sube y los componentes van debajo.
  heroAside: () => {
    const h = SHOTS.hero();
    if (narrow()) return { ...h, pos: [0, 1.15, h.pos[2]], target: [0, 1.15, 0] };
    const halfWidth = Math.tan(THREE.MathUtils.degToRad(HERO_FOV / 2)) * h.pos[2] * (innerWidth / innerHeight);
    const x = -0.4 * halfWidth; // el robot queda en x = +0,4 de la pantalla (NDC)
    return { ...h, pos: [x, h.pos[1], h.pos[2]], target: [x, h.target[1], 0] };
  },
};
// La cintura del robot (y en metros): por encima se ve; desde WAIST_FADE[0] se funde con el fondo y
// en WAIST_FADE[1] ya es fondo. Así no se ven las piernas en ningún encuadre.
const WAIST_FADE = [1.1, 0.88];
// Iluminación tras el barrido: el robot deja de ser solo silueta y se encienden sus líneas de luz.
const LIT = { light: 0.4, neon: 1 };
// light: luces principales | rim: contorno (silueta) | halo: resplandor detrás del robot
const state = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, fov: 35, neon: 0, light: 0, rim: 0, halo: 0 };
const shot = (name) => {
  const s = SHOTS[name]();
  return { px: s.pos[0], py: s.pos[1], pz: s.pos[2], tx: s.target[0], ty: s.target[1], tz: s.target[2], fov: s.fov ?? 35 };
};
Object.assign(state, shot('hero'));
const lookTarget = new THREE.Vector3();
const parallax = { x: 0, y: 0 };
// plano en el que se queda la cámara ('hero' o 'heroAside'); se recalcula al cambiar el tamaño
let lockedShot = null;

const stage = document.getElementById('stage');
const stageFade = stage.querySelector('.stage-fade');
let stageVisible = true; // con el escenario ya desvanecido por el scroll no se renderiza

function applyCamera() {
  camera.position.set(state.px + parallax.x * 0.03, state.py + parallax.y * 0.02, state.pz);
  lookTarget.set(state.tx, state.ty, state.tz);
  camera.lookAt(lookTarget);
  if (camera.fov !== state.fov) {
    camera.fov = state.fov;
    camera.updateProjectionMatrix();
  }
  for (const l of lights) l.intensity = l.userData.base * (l.userData.rim ? Math.max(state.light, state.rim) : state.light);
  scene.environmentIntensity = 0.28 * state.light; // reflejos discretos: el robot debe verse negro
  halo.material.opacity = state.halo;
  updateWaistFade();
}

/** Coloca el degradado que oculta al robot de la cintura para abajo. */
const _fade = new THREE.Vector3();
let fadeKey = '';
function updateWaistFade() {
  camera.updateMatrixWorld();
  const [start, end] = WAIST_FADE.map((y) => {
    _fade.set(0, y, 0).project(camera);
    return (((1 - _fade.y) / 2) * 100).toFixed(2);
  });
  const key = `${start}|${end}`;
  if (key === fadeKey) return;
  fadeKey = key;
  stageFade.style.setProperty('--fade-start', `${start}%`);
  stageFade.style.setProperty('--fade-end', `${end}%`);
}

// ---------------------------------------------------------------- robot + intro
const robot = new Robot(scene);
let intro = null;
let introActive = false;
if (import.meta.env.DEV) window.__intro = { robot, camera, state, scene };
const pctEl = document.getElementById('loader-pct');
const hint = document.querySelector('.scroll-hint');

robot
  .load(`${import.meta.env.BASE_URL}models/robot.glb`, (p) => (pctEl.textContent = Math.round(p * 100)))
  .then(start)
  .catch((err) => {
    console.error(err);
    pctEl.parentElement.textContent = 'No se pudo cargar el modelo';
  });

async function start() {
  pctEl.textContent = '100';
  ScrollTrigger.clearScrollMemory('manual');
  window.scrollTo(0, 0); // la intro siempre empieza a oscuras, aunque el navegador recuerde el scroll
  await document.fonts.ready; // el layout de la portada depende de las fuentes
  intro = new Intro({ scene, camera, robot });
  if (import.meta.env.DEV) window.__intro.intro = intro;

  // centro de los ojos (para el primer plano)
  robot.pose('Intro');
  robot.root.updateMatrixWorld(true);
  eyeCenter.set(0, 0, 0);
  for (const m of robot.eyeMeshes) eyeCenter.add(m.getWorldPosition(new THREE.Vector3()));
  eyeCenter.multiplyScalar(1 / robot.eyeMeshes.length);

  if (reducedMotion) {
    // sin movimiento: la portada ya armada a la izquierda y el robot a la derecha, iluminado
    lockedShot = 'heroAside';
    Object.assign(state, shot(lockedShot), { rim: 1, halo: 1, ...LIT });
    robot.eyePower = 1;
    robot.look.weight = 0;
    robot.startIdle(0);
    intro.showAll();
    intro.finish();
    document.getElementById('loader').classList.add('is-done');
    buildScrollTimeline();
    return;
  }

  runIntro();
}

// ---------------------------------------------------------------- intro (tiempo, no scroll)
function runIntro() {
  introActive = true;
  document.documentElement.style.overflow = 'hidden'; // sin scroll hasta que termine
  Object.assign(state, shot('eyes'), { light: 0, rim: 0, halo: 0, neon: 0 });
  robot.eyePower = 0;
  robot.autoBlink = false; // el clip ya parpadea
  robot.look.weight = 0; // el clip mueve la cabeza (mira cada gema)
  renderer.compile(scene, camera);
  document.getElementById('loader').classList.add('is-done');

  let clip = null;
  gsap
    .timeline({ delay: 0.8 })
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
        .then(() => gsap.delayedCall(2.4, sweepIntro)); // tiempo para leer la portada
      clip = robot.current;
    }, 0.35)
    .add(() => (clip.timeScale = 0), 0.35 + 0.55)
    // 2. La cámara se aleja: aparece la silueta (luz de contorno + halo detrás)
    .to(state, { ...shot('hero'), rim: 1, halo: 1, duration: 1.5, ease: 'power2.inOut' }, 0.75)
    .add(() => (lockedShot = 'hero'))
    // 3. Retoma el clip: atrapa las gemas (los eventos del clip arman la portada)
    .add(() => (clip.timeScale = 1), 1.95);
}

// 4. Barre la portada hacia la izquierda con el brazo izquierdo: los componentes se quedan ahí y el
//    robot se aparta a la derecha mientras se ilumina
function sweepIntro() {
  robot
    .play('Intro_Sweep', {
      fade: 0.35,
      events: {
        sweep: () => {
          intro.sweep();
          lockedShot = null;
          gsap.to(state, {
            ...shot('heroAside'),
            ...LIT,
            duration: 1.6,
            ease: 'power2.inOut',
            onComplete: () => (lockedShot = 'heroAside'),
          });
        },
      },
    })
    .then(finishIntro);
}

function finishIntro() {
  intro.finish();
  introActive = false;
  robot.autoBlink = true;
  gsap.to(robot.look, { weight: 1, duration: 1.2 });
  document.documentElement.style.overflow = '';
  buildScrollTimeline();
  hint.classList.add('is-visible');
}

// ---------------------------------------------------------------- scroll
// Al bajar, la portada sube y se desvanece y después el robot también: solo existe en la intro.
function buildScrollTimeline() {
  const rise = reducedMotion ? 0 : 1; // con movimiento reducido solo se desvanecen, sin desplazarse
  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#intro',
        start: 'top top',
        end: 'bottom top',
        scrub: reducedMotion ? true : 0.6,
        onUpdate: (self) => {
          hint.classList.toggle('is-visible', self.progress < 0.02);
          stageVisible = self.progress < 0.66; // a partir de ahí el escenario ya es transparente
        },
      },
    })
    .to('#hero', { y: () => -0.12 * innerHeight * rise, autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, 0)
    .to(stage, { y: () => -0.08 * innerHeight * rise, autoAlpha: 0, duration: 0.55, ease: 'power1.in' }, 0.1)
    .to({}, { duration: 0.35 }); // el último tramo ya sin robot: entra el contenido
}

// ---------------------------------------------------------------- interacción: mirada y clic
const pointer = new THREE.Vector2(0, 0);
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
});
addEventListener('deviceorientation', (e) => {
  if (e.gamma == null) return;
  pointer.set(THREE.MathUtils.clamp(e.gamma / 30, -1, 1), THREE.MathUtils.clamp((45 - e.beta) / 30, -1, 1));
});

const raycaster = new THREE.Raycaster();
addEventListener('click', (e) => {
  if (!robot.root || robot.busy || introActive || reducedMotion || !stageVisible) return;
  if (e.target.closest('a, button, input, textarea')) return;
  raycaster.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (!robot.hitTest(raycaster)) return;
  robot.setExpression('happy');
  robot.enqueue('Wave').then(() => robot.setExpression('normal'));
});

// ---------------------------------------------------------------- bucle
const timer = new THREE.Timer();
renderer.setAnimationLoop((now) => {
  timer.update(now);
  if (!stageVisible) return; // el robot ya se desvaneció: nada que dibujar
  const dt = Math.min(timer.getDelta(), 0.05);
  const t = timer.getElapsed();
  if (!reducedMotion) {
    parallax.x += (pointer.x - parallax.x) * 0.04;
    parallax.y += (pointer.y - parallax.y) * 0.04;
  }
  fitToCanvas();
  applyCamera();
  if (robot.root) {
    if (!reducedMotion) robot.lookAtScreen(pointer.x, pointer.y, camera);
    robot.neonLevel = state.neon;
    robot.update(dt, t);
  }
  if (intro && introActive) {
    camera.updateMatrixWorld();
    intro.layout();
    intro.update(dt);
  }
  composer.render();
});

// el lienzo ocupa la ventana por CSS; el renderer se adapta a su tamaño real cuando cambia
function fitToCanvas() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const size = renderer.getSize(new THREE.Vector2());
  if (!w || !h || (size.x === w && size.y === h)) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  if (lockedShot) Object.assign(state, shot(lockedShot));
  ScrollTrigger.refresh();
}
