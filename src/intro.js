// Intro: el robot "atrapa en el aire" una gema de luz por cada componente de la portada (iconos,
// título, URL), la lleva hasta su sitio y al soltarla el componente se materializa. Al final la
// barre hacia la izquierda con el brazo. Los momentos los marca el clip (eventos de robot.play).
import * as THREE from 'three';
import { gsap } from 'gsap';

// Con qué mano agarra el robot la gema de cada componente.
const PARTS = { icons: { side: 'R' }, title: { side: 'L' }, url: { side: 'R' } };
// El bloque de la portada se centra en este punto (delante del pecho; = donde suelta la gema del
// título en build_intro.py, pasado de Blender a three: (x, y, z) -> (x, z, -y)). Al soltar cada
// gema, esta hace un último tramo corto hasta el centro de su componente.
const ANCHOR = new THREE.Vector3(0, 1.29, 0.45);

const _v = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _fwd = new THREE.Vector3();

function canvasTexture(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const glowTexture = () =>
  canvasTexture(128, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.12, 'rgba(210,255,255,0.95)');
    grd.addColorStop(0.3, 'rgba(0,229,255,0.45)');
    grd.addColorStop(0.65, 'rgba(0,160,200,0.08)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
  });

// destello de 4 puntas (cruz fina con degradado)
const starTexture = () =>
  canvasTexture(128, (g, s) => {
    const c = s / 2;
    for (const [w, h] of [[s, 3], [3, s]]) {
      const grd = w > h ? g.createLinearGradient(0, 0, s, 0) : g.createLinearGradient(0, 0, 0, s);
      grd.addColorStop(0, 'rgba(0,229,255,0)');
      grd.addColorStop(0.5, 'rgba(220,255,255,1)');
      grd.addColorStop(1, 'rgba(0,229,255,0)');
      g.fillStyle = grd;
      g.fillRect(c - w / 2, c - h / 2, w, h);
    }
  });

/** Gema de luz que sigue el punto de agarre de una mano e ilumina la mano (silueta). */
class Gem {
  constructor(scene, glow, star) {
    const mat = (map) =>
      new THREE.SpriteMaterial({
        map,
        color: new THREE.Color(2.4, 2.8, 3.0), // > 1 para que el bloom la haga brillar
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        opacity: 0,
      });
    this.group = new THREE.Group();
    this.core = new THREE.Sprite(mat(glow));
    this.star = new THREE.Sprite(mat(star));
    this.core.renderOrder = this.star.renderOrder = 10;
    // la luz existe siempre (intensidad 0): añadir luces después obligaría a recompilar shaders
    this.light = new THREE.PointLight(0x7ff4ff, 0, 0.9, 2);
    this.group.add(this.core, this.star, this.light);
    scene.add(this.group);
    this.state = { power: 0, size: 0 };
    this.side = null; // mano a la que va pegada
  }

  update(robot, time) {
    if (this.side) robot.gripPosition(this.side, this.group.position);
    const { power, size } = this.state;
    const pulse = 1 + 0.08 * Math.sin(time * 9.0) + 0.04 * Math.sin(time * 23.0);
    this.core.material.opacity = Math.min(1, power);
    this.star.material.opacity = Math.min(1, power) * 0.85;
    this.core.scale.setScalar(0.07 * size * pulse * (0.7 + 0.3 * power));
    this.star.scale.setScalar(0.16 * size * pulse);
    this.star.material.rotation = time * 0.8;
    this.light.intensity = 0.45 * Math.min(power, 1.4); // ilumina la mano, sin encender todo el torso
    this.group.visible = power > 0.002;
  }
}

/** Divide el texto de un elemento en letras (span) para animarlas una a una. */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  return [...text].map((ch) => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.style.display = 'inline-block';
    if (ch === ' ') s.style.width = '0.6em';
    el.append(s);
    return s;
  });
}

/** Desplazamiento horizontal de cada elemento hasta el centro de su contenedor (para que "salgan" de ahí). */
const toCenter = (els, parent) => {
  const pr = parent.getBoundingClientRect();
  const cx = pr.left + pr.width / 2;
  return els.map((el) => {
    const r = el.getBoundingClientRect();
    return cx - (r.left + r.width / 2);
  });
};

export class Intro {
  constructor({ scene, camera, robot }) {
    this.camera = camera;
    this.robot = robot;
    this.root = document.getElementById('hero');
    this.stack = this.root.querySelector('.hero-stack');
    this.parts = Object.fromEntries(
      Object.keys(PARTS).map((k) => [k, this.root.querySelector(`[data-part="${k}"]`)]),
    );
    const title = this.parts.title;
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    this.kickerChars = splitChars(title.querySelector('.hero-kicker'));
    this.urlChars = splitChars(this.parts.url.querySelector('.hero-url-text'));
    for (const s of [...this.kickerChars, ...this.urlChars]) s.setAttribute('aria-hidden', 'true');

    const glow = glowTexture();
    const star = starTexture();
    this.gems = { L: new Gem(scene, glow, star), R: new Gem(scene, glow, star) };
    this.time = 0;
  }

  /** Centra el bloque de la portada delante del pecho del robot. */
  layout() {
    _v.copy(ANCHOR).project(this.camera);
    this.stack.style.left = `${((_v.x + 1) / 2) * innerWidth}px`;
    this.stack.style.top = `${((1 - _v.y) / 2) * innerHeight}px`;
  }

