// Copia los decodificadores Draco de three a public/draco (los usa GLTFLoader para robot.glb).
import { cpSync, existsSync } from 'node:fs';

const src = 'node_modules/three/examples/jsm/libs/draco/gltf';
if (existsSync(src)) {
  cpSync(src, 'public/draco', { recursive: true });
  console.log('Draco copiado a public/draco');
}
