import type { NextConfig } from 'next';

// Sin cacheComponents/partialPrefetching (activos en la plantilla de Next 16.4): la arquitectura
// usa el modelo clásico (SSG + revalidate). Ver docs/adr/0008-sin-cache-components.md.
const nextConfig: NextConfig = {};

export default nextConfig;
