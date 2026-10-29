import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Todo menos la API, los internos de Next/Vercel y los archivos con extensión (robot.glb, draco…),
  // salvo /rss.xml, que es el RSS en español (/es/rss.xml por dentro).
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)', '/rss.xml'],
};
