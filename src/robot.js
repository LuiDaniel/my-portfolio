// Robot 3D: carga del glb, animaciones, ojos LED, neón por regiones, mirada al cursor y pistones.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EyeDisplay } from './eyes.js';

// Orden en que se encienden las líneas de neón al alejarse la cámara (de la cabeza a los pies).
const NEON_REGIONS = ['Head', 'Neck', 'Chest', 'Spine', 'Hips', 'UpperArm', 'Forearm', 'Thigh', 'Shin', 'Foot'];

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _e = new THREE.Euler(0, 0, 0, 'YXZ');

const smooth = (x) => {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

export class Robot {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.eyes = new EyeDisplay();
    this.meshes = [];
    this.neon = [];
    this.pistons = [];
    this.eyeMeshes = [];

    this.eyePower = 0; // 0 = ojos apagados, 1 = encendidos
    this.neonLevel = 0; // 0..1: cuántas regiones de neón están encendidas
    this.look = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, weight: 1 };
    this.blink = { t: 1, next: 2.5 };
    this.autoBlink = true; // parpadeo automático (la intro lo apaga: sus clips ya parpadean)
    this.cues = null; // eventos del clip en curso: { action, last, list: [{ t, fn }] }
    this.pendingExpression = null;
    this.current = null;
    this.busy = false;
    this.chain = Promise.resolve();
  }

  async load(url, onProgress) {
    const draco = new DRACOLoader().setDecoderPath(`${import.meta.env.BASE_URL}draco/`);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    const gltf = await loader.loadAsync(url, (e) => e.total && onProgress?.(e.loaded / e.total));
    draco.dispose();

    this.root = gltf.scene;
    this.group.add(this.root);
    this.clips = Object.fromEntries(gltf.animations.map((c) => [c.name, c]));
    // momentos clave de cada clip (propiedad "events" de la acción en Blender, en segundos)
    this.events = Object.fromEntries(
      (gltf.parser.json.animations ?? []).map((a) => [a.name, a.extras?.events ? JSON.parse(a.extras.events) : {}]),
    );
    this.mixer = new THREE.AnimationMixer(this.root);
    this.bones = {};

    this.root.traverse((o) => {
      if (o.isBone) this.bones[o.name] = o;
      if (!o.isMesh) return;
      this.meshes.push(o);
      if (o.name.endsWith('_Neon')) {
        o.material = o.material.clone(); // cada región con su material para encenderla aparte
        const region = o.name.split('_')[0];
        // intensidad más baja que en Blender: el bloom de la web ya añade el resplandor
        this.neon.push({ mat: o.material, base: o.material.emissiveIntensity * 0.35, idx: NEON_REGIONS.indexOf(region) });
      }
      if (/^Eye_[LR]$/.test(o.name)) this.eyeMeshes.push(o);
    });

    // ojos: textura LED dibujable (expresiones) en lugar de la imagen fija del modelo
    const eyeMat = this.eyeMeshes[0].material.clone();
    this.eyeBase = 2.6; // más bajo que en Blender: aquí el bloom ya añade resplandor
    eyeMat.emissiveMap = this.eyes.texture;
    eyeMat.emissive.set(0xffffff);
    eyeMat.color.set(0x000000);
    for (const m of this.eyeMeshes) m.material = eyeMat;
    this.eyeMat = eyeMat;

    // huesos que giramos a mano (mirada): guardamos su pose base porque algunos clips no tienen
    // pista para ellos y, sin reiniciarlos, el giro se acumularía fotograma a fotograma
    this.lookBones = ['B_Neck', 'B_Head'].map((n) => this.bones[n]).filter(Boolean);
    this.lookRest = this.lookBones.map((b) => b.quaternion.clone());

    this._setupPistons();
    this.update(0, 0);
    return this;
  }

  // ---------------------------------------------------------------- animaciones
  /** Deja el robot quieto en el primer fotograma de un clip (p. ej. encorvado antes de despertar). */
  pose(name) {
    const a = this.mixer.clipAction(this.clips[name]);
    a.reset().setLoop(THREE.LoopOnce, 1).play();
    a.clampWhenFinished = true;
    a.paused = true;
    this.current = a;
    this.mixer.update(0);
  }

  startIdle(fade = 0.6) {
    this.idle ??= this.mixer.clipAction(this.clips.Idle);
    const prev = this.current;
    this.idle.reset().play();
    if (prev && prev !== this.idle) prev.crossFadeTo(this.idle, fade, false);
    this.current = this.idle;
  }

  /** Reproduce un gesto una vez y vuelve al reposo. Devuelve una promesa que se resuelve al terminar.
   *  events: { nombreDelEvento: fn } se llaman cuando el clip pasa por ese momento (ver this.events). */
  play(name, { fade = 0.5, timeScale = 1, events = null } = {}) {
    const clip = this.clips[name];
    if (!clip) return Promise.resolve();
    return new Promise((resolve) => {
      const a = this.mixer.clipAction(clip);
      const prev = this.current;
      if (prev === a) {
        a.paused = false; // gesto que estaba en pausa (pose inicial)
      } else {
        a.reset().setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
        a.play();
        if (prev) prev.crossFadeTo(a, fade, false);
      }
      a.timeScale = timeScale;
      this.current = a;
      this.busy = true;
      if (events) {
        const times = this.events[name] ?? {};
        const list = Object.entries(events)
          .filter(([k]) => k in times)
          .map(([k, fn]) => ({ t: times[k], fn }))
          .sort((x, y) => x.t - y.t);
        this.cues = { action: a, last: a.time - 1e-6, list };
      }
      const done = (e) => {
        if (e.action !== a) return;
        this.mixer.removeEventListener('finished', done);
        this.busy = false;
        this.startIdle(fade);
        resolve();
      };
      this.mixer.addEventListener('finished', done);
    });
  }

  /** Encola un gesto para que empiece cuando termine el anterior. */
  enqueue(name, opts) {
    this.chain = this.chain.then(() => this.play(name, opts));
    return this.chain;
  }

  // ---------------------------------------------------------------- ojos
  setExpression(name) {
    if (this.eyes.name === name || this.pendingExpression === name) return;
    this.pendingExpression = name; // se cambia a mitad de un parpadeo
    this.blink.t = 0;
  }

  // ---------------------------------------------------------------- mirada
  /** Dirige la cabeza hacia un punto de la pantalla (coordenadas NDC, -1..1). */
  lookAtScreen(ndcX, ndcY, camera) {
    const head = this.bones.B_Head;
    if (!head) return;
    head.getWorldPosition(_v1).project(camera);
    this.look.tYaw = THREE.MathUtils.clamp((ndcX - _v1.x) * 0.9, -0.75, 0.75);
    this.look.tPitch = THREE.MathUtils.clamp(-(ndcY - _v1.y) * 0.6, -0.45, 0.35);
  }

  /** Gira un hueso en ejes del mundo (yaw sobre Y, pitch sobre X) sobre su pose animada. */
  _rotateWorld(bone, yaw, pitch) {
    _e.set(pitch, yaw, 0);
    _q1.setFromEuler(_e);
    bone.parent.getWorldQuaternion(_q2);
    const m = _q2.clone().invert().multiply(_q1).multiply(_q2);
    bone.quaternion.premultiply(m);
  }

  // ---------------------------------------------------------------- pistones
  // La camisa cuelga del hueso superior y el vástago del inferior: cada frame apuntan el uno al otro.
  _setupPistons() {
    this.root.updateMatrixWorld(true);
    this.root.traverse((o) => {
      const m = o.isMesh && o.name.match(/^(.*)Sleeve_([LR])$/);
      if (!m) return;
      const rod = this.root.getObjectByName(`${m[1]}Rod_${m[2]}`);
      if (!rod) return;
      for (const [obj, other] of [[o, rod], [rod, o]]) {
        const from = obj.getWorldPosition(new THREE.Vector3());
        const to = other.getWorldPosition(new THREE.Vector3());
        const inv = obj.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
        this.pistons.push({ obj, other, rest: obj.quaternion.clone(), dir: to.sub(from).normalize().applyQuaternion(inv) });
      }
    });
  }

  _updatePistons() {
    for (const p of this.pistons) {
      p.obj.getWorldPosition(_v1);
      p.other.getWorldPosition(_v2);
      p.obj.parent.getWorldQuaternion(_q2).invert();
      _v2.sub(_v1).normalize().applyQuaternion(_q2);
      p.obj.quaternion.setFromUnitVectors(p.dir, _v2).multiply(p.rest);
    }
  }

  // ---------------------------------------------------------------- bucle
  update(dt, time) {
    this.lookBones.forEach((b, i) => b.quaternion.copy(this.lookRest[i]));
    this.mixer.update(dt);
    this._fireCues();

    // mirada (sobre la animación): cuello + cabeza, suavizado
    const L = this.look;
    const k = 1 - Math.exp(-dt * 5);
    L.yaw += (L.tYaw - L.yaw) * k;
    L.pitch += (L.tPitch - L.pitch) * k;
    const w = L.weight * (this.busy ? 0.25 : 1);
    if (this.bones.B_Neck && w > 0) {
      this._rotateWorld(this.bones.B_Neck, L.yaw * 0.35 * w, L.pitch * 0.3 * w);
      this.bones.B_Neck.updateMatrixWorld(true);
      this._rotateWorld(this.bones.B_Head, L.yaw * 0.65 * w, L.pitch * 0.7 * w);
    }

    // parpadeo automático + cambio de expresión a mitad de parpadeo
    const b = this.blink;
    if (this.autoBlink) b.next -= dt;
    if (b.next <= 0 && b.t >= 1) {
      b.t = 0;
      b.next = 2.5 + Math.random() * 3.5;
    }
    let lid = 1;
    if (b.t < 1) {
      b.t = Math.min(1, b.t + dt / 0.18);
      lid = 1 - Math.sin(b.t * Math.PI) * 0.92;
      if (b.t >= 0.5 && this.pendingExpression) {
        this.eyes.draw(this.pendingExpression);
        this.pendingExpression = null;
      }
    }
    for (const m of this.eyeMeshes) m.scale.y = lid;
    this.eyeMat.emissiveIntensity = this.eyeBase * this.eyePower;

    // neón: se enciende por regiones según neonLevel, con un leve "respirar"
    const n = NEON_REGIONS.length;
    const breathe = 0.88 + 0.12 * Math.sin(time * 1.6);
    for (const r of this.neon) {
      const on = smooth(this.neonLevel * (n + 1) - Math.max(0, r.idx));
      r.mat.emissiveIntensity = r.base * on * breathe;
    }

    this.root.updateMatrixWorld(true);
    this._updatePistons();
  }

  _fireCues() {
    const c = this.cues;
    if (!c) return;
    const t = c.action.time;
    for (const cue of c.list) if (cue.t > c.last && cue.t <= t) cue.fn();
    c.last = t;
    if (!c.action.isRunning() && t >= c.action.getClip().duration - 1e-3) this.cues = null;
  }

  /** Posición en el mundo del punto de agarre de una mano ('L' o 'R'), entre pulgar e índice. */
  gripPosition(side, target) {
    return this.bones[`B_Grip_${side}`].getWorldPosition(target);
  }

  hitTest(raycaster) {
    return raycaster.intersectObjects(this.meshes, false).length > 0;
  }
}
