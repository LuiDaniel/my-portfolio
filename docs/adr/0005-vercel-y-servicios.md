# 0005 · Vercel + Resend + Upstash para despliegue y backend

- **Estado:** Aceptado
- **Fecha:** 2026-10-16

## Contexto

El sitio necesita hosting con CDN, *previews* por PR y funciones de servidor para el formulario de contacto (envío de email y protección anti-spam). El tráfico esperado es bajo y el presupuesto, idealmente, cero.

## Decisión

- **Vercel** para hosting: producción desde `main` y *preview* por PR. Plan gratuito. Analítica con Vercel Web Analytics y Speed Insights (sin cookies).
- **Resend** para enviar los mensajes del formulario.
- **Upstash Redis** (con `@upstash/ratelimit`) para limitar envíos por IP.

## Alternativas consideradas

- **Netlify / Cloudflare Pages**: válidos, pero con soporte de Next.js menos directo.
- **Servidor propio (VPS)**: más control, pero con mantenimiento y coste que no aportan a un portafolio.
- **Formspree u otros servicios de formularios**: más simple, pero el backend propio es parte de lo que el portafolio demuestra.
- **Umami / Plausible** para analítica: buenas opciones sin cookies. Se puede cambiar más adelante sin afectar al resto.

## Consecuencias

- Las variables de entorno se gestionan en Vercel (`.env.example` documenta cuáles son).
- Si Upstash no está configurado (desarrollo), el límite de envíos se desactiva. Si falta Resend, el mensaje se escribe en consola.
- Cambiar de proveedor de hosting afectaría poco: el sitio es casi todo estático.
