// Antes de las pruebas, visita una a una todas las rutas para que `next dev` las compile. Si varios
// navegadores piden a la vez rutas sin compilar, next dev a veces lee sus propios archivos a medio
// escribir (SyntaxError al parsear JSON) y la página falla.
const ROUTES = [
  '/',
  '/proyectos',
  '/proyectos/este-portafolio',
  '/blog',
  '/blog/robot-3d-blender',
  '/sobre-mi',
  '/cv',
  '/uses',
  '/colofon',
  '/no-existe',
  '/sitemap.xml',
  '/robots.txt',
  '/rss.xml',
  '/opengraph-image',
];

export default async function globalSetup() {
  const base = 'http://localhost:3000';
  for (const route of ROUTES) {
    for (const prefix of route.includes('.') || route === '/opengraph-image' ? [''] : ['', '/en']) {
      const url = base + (prefix && route === '/' ? prefix : prefix + route);
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url, { redirect: 'follow' }).catch(() => null);
        if (res && res.status < 500) break;
      }
    }
  }
}
