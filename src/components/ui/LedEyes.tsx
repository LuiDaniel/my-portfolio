import { COLS, ON, PATTERNS, ROWS } from '@/three/patterns.js';

type Expression = keyof typeof PATTERNS;

/** Los ojos LED del robot en 2D (sin Three.js), con el degradado azul → violeta por filas. */
export function LedEyes({ expression = 'normal' }: { expression?: Expression }) {
  const rows = PATTERNS[expression];
  const eye = (key: string) => (
    <div
      key={key}
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${COLS}, 6px)`,
        gridTemplateRows: `repeat(${ROWS}, 6px)`,
      }}
    >
      {rows.flatMap((row, r) =>
        [...row].map((cell, c) => (
          <i
            key={`${r}-${c}`}
            className="rounded-full"
            style={{ background: cell === '#' ? ON[r] : 'rgb(255 255 255 / 0.04)' }}
          />
        )),
      )}
    </div>
  );
  return (
    <div
      aria-hidden
      className="flex gap-[30px] drop-shadow-[0_0_10px_rgb(110_120_255/0.7)] motion-safe:animate-[led-blink_3.2s_infinite]"
    >
      {eye('l')}
      {eye('r')}
    </div>
  );
}
