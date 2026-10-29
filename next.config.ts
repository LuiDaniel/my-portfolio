import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const production = process.env.NODE_ENV === 'production';

// Content-Security-Policy (docs/06-calidad.md#seguridad). Sitio estático sin nonce: los scripts en
// línea (el de <head> de la intro y los de Next) necesitan 'unsafe-inline'; el decodificador Draco
// del robot necesita 'wasm-unsafe-eval'. Sin 'unsafe-eval' en producción.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  ...(production ? [{ key: 'Content-Security-Policy', value: csp }] : []),
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

// Sin cacheComponents/partialPrefetching (activos en la plantilla de Next 16.4): la arquitectura
// usa el modelo clásico (SSG + revalidate). Ver docs/adr/0008-sin-cache-components.md.
// Velite (content/ → .velite/) se ejecuta desde los scripts de npm, no desde aquí: ver scripts/dev.mjs.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // 404 para peticiones sin idioma (el layout raíz vive en [locale]): app/global-not-found.tsx.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
