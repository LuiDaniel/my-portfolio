import type { Metadata } from 'next';
import Link from 'next/link';
import es from '@/i18n/messages/es.json';
import en from '@/i18n/messages/en.json';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

// 404 para lo que no pasa por el proxy de idiomas (p. ej. /archivo.txt): no se sabe el idioma,
// así que se muestra en los dos. Next.js no aplica aquí ningún layout.
export const metadata: Metadata = {
  title: `404 · ${es.NotFound.title}`,
};

export default function GlobalNotFound() {
  return (
    <html lang="es" className={fontVariables}>
      <body>
        <main className="wrap grid min-h-dvh content-center justify-items-start gap-4">
          <p className="font-mono text-sm tracking-[0.1em] text-faint">404</p>
          <h1 className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-bold tracking-[-0.04em]">
            {es.NotFound.title}
          </h1>
          <p className="text-muted" lang="en">
            {en.NotFound.title}
          </p>
          <Link
            href="/"
            className="mt-4 rounded-full bg-fg px-5 py-3 text-[15px] font-semibold text-bg transition-transform duration-[120ms] ease-out active:scale-97"
          >
            {es.NotFound.back}
          </Link>
        </main>
      </body>
    </html>
  );
}
