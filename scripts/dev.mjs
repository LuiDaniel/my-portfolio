// Desarrollo: un único Velite en modo watch junto a `next dev` (los argumentos van a next dev).
// Velite no se arranca desde next.config porque Next lo carga en varios procesos y dos Velite
// escribiendo .velite/ a la vez dejan JSON a medias. Por lo mismo, next dev espera a que el watcher
// termine su primera compilación: si no, lee archivos de .velite/ mientras se reescriben.
// `predev` ya validó el contenido en modo estricto.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = (path) => fileURLToPath(new URL(`../node_modules/${path}`, import.meta.url));

const velite = spawn(process.execPath, [bin('velite/bin/velite.js'), '--watch'], {
  stdio: ['inherit', 'pipe', 'inherit'],
});

let next = null;
velite.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  if (!next && /build finished/.test(String(chunk))) startNext();
});

function startNext() {
  next = spawn(process.execPath, [bin('next/dist/bin/next'), 'dev', ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
  next.on('exit', (code) => {
    velite.kill();
    process.exit(code ?? 0);
  });
}

const stop = () => {
  velite.kill();
  next?.kill();
};
velite.on('exit', (code) => {
  if (!next) process.exit(code ?? 1); // Velite falló antes de arrancar Next
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
