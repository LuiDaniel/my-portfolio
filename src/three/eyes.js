// Ojos de matriz LED: cada punto del modelo lee un píxel de esta textura de 10 x 6.
// Dibujar un patrón aquí = cambiar la expresión del robot.
import * as THREE from 'three';

import { COLS, OFF, ON, PATTERNS, ROWS } from './patterns.js';

export { COLS, ROWS, PATTERNS };

export class EyeDisplay {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = COLS;
    this.canvas.height = ROWS;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false; // misma convención de UV que glTF
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.name = null;
    this.draw('normal');
  }

  draw(name) {
    const rows = PATTERNS[name] ?? PATTERNS.normal;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.ctx.fillStyle = rows[r][c] === '#' ? ON[r] : OFF;
        this.ctx.fillRect(c, r, 1, 1);
      }
    }
    this.texture.needsUpdate = true;
    this.name = name;
  }
}
