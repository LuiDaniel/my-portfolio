# Portafolio — Luis Daniel

Portafolio personal de un **desarrollador full stack y estudiante de Ingeniería de Sistemas**. La portada es una intro 3D: un robot hecho en Blender despierta, atrapa en el aire las piezas de la cabecera (enlaces, nombre y rol) y las acomoda; al hacer scroll se ilumina, muestra su cuerpo y deja paso al contenido.

> **Estado:** en migración. Hoy el repo contiene el prototipo de la intro en Vite + Three.js. La versión objetivo (Next.js, ES/EN, blog, casos de estudio) está documentada en [`docs/`](docs/) y se construye por fases según el [roadmap](docs/roadmap.md).

## Documentación

| Documento | Contenido |
|---|---|
| [01 · Visión](docs/01-vision.md) | Objetivo, público, mensajes clave y criterios de éxito |
| [02 · Contenido](docs/02-contenido.md) | Mapa del sitio, secciones e inventario de contenido por rellenar |
| [03 · Arquitectura](docs/03-arquitectura.md) | Stack, estructura de carpetas, rutas, i18n, datos y backend |
| [04 · Diseño](docs/04-diseno.md) | Sistema visual: color, tipografía, espaciado, componentes y movimiento |
| [05 · Robot 3D](docs/05-robot-3d.md) | Pipeline Blender → glTF → web e integración de la intro en Next.js |
| [06 · Calidad](docs/06-calidad.md) | Rendimiento, accesibilidad, SEO, pruebas y CI |
| [Roadmap](docs/roadmap.md) | Fases y tareas |
| [ADRs](docs/adr/) | Registro de decisiones de arquitectura |

## Ejecutar (prototipo actual)

Requisitos: Node.js 20+.

```bash
npm install
```

```bash
npm run dev
```

`npm install` copia los decodificadores Draco a `public/draco/` (`scripts/copy-draco.mjs`).

Para regenerar el modelo hace falta Blender 5.1:

```bash
blender -b blender/robot.blend -P blender/export_glb.py
```

## Stack objetivo

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · next-intl · MDX (Velite) · Three.js · GSAP ScrollTrigger · Lenis · Resend · Vitest · Playwright · GitHub Actions · Vercel.

## Licencia

Código bajo licencia MIT (por definir). El modelo 3D, los textos y las imágenes son © Luis Daniel; no se permite reutilizarlos sin permiso.
