# 0007 · Diseño: Apple Design + bento, con `design/home.html` como referencia

- **Estado:** Aceptado
- **Fecha:** 2026-10-28

## Contexto

Se compararon seis enfoques de diseño (skills Apple Design, Emil Kowalski, Frontend Design, Taste, UI/UX Pro Max e Impeccable), con un Home de ejemplo para cada uno (`design/exploracion-estilos.html`). El usuario eligió combinar **Apple Design** y **UI/UX Pro Max**, pidió más color sin perder el índigo/violeta como dominante y aprobó la maqueta resultante.

## Decisión

- Lenguaje visual: **Apple Design** (cristal translúcido, tipografía grande con tracking negativo, respuesta inmediata, curvas sin rebote) + **bento** (tarjetas con información y personalidad propia).
- **Índigo/violeta dominante** sobre casi negro; acentos con significado fijo: verde (GitHub / disponible), ámbar (formación y experiencia), coral (blog), cian (herramientas).
- **`design/home.html` es la fuente de verdad visual** del Home. [04 · Diseño](../04-diseno.md) la traduce a tokens y componentes; si discrepan, gana la maqueta.
- Las páginas interiores se diseñan con el mismo lenguaje, cada una con su maqueta en `design/` aprobada antes de programarla.
- Jerarquía del hero: nombre grande, rol justo debajo; la condición de estudiante va en el bento.

## Alternativas consideradas

- **Solo Apple Design:** sobrio, pero el usuario quería más información y color en la primera pantalla.
- **Frontend Design / Taste:** direcciones más editoriales y de autor; no se eligieron.
- **Impeccable:** útil como revisión, pero desaconseja el degradado azul → violeta, que es parte de la identidad elegida.

## Consecuencias

- Mucho cristal (`backdrop-filter`): hay que vigilar el rendimiento en móviles y respetar `prefers-reduced-transparency`.
- La maqueta usa `--faint` al 42 %; en la implementación sube al 55 % para cumplir contraste AA.
- Las skills `apple-design` y, opcionalmente, `emil-design-eng` sirven de guía al programar las animaciones.
