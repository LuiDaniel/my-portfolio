import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Sin cacheComponents/partialPrefetching (activos en la plantilla de Next 16.4): la arquitectura
// usa el modelo clásico (SSG + revalidate). Ver docs/adr/0008-sin-cache-components.md.
const nextConfig: NextConfig = {
  experimental: {
    // 404 para peticiones sin idioma (el layout raíz vive en [locale]): app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