  /** Punto 3D, a la misma profundidad que `ref`, que se ve en el centro del elemento. */
  _worldBehind(el, ref, target) {
    const r = el.getBoundingClientRect();
    const cam = this.camera;
    _dir.set(((r.left + r.width / 2) / innerWidth) * 2 - 1, -((r.top + r.height / 2) / innerHeight) * 2 + 1, 0.5);
    _dir.unproject(cam).sub(cam.position).normalize();
    cam.getWorldDirection(_fwd);
    const depth = _v.copy(ref).sub(cam.position).dot(_fwd);
    return target.copy(cam.position).addScaledVector(_dir, depth / _dir.dot(_fwd));
  }

  update(dt) {
    this.time += dt;
    for (const g of Object.values(this.gems)) g.update(this.robot, this.time);
  }

  // ---------------------------------------------------------------- momentos del clip
  /** La mano se cierra en el aire: ahí, de la nada, se enciende la gema. */
  grab(part) {
    const gem = this.gems[PARTS[part].side];
    gem.side = PARTS[part].side;
    gsap.killTweensOf(gem.state);
    gsap
      .timeline()
      .set(gem.state, { power: 0, size: 0 })
      .to(gem.state, { power: 2.4, size: 1.6, duration: 0.09, ease: 'power2.out' })
      .to(gem.state, { power: 1, size: 1, duration: 0.5, ease: 'power2.inOut' });
  }

  /** La suelta: la gema vuela el último tramo hasta su componente, estalla y este se materializa. */
  release(part) {
    const gem = this.gems[PARTS[part].side];
    gem.side = null; // deja de seguir la mano
    const pos = gem.group.position;
    const to = this._worldBehind(this.parts[part], pos, new THREE.Vector3());
    gsap.killTweensOf(gem.state);
    gsap
      .timeline()
      .to(pos, { x: to.x, y: to.y, z: to.z, duration: 0.22, ease: 'power2.inOut' })
      .add(() => {
        this.burstAt(pos);
        this.reveal(part);
      })
      .to(gem.state, { power: 1.7, size: 2.0, duration: 0.08, ease: 'power2.out' }, '<')
      .to(gem.state, { power: 0, size: 3.0, duration: 0.45, ease: 'power2.out' });
  }

  burstAt(worldPos) {
    _v.copy(worldPos).project(this.camera);
    const b = document.createElement('div');
    b.className = 'hero-burst';
    b.style.left = `${((_v.x + 1) / 2) * innerWidth}px`;
    b.style.top = `${((1 - _v.y) / 2) * innerHeight}px`;
    this.root.append(b);
    gsap.fromTo(
      b,
      { scale: 0.4, opacity: 1 },
      { scale: 11, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => b.remove() },
    );
  }

  /** "Desvanecimiento invertido": el componente se arma desde el punto donde se soltó la gema. */
  reveal(part, instant = false) {
    const el = this.parts[part];
    gsap.set(el, { visibility: 'visible' });
    if (instant) return;
    const blurIn = { filter: 'blur(0px)', opacity: 1 };
    if (part === 'icons') {
      const icons = [...el.children];
      const dx = toCenter(icons, el);
      gsap.fromTo(
        icons,
        { x: (i) => dx[i], scale: 0.15, opacity: 0, filter: 'blur(10px)' },
        { x: 0, scale: 1, ...blurIn, duration: 0.85, ease: 'expo.out', stagger: { each: 0.06, from: 'center' } },
      );
    } else if (part === 'title') {
      const dx = toCenter(this.kickerChars, el);
      gsap.fromTo(
        this.kickerChars,
        { x: (i) => dx[i], opacity: 0, filter: 'blur(6px)' },
        { x: 0, ...blurIn, duration: 0.9, ease: 'expo.out', stagger: { each: 0.018, from: 'center' } },
      );
      gsap.fromTo(
        el.querySelector('.hero-name'),
        { clipPath: 'inset(0% 50% 0% 50%)', opacity: 0.3, filter: 'blur(16px)', scale: 0.94 },
        { clipPath: 'inset(0% 0% 0% 0%)', ...blurIn, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.05 },
      );
    } else {
      const chars = this.urlChars;
      const dx = toCenter(chars, el);
      gsap.fromTo(
        chars,
        { x: (i) => dx[i], opacity: 0, filter: 'blur(5px)' },
        { x: 0, ...blurIn, duration: 0.8, ease: 'expo.out', stagger: { each: 0.016, from: 'center' } },
      );
      gsap.fromTo(
        el.querySelector('svg'),
        { scale: 0, rotation: -90, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)', delay: 0.15 },
      );
    }
  }

  /** Todo visible sin animación (prefers-reduced-motion). */
  showAll() {
    for (const k of Object.keys(PARTS)) this.reveal(k, true);
  }

  /** El brazo pasa barriendo: los componentes salen despedidos hacia la izquierda. */
  sweep() {
    const handY = (() => {
      this.robot.gripPosition('L', _v).project(this.camera);
      return ((1 - _v.y) / 2) * innerHeight;
    })();
    for (const el of Object.values(this.parts)) {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - handY) / innerHeight; // lo más cercano a la mano sale antes
      gsap.to(el, {
        x: -(r.right + 120),
        y: (r.top + r.height / 2 - handY) * 0.18,
        rotation: -4 - 6 * Math.random(),
        skewX: 12,
        filter: 'blur(6px)',
        opacity: 0,
        duration: 0.9,
        delay: dist * 0.25,
        ease: 'power3.out',
      });
    }
  }

  finish() {
    this.root.classList.add('is-done');
    for (const g of Object.values(this.gems)) {
      g.state.power = 0;
      g.group.visible = false;
    }
  }
}
