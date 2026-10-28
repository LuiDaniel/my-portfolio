# Portafolio · Luis Daniel

Portafolio personal de un **desarrollador full stack y estudiante de Ingeniería de Sistemas**, en español e inglés. Empieza con una intro 3D: un robot hecho en Blender despierta, arma la tarjeta de bienvenida con gemas de luz, la aparta y se despide. En su lugar aparece el Home: cristal translúcido, tipografía grande y tarjetas tipo bento, en índigo y violeta.

> **Estado:** fase 1 terminada (base de Next.js con tokens, fuentes, pruebas y CI). El **prototipo de la intro** en Vite + Three.js está en `prototype/`. El resto se construye por fases según el [roadmap](docs/roadmap.md).

## Empezar por aquí

| Para… | Lee |
|---|---|
| Entender el proyecto y las reglas de trabajo | [`CLAUDE.md`](CLAUDE.md) |
| Ver cómo debe quedar el Home | [`design/home.html`](design/home.html) (ábrelo en el navegador) · [`design/README.md`](design/README.md) |
| Saber qué programar y en qué orden | [`docs/roadmap.md`](docs/roadmap.md) |
| Cambiar contenido (proyectos, textos, experiencia…) | [`docs/07-datos.md`](docs/07-datos.md) |

## Documentación

| Documento | Contenido |
|---|---|
| [01 · Visión](docs/01-vision.md) | Objetivo, público, mensajes clave y criterios de éxito |
| [02 · Contenido](docs/02-contenido.md) | Mapa del sitio, secciones del Home, plantillas y datos pendientes |
| [03 · Arquitectura](docs/03-arquitectura.md) | Stack, carpetas, rutas, renderizado, backend y scripts |
| [04 · Diseño](docs/04-diseno.md) | Tokens, componentes, movimiento y correspondencia con la maqueta |
| [05 · Robot 3D](docs/05-robot-3d.md) | Pipeline Blender → glTF → web y coreografía de la intro |
| [06 · Calidad](docs/06-calidad.md) | Rendimiento, accesibilidad, SEO, seguridad y pruebas |
| [07 · Datos](docs/07-datos.md) | Contenido editable en JSON + MDX y recetas |
| [Roadmap](docs/roadmap.md) | Plan de implementación por fases |
| [ADRs](docs/adr/) | Registro de decisiones |

## Desarrollo

Requisitos: Node.js 20.9 o superior (se usa el 24, ver `.nvmrc`). `npm install` copia los decodificadores Draco a `public/draco/`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Web en Next.js → http://localhost:3000 |
| `npm run prototype` | Prototipo de la intro (Vite) → http://localhost:5173 |
| `npm run design` | Maquetas de `design/` → http://localhost:5175/home.html |
| `npm run check` | Lint + formato + tipos + pruebas + build (lo mismo que CI) |
| `npm run test:e2e` | Pruebas E2E con Playwright (la primera vez: `npx playwright install chromium webkit`) |
| `npm run format` | Formatea el código con Prettier |

Variables de entorno: copia `.env.example` a `.env.local` (en desarrollo no hace falta ninguna).

Regenerar el modelo del robot (Blender 5.1):

```bash
blender -b blender/robot.blend -P blender/export_glb.py
```

## Stack objetivo

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · next-intl · Velite (JSON + MDX) · Three.js · GSAP · Resend · Upstash · Vitest · Playwright · GitHub Actions · Vercel.

## Licencia

Código bajo licencia MIT (por confirmar). El modelo 3D, los textos y las imágenes son © Luis Daniel; no se permite reutilizarlos sin permiso.
