# 01 · Visión

## Objetivo

Un portafolio personal que sirva para **postular a empleos de ingeniería de software**: puestos junior, pero con la profundidad suficiente para competir por puestos semi-senior y senior. No busca clientes (para eso ya existe Dietrim, la página freelance).

El portafolio debe responder en pocos segundos a las tres preguntas de quien lo visita:

1. **¿Quién es?** Luis Daniel, desarrollador full stack, estudiante de Ingeniería de Sistemas.
2. **¿Qué sabe hacer y con qué nivel?** Casos de estudio con decisiones técnicas, resultados y código.
3. **¿Cómo lo contacto?** CV, LinkedIn, GitHub y email a un clic desde cualquier página.

## Público

| Público | Qué busca | Cuánto tiempo dedica | Qué le damos |
|---|---|---|---|
| Reclutador no técnico | Nombre, rol, ubicación, idiomas, disponibilidad, CV | 10–30 s | Home claro, botón de CV, estado "Abierto a oportunidades" |
| Ingeniero / líder técnico que entrevista | Criterio técnico, calidad del código, profundidad | 3–10 min | Casos de estudio con arquitectura y *trade-offs*, repos, blog, el código del propio portafolio |
| Comunidad / pares | Ideas, artículos, proyectos abiertos | Variable | Blog con RSS, open source |

## Qué significa "nivel senior" aquí

No se trata de exagerar el título, sino de **demostrar criterio**:

- **Casos de estudio, no tarjetas.** Cada proyecto explica el problema, el rol, la arquitectura, las decisiones y sus alternativas, los resultados medibles y lo aprendido.
- **Evidencia verificable.** Demos en vivo, repositorios, métricas, pruebas.
- **Escritura técnica.** Un blog con artículos propios desde el lanzamiento.
- **El portafolio como prueba.** Rápido, accesible, bilingüe, con pruebas, CI y ADRs. Su repositorio es público y se puede inspeccionar.
- **Honestidad.** Niveles de habilidad realistas, sin barras de porcentaje ni listas infinitas de tecnologías.

## Mensajes clave

- Full stack de verdad: frontend cuidado, backend sólido, datos y despliegue.
- Base de ingeniería: fundamentos de sistemas, no solo frameworks.
- Atención al detalle y creatividad técnica: el robot 3D, hecho a mano en Blender y animado en la web, es la firma del sitio.
- Aprende rápido y comparte lo que aprende (blog).

## Posicionamiento de Dietrim

Aparece como **experiencia freelance** en la línea de tiempo y, si el material lo permite, como caso de estudio. Los llamados a la acción del sitio se dirigen a empleadores (CV, LinkedIn, email), nunca a "contrátame para tu proyecto".

## Idiomas

Español (por defecto) e inglés, con contenido equivalente en ambos. El inglés abre la puerta a puestos remotos internacionales.

## Criterios de éxito

- En la portada, el nombre, el rol y los enlaces (Home) son visibles y clicables en **≈ 12 s** en la primera visita (la intro de bienvenida va antes), y al instante en las siguientes o con "Saltar intro", que está visible durante toda la intro.
- Lighthouse ≥ 95 en rendimiento y 100 en accesibilidad, buenas prácticas y SEO en las páginas de contenido. Ver [06 · Calidad](06-calidad.md).
- 3–4 casos de estudio completos y 3–4 artículos publicados en el lanzamiento, en ambos idiomas.
- CV en PDF (ES/EN) generado con los mismos datos que el sitio, sin duplicar información.
- Formulario de contacto funcionando, con protección anti-spam.

## Fuera de alcance

- Venta de servicios, precios o formularios de presupuesto.
- Panel de administración o CMS: el contenido vive en el repositorio (`content/`: JSON + MDX).
- Comentarios en el blog (se puede reconsiderar más adelante).
