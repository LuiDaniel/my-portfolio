'use client';

import { Printer } from 'lucide-react';

/** Abre el diálogo de impresión (el CV se imprime solo, en A4 claro: ver styles/print.css). */
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-full px-[22px] py-3.5 text-[15px] font-semibold glass transition-[transform,background-color] duration-[120ms,250ms] ease-out hover:bg-glass-hi active:scale-97"
    >
      {label}
      <Printer aria-hidden className="size-4" />
    </button>
  );
}
