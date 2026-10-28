# 0004 · Three.js puro dentro de un componente cliente (sin React Three Fiber)

- **Estado:** Aceptado
- **Fecha:** 2026-10-16

## Contexto

La intro del robot ya funciona en el prototipo con clases de Three.js puras (`Robot`, `Intro`, ojos) orquestadas con GSAP: unas 1 000 líneas probadas, con sincronización fina entre los eventos de los clips de Blender, la cámara y el DOM del Hero. Al pasar a Next.js hay que decidir cómo encajar ese código en React.

## Decisión

- Mantener el código 3D como **Three.js puro** en `src/three/`, independiente de React.
- Montarlo desde un único componente cliente, `RobotStage`, cargado con `next/dynamic` y `ssr: false`. El componente crea la escena al montarse y la libera por completo al desmontarse.
- El texto del Hero lo renderiza el servidor. El código 3D solo lo anima (lo encuentra por `data-part`).

## Alternativas consideradas

- **React Three Fiber + drei**: más idiomático en React, pero obliga a reescribir código que ya funciona, y la orquestación por tiempo con GSAP encaja peor en el modelo declarativo. Se puede reconsiderar si el 3D crece mucho.
- **Renderizar el Hero desde el código 3D** (como en el prototipo): perdería SEO, accesibilidad y el LCP en texto.

## Consecuencias

- La migración es casi un traslado: primero en JS (`allowJs`) y después se tipa.
- La limpieza (`dispose`, `gsap.context().revert()`, listeners, ScrollTriggers) es responsabilidad explícita de `RobotStage`. Se prueba navegando entre páginas y con el doble montaje de React en desarrollo.
- Three.js y GSAP solo se descargan en la portada.
