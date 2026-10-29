// Escenario 3D de la intro (sacado de prototype/src/main.js sin cambiar la lógica): renderer,
// entorno, luces (contorno azul/violeta), halo, bloom, planos de cámara, degradado de la cintura y
// bucle de render. Nuevo: todo vive en una clase con dispose() para liberar la GPU al terminar.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BG = 0x05060a;
const HERO_FOV = 25;
// La cintura del robot (y en metros): por encima se ve; desde WAIST_FADE[0] se funde con el fondo y
// en WAIST_FADE[1] ya es fondo. Así no se ven las piernas en ningún encuadre.
const WAIST_FADE = [1.1, 0.88];
// Iluminación tras el barrido: el robot deja de ser solo silueta y se encienden sus líneas de luz.
export const LIT = { light: 0.4, neon: 1 };

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

export class Stage {
  /** @param {{ canvas: HTMLCanvasElement, fade: HTMLElement, mobile: boolean }} opts */
  constructor({ canvas, fade, mobile }) {
    this.canvas = canvas;
    this.fade = fade;
    this.listeners = [];

    // pixel ratio máximo de 2 (1,5 en móvil)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 6, 14);
    this.pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene = scene;

    this.camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.05, 50);

    // luces: al principio todo a oscuras. Las de contorno (rim) dibujan la silueta en la intro: azul
    // por un lado y violeta por el otro, para que el borde del robot sea un degradado.
    this.lights = [
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

    // halo muy tenue detrás del robot (índigo en el centro, violeta hacia fuera)
    this.halo = new THREE.Mesh(
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
    this.halo.position.set(0, 1.45, -1.4);
    scene.add(this.halo);

    // resplandor de las líneas de luz, los ojos y las gemas (contenido: sin efecto neón); a media
    // resolución en móvil
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, this.camera));
    const bloomScale = mobile ? 0.5 : 1;
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth * bloomScale, innerHeight * bloomScale),
      0.38,
      0.35,
      0.92,
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    // ------------------------------------------------------------ cámara
    this.eyeCenter = new THREE.Vector3(0, 1.6, 0.12); // se mide del modelo al cargarlo
    // light: luces principales | rim: contorno (silueta) | halo: resplandor detrás del robot
    this.state = {
      px: 0,
      py: 0,
      pz: 0,
      tx: 0,
      ty: 0,
      tz: 0,
      fov: 35,
      neon: 0,
      light: 0,
      rim: 0,
      halo: 0,
    };
    Object.assign(this.state, this.shot('hero'));
    this.lookTarget = new THREE.Vector3();
    this.parallax = { x: 0, y: 0 };
    this.pointer = new THREE.Vector2(0, 0);
    // plano en el que se queda la cámara ('hero' o 'heroAside'); se recalcula al cambiar el tamaño
    this.lockedShot = null;
    this._fadeKey = '';

    this.on(window, 'pointermove', (e) => {
      this.pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    });
    this.on(window, 'deviceorientation', (e) => {
      if (e.gamma == null) return;
      this.pointer.set(
        THREE.MathUtils.clamp(e.gamma / 30, -1, 1),
        THREE.MathUtils.clamp((45 - e.beta) / 30, -1, 1),
      );
    });
  }

  on(target, type, fn) {
    target.addEventListener(type, fn);
    this.listeners.push(() => target.removeEventListener(type, fn));
  }

  // ------------------------------------------------------------ planos de cámara (robot mira a +Z)
  narrow() {
    return innerWidth / innerHeight < 0.85;
  }

  shots() {
    const eyeCenter = this.eyeCenter;
    const narrow = this.narrow();
    const hero = () => {
      // torso para arriba, teleobjetivo (poca perspectiva) = Cam_Intro de Blender. En pantallas
      // estrechas la cámara se aleja para que quepan los hombros.
      const fitWidth =
        0.42 / (Math.tan(THREE.MathUtils.degToRad(HERO_FOV / 2)) * (innerWidth / innerHeight));
      return { pos: [0, 1.38, Math.max(2.3, fitWidth)], target: [0, 1.38, 0], fov: HERO_FOV };
    };
    return {
      // solo los ojos, muy de cerca
      eyes: () => ({
        pos: [eyeCenter.x, eyeCenter.y, eyeCenter.z + (narrow ? 1.0 : 0.62)],
        target: eyeCenter.toArray(),
        fov: HERO_FOV,
      }),
      hero,
      // tras el barrido: el robot en el tercio derecho y la tarjeta a la izquierda. En pantallas
      // estrechas el robot sube y la tarjeta va debajo.
      heroAside: () => {
        const h = hero();
        if (narrow) return { ...h, pos: [0, 1.15, h.pos[2]], target: [0, 1.15, 0] };
        const halfWidth =
          Math.tan(THREE.MathUtils.degToRad(HERO_FOV / 2)) * h.pos[2] * (innerWidth / innerHeight);
        const x = -0.4 * halfWidth; // el robot queda en x = +0,4 de la pantalla (NDC)
        return { ...h, pos: [x, h.pos[1], h.pos[2]], target: [x, h.target[1], 0] };
      },
    };
  }

  shot(name) {
    const s = this.shots()[name]();
    return {
      px: s.pos[0],
      py: s.pos[1],
      pz: s.pos[2],
      tx: s.target[0],
      ty: s.target[1],
      tz: s.target[2],
      fov: s.fov ?? 35,
    };
  }

  applyCamera() {
    const { state, camera, parallax } = this;
    camera.position.set(state.px + parallax.x * 0.03, state.py + parallax.y * 0.02, state.pz);
    this.lookTarget.set(state.tx, state.ty, state.tz);
    camera.lookAt(this.lookTarget);
    if (camera.fov !== state.fov) {
      camera.fov = state.fov;
      camera.updateProjectionMatrix();
    }
    for (const l of this.lights)
      l.intensity =
        l.userData.base * (l.userData.rim ? Math.max(state.light, state.rim) : state.light);
    this.scene.environmentIntensity = 0.28 * state.light; // reflejos discretos: el robot debe verse negro
    this.halo.material.opacity = state.halo;
    this.updateWaistFade();
  }

  /** Coloca el degradado que oculta al robot de la cintura para abajo. */
  updateWaistFade() {
    const v = new THREE.Vector3();
    this.camera.updateMatrixWorld();
    const [start, end] = WAIST_FADE.map((y) => {
      v.set(0, y, 0).project(this.camera);
      return (((1 - v.y) / 2) * 100).toFixed(2);
    });
    const key = `${start}|${end}`;
    if (key === this._fadeKey) return;
    this._fadeKey = key;
    this.fade.style.setProperty('--fade-start', `${start}%`);
    this.fade.style.setProperty('--fade-end', `${end}%`);
  }

  // el lienzo ocupa la ventana por CSS; el renderer se adapta a su tamaño real cuando cambia
  fitToCanvas() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const size = this.renderer.getSize(new THREE.Vector2());
    if (!w || !h || (size.x === w && size.y === h)) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
    if (this.lockedShot) Object.assign(this.state, this.shot(this.lockedShot));
  }

  /** Bucle de render: `onFrame(dt, t)` mueve robot e intro antes de dibujar. */
  start(onFrame, { reducedMotion = false } = {}) {
    const timer = new THREE.Timer();
    this.renderer.setAnimationLoop((now) => {
      timer.update(now);
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      if (!reducedMotion) {
        this.parallax.x += (this.pointer.x - this.parallax.x) * 0.04;
        this.parallax.y += (this.pointer.y - this.parallax.y) * 0.04;
      }
      this.fitToCanvas();
      this.applyCamera();
      onFrame(dt, t);
      this.composer.render();
    });
  }

  /** Congela la escena en el último fotograma (el lienzo se queda como está). */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /** Detiene el bucle, quita los listeners y libera geometrías, materiales, texturas y el contexto. */
  dispose() {
    this.renderer.setAnimationLoop(null);
    for (const off of this.listeners) off();
    this.listeners = [];
    this.scene.traverse((o) => {
      o.geometry?.dispose();
      const materials = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of materials) {
        for (const value of Object.values(m)) if (value?.isTexture) value.dispose();
        m.dispose();
      }
    });
    this.scene.environment?.dispose();
    this.pmrem.dispose();
    this.bloom.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
