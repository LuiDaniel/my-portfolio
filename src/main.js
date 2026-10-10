// Intro: pantalla negra -> el robot abre los ojos (parpadea) -> la cámara se aleja y aparece su
// silueta (torso para arriba) -> atrapa en el aire tres gemas de luz y con cada una arma un
// componente de la portada -> barre la portada hacia un lado con el brazo.
// Después: recorrido con scroll (prueba) -> el robot se ilumina, se ve entero y se acomoda a un lado.
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

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030406);
scene.fog = new THREE.Fog(0x030406, 6, 14);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 50);

// luces: al principio todo a oscuras. Las de contorno (rim) dibujan la silueta en la intro.
const lights = [
  [new THREE.DirectionalLight(0xfff4ea, 1.3), [-2.2, 3.0, 2.6], false], // principal
  [new THREE.DirectionalLight(0x9fdcff, 0.3), [2.6, 1.4, 2.0], false], // relleno
  [new THREE.DirectionalLight(0x5fe8ff, 2.4), [-1.8, 2.4, -2.4], true], // contorno cian
  [new THREE.DirectionalLight(0xffffff, 1.8), [1.9, 1.8, -2.2], true], // contorno blanco
].map(([l, p, rim]) => {
  l.position.set(...p);
  l.userData = { base: l.intensity, rim };
  scene.add(l);
  return l;
});

// suelo oscuro que se funde con el fondo + sombra suave bajo los pies
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(12, 64),
  new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.15 }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 1.4),
  new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,0.9)'), transparent: true, depthWrite: false, opacity: 0.8 }),
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.002;
scene.add(shadow);

// halo cian muy tenue detrás del robot: recorta su silueta oscura contra el fondo
const halo = new THREE.Mesh(
  new THREE.PlaneGeometry(4.2, 4.2),
  new THREE.MeshBasicMaterial({
    map: radialTexture('rgba(18,120,128,0.55)'),
    transparent: true,
    depthWrite: false,
    fog: false,
    opacity: 0,
  }),
);
halo.position.set(0, 1.45, -1.4);
scene.add(halo);

function radialTexture(inner) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// resplandor del neón, los ojos y las gemas
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.5, 0.35, 0.92);
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
  torso: () => ({ pos: [0.25, 1.42, narrow() ? 3.3 : 2.1], target: [0, 1.3, 0] }),
  body: () => (narrow() ? { pos: [1.6, 1.25, 4.4], target: [0, 0.92, 0] } : { pos: [1.7, 1.2, 3.3], target: [0, 0.93, 0] }),
  // se acomoda a un lado: deja sitio para el contenido del portafolio
  aside: () => (narrow() ? { pos: [0, 1.3, 5.6], target: [0, 1.25, 0] } : { pos: [-0.35, 1.1, 3.9], target: [-0.8, 0.95, 0] }),
};
// light: luces principales | rim: contorno (silueta) | halo: resplandor detrás del robot
const state = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, fov: 35, neon: 0, light: 0, rim: 0, halo: 0 };
const shot = (name) => {
  const s = SHOTS[name]();
  return { px: s.pos[0], py: s.pos[1], pz: s.pos[2], tx: s.target[0], ty: s.target[1], tz: s.target[2], fov: s.fov ?? 35 };
};
Object.assign(state, shot('hero'));
const lookTarget = new THREE.Vector3();
const parallax = { x: 0, y: 0 };
let heroLocked = false; // la cámara se queda en el plano 'hero' (se recalcula al cambiar el tamaño)

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
    // sin movimiento: la portada ya armada, el robot en silueta
    Object.assign(state, shot('hero'), { rim: 1, halo: 1 });
    heroLocked = true;
    robot.eyePower = 1;
    robot.look.weight = 0;
    robot.startIdle(0);
    intro.showAll();
    introActive = true;
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
    .add(() => (heroLocked = true))
    // 3. Retoma el clip: atrapa las gemas (los eventos del clip arman la portada)
    .add(() => (clip.timeScale = 1), 1.95);
}

// 4. Barre la portada hacia la izquierda con el brazo izquierdo y deja paso a la página
function sweepIntro() {
  robot
    .play('Intro_Sweep', { fade: 0.35, events: { sweep: () => intro.sweep() } })
    .then(finishIntro);
}

function finishIntro() {
  intro.finish();
  introActive = false;
  heroLocked = false;
  robot.autoBlink = true;
  gsap.to(robot.look, { weight: 1, duration: 1.2 });
  // provisional: hasta que exista la página principal, sigue el recorrido con scroll de prueba
  gsap.to(state, {
    light: 0.25,
    neon: 0.12,
    duration: 1.2,
    ease: 'power1.inOut',
    onComplete: () => {
      document.documentElement.style.overflow = '';
      buildScrollTimeline();
      hint.classList.add('is-visible');
    },
  });
}

// ---------------------------------------------------------------- scroll
function buildScrollTimeline() {
  let discovered = false;
  const to = (name, extra = {}) => ({
    px: () => shot(name).px, py: () => shot(name).py, pz: () => shot(name).pz,
    tx: () => shot(name).tx, ty: () => shot(name).ty, tz: () => shot(name).tz,
    fov: () => shot(name).fov,
    ...extra,
  });

  gsap.timeline({
    defaults: { ease: 'power1.inOut' },
    scrollTrigger: {
      trigger: '#intro',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        heroLocked = false;
        hint.classList.toggle('is-visible', self.progress < 0.02 && !robot.busy);
        // al ver el cuerpo entero, el robot se descubre (una sola vez)
        if (!discovered && self.progress > 0.5) {
          discovered = true;
          robot.enqueue('Discover');
        }
      },
    },
  })
    // con prefers-reduced-motion la portada sigue visible: se retira al empezar a bajar
    .to('#hero', { autoAlpha: 0, duration: 0.3 }, 0)
    // se ilumina el robot y se acerca al torso; se encienden las líneas de neón
    .to(state, to('torso', { neon: 0.45, light: 0.6, halo: 0, duration: 1.4 }), 0)
    // cuerpo completo: la cámara orbita un poco
    .to(state, to('body', { neon: 1, light: 1, duration: 1.6 }))
    .to(state, { duration: 1.2 }) // pausa mientras se mira las manos
    // se acomoda a un lado
    .to(state, to('aside', { duration: 1.4 }));
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
  if (!robot.root || robot.busy || introActive || reducedMotion || e.target.closest('a, button, input, textarea')) return;
  raycaster.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  if (!robot.hitTest(raycaster)) return;
  robot.setExpression('happy');
  robot.enqueue('Wave').then(() => robot.setExpression('normal'));
});

// ---------------------------------------------------------------- bucle
const timer = new THREE.Timer();
renderer.setAnimationLoop((now) => {
  timer.update(now);
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
  if (heroLocked) Object.assign(state, shot('hero'));
  ScrollTrigger.refresh();
}
