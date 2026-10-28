# 06 · Calidad

El portafolio también es una muestra de cómo trabajas, así que la calidad se mide y se comprueba en CI.

## Presupuestos de rendimiento

| Métrica (móvil, 4G simulada) | Portada | Resto de páginas |
|---|---|---|
| LCP | ≤ 2,5 s | ≤ 1,8 s |
| CLS | ≤ 0,05 | ≤ 0,05 |
| INP | ≤ 200 ms | ≤ 200 ms |
| Lighthouse rendimiento | ≥ 85 | ≥ 95 |
| JS inicial (gzip) | ≤ 200 KB (Three.js se carga aparte, tras el HTML) | ≤ 100 KB |
| Modelo `.glb` | ≤ 3 MB (hoy ~0,8 MB) | — |

Prácticas:
- Server Components por defecto. `'use client'` solo en el robot, el menú móvil, el formulario y el selector de idioma.
- Three.js, GSAP y el modelo **solo en la portada**, cargados de forma diferida (`next/dynamic`).
- El LCP de la portada es texto del Home, que viene en el HTML; la intro 3D no lo bloquea y se libera (`dispose`) al terminar.
- `next/image` (AVIF/WebP, `sizes`) y `next/font` (autoalojadas, `display: swap`).
- Páginas estáticas servidas desde el CDN de Vercel.

## Accesibilidad (WCAG 2.2 AA)

- HTML semántico: `header`, `nav`, `main`, `section` con encabezado, `footer`. Un solo `h1` por página.
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Todo se puede usar con teclado y con foco visible ([04 · Diseño](04-diseno.md#accesibilidad-visual)). `Esc` salta la intro.
- El canvas 3D lleva `aria-hidden="true"`: es decorativo y la información está en el HTML.
- La intro es decorativa (`aria-hidden`, salvo "Saltar intro"); el Home se lee completo con lector de pantalla desde el inicio. Las letras partidas para animar llevan `aria-hidden` y el contenedor su `aria-label`.
- `prefers-reduced-motion` respetado en todo (intro, scroll suave, apariciones).
- Formulario: `label` visibles, errores asociados con `aria-describedby` y anunciados con `aria-live`.
- `lang` correcto por idioma, y `hreflang` entre versiones.
- Contraste AA mínimo, verificado con axe.

## SEO

- `metadata` por página: título (`%s · Luis Daniel`), descripción, `canonical`, `alternates.languages`.
- Open Graph y Twitter Card con imagen generada por página (`opengraph-image.tsx`): nombre, título y estilo del sitio.
- JSON-LD: `Person` (portada y sobre mí), `Article` (blog), `CreativeWork`/`SoftwareSourceCode` (proyectos), `BreadcrumbList`.
- `sitemap.xml` con ambos idiomas, `robots.txt` y RSS por idioma.
- URLs legibles y traducidas, sin parámetros.

## Seguridad

- Cabeceras en `next.config.ts`: `Content-Security-Policy` (sin `unsafe-eval` en producción), `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Formulario: validación en servidor con Zod, honeypot, límite de envíos por IP y sin exponer el email de destino.
- Secretos solo en variables de entorno de Vercel; `.env.example` sin valores.
- Dependencias revisadas con Dependabot (actualizaciones semanales agrupadas) y `npm audit` en CI.

## Pruebas

| Tipo | Herramienta | Qué cubre |
|---|---|---|
| Tipos | `tsc --noEmit` | Todo |
| Lint / formato | ESLint (next, a11y, import) + Prettier | Todo |
| Unitarias | Vitest | Utilidades (fechas, tiempo de lectura, `rich-text`), validación del formulario, **paridad de claves** entre `es.json` y `en.json` |
| Contenido | Vitest sobre `src/lib/content.ts` | Todo `Texto` tiene `es` y `en`; `featuredProject` existe; cada proyecto destacado tiene `es.mdx` y `en.mdx`; colores e iconos válidos; slugs únicos; ningún `[pendiente]` en contenido publicable |
| E2E | Playwright (Chromium + WebKit móvil) | Navegación y selector de idioma; la intro termina sola (sin scroll) y deja el Home visible y animado; "Saltar intro"; la visita repetida no repite la intro; `prefers-reduced-motion` muestra la portada armada; envío del formulario (con Resend simulado); 404 |
| Accesibilidad | `@axe-core/playwright` | Cada página en ambos idiomas, sin violaciones serias ni críticas |
| Rendimiento | Lighthouse CI | Presupuestos de la tabla de arriba sobre el *preview* |

La intro se prueba de forma determinista: en E2E se fuerza un modo rápido (`?intro=fast`, solo disponible fuera de producción) que acelera las timelines.

## CI/CD

```
PR ──► GitHub Actions: install → lint → typecheck → test → build → e2e (+ axe)   (en local: npm run check)
   └─► Vercel: deploy de preview ──► Lighthouse CI sobre el preview (comenta en el PR)
main ──► Vercel: producción
```

- `main` protegida: se exige CI en verde para hacer merge.
- Cada PR describe el cambio y, si es visual, incluye una captura.

## Lista de comprobación antes de publicar

- [ ] Sin `[pendiente]` ni contenido `draft` visible en producción (la prueba de contenido pasa).
- [ ] Ambos idiomas completos (test de paridad en verde).
- [ ] PDFs del CV regenerados (`npm run cv`).
- [ ] Imágenes OG revisadas en las páginas principales.
- [ ] Home comparado con `design/home.html` a 1440, 1024 y 390 px.
- [ ] Lighthouse y axe en verde.
- [ ] Probado en un móvil real (iOS y Android): intro, giroscopio y rendimiento.
- [ ] Formulario probado en producción.
- [ ] Dominio, HTTPS y redirecciones (`www` → raíz) configurados.
