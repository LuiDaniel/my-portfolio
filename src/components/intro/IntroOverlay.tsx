'use client';

import { useEffect, useRef, useState } from 'react';
import './intro.css';

// Capa de la intro del robot (docs/05-robot-3d.md#integración-de-la-intro). Su HTML llega del
// servidor, pero solo se ve con <html data-intro="play">: así la pantalla de carga aparece desde el
// primer pintado. Three.js y GSAP se descargan aparte, solo cuando la intro de verdad se reproduce.

export function IntroOverlay({
  kicker,
  title,
  url,
  skipLabel,
}: {
  kicker: string;
  title: string;
  url: string;
  skipLabel: string;
}) {
  const [done, setDone] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const loader = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro !== 'play') return;
    try {
      sessionStorage.setItem('intro-seen', '1');
    } catch {}

    let controller: { skip: () => void; dispose: () => void } | null = null;
    let cancelled = false;
    // El Home entra: se quita el atributo, se ve el contenido y arrancan sus animaciones.
    const showHome = () => {
      delete html.dataset.intro;
      delete html.dataset.introFast;
    };
    // Al terminar se libera la escena: la capa deja de pintarse (devuelve null) pero el componente
    // sigue montado, así que la limpieza del efecto no llegaría a ejecutarse.
    const finish = () => {
      showHome();
      controller?.dispose();
      setDone(true);
    };
    // Antes de que llegue el código 3D, «Saltar» muestra el Home directamente.
    skip.current = () => {
      cancelled = true;
      finish();
    };

    import('@/three/introSequence')
      .then(({ startIntro }) => {
        if (cancelled) return;
        controller = startIntro({
          root: root.current!,
          canvas: canvas.current!,
          fade: fade.current!,
          stage: stage.current!,
          fast: html.dataset.introFast === '1',
          onProgress: (value: number) => {
            if (pct.current) pct.current.textContent = String(value);
          },
          onReady: () => loader.current?.classList.add('is-done'),
          onHome: showHome,
          onDone: finish,
        });
        skip.current = () => controller?.skip();
      })
      .catch((err) => {
        console.error('[intro]', err);
        finish(); // sin WebGL o sin el código de la intro: Home directo
      });

    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip.current();
    addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      removeEventListener('keydown', onKey);
      controller?.dispose();
    };
  }, []);

  if (done) return null;

  return (
    <div id="intro-overlay">
      <div className="intro-stage" ref={stage} aria-hidden>
        <canvas ref={canvas} />
        <div className="stage-fade" ref={fade} />
      </div>

      <div className="intro-loader" ref={loader} aria-hidden>
        <div className="led-eyes">
          <div className="led-eye" />
          <div className="led-eye" />
        </div>
        <p className="loader-pct">
          <span ref={pct}>0</span>%
        </p>
      </div>

      {/* Tarjeta decorativa: el contenido real (nombre, rol, enlaces) está en el Home. */}
      <section className="intro-hero" ref={root} aria-hidden>
        <div className="hero-stack">
          <div className="hero-part hero-icons" data-part="icons">
            <span className="hero-icon">
              <svg viewBox="0 0 24 24">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </span>
            <span className="hero-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </span>
            <span className="hero-icon">
              <svg viewBox="0 0 24 24">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </span>
          </div>
          <div className="hero-part hero-title" data-part="title">
            <span className="hero-kicker">{kicker}</span>
            <span className="hero-name">{title}</span>
          </div>
          <p className="hero-part hero-url" data-part="url">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            <span className="hero-url-text">{url}</span>
          </p>
        </div>
      </section>

      <button type="button" className="intro-skip" onClick={() => skip.current()}>
        {skipLabel}
      </button>
    </div>
  );
}
