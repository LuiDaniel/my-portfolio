import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Enlaces y navegación que respetan el idioma y las rutas traducidas: usar estos, no los de next/.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
