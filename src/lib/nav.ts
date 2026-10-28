import type { Pathname } from '@/i18n/routing';

// Enlace interno de los datos ({ route, section? }) → href de next-intl (sección = ancla del Home).
export function navHref<P extends Pathname>(item: { route: P; section?: string }) {
  return item.section ? { pathname: item.route, hash: item.section } : item.route;
}
