// Desarrollo: un único Velite en modo watch junto a `next dev` (los argumentos van a next dev).
// Velite no se arranca desde next.config porque Next lo carga en varios procesos y dos Velite
// escribiendo .velite/ a la vez dejan JSON a medias. `predev` ya hizo la primera compilación.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bin = (path) => fileURLToPath(new URL(`../node_modules/${path}`, import.meta.url));

const run = (script, args) => spawn(process.execPath, [script, ...args], { stdio: 'inherit' });

const velite = run(bin('velite/bin/velite.js'), ['--watch']);
const next = run(bin('next/dist/bin/next'), ['dev', ...process.argv.slice(2)]);

const stop = () => {
  velite.kill();
  next.kill();
};
next.on('exit', (code) => {
  velite.kill();
  process.exit(code ?? 0);
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
