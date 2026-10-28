import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Todo menos la API, los internos de Next/Vercel y los archivos con extensión (robot.glb, draco…).
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
