// Página provisional de la fase 1 (comprueba fondo, tokens y fuentes): se sustituye por el Home
// en las fases 2–4.
export default function Page() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-site content-center gap-4 px-6">
      <p className="font-mono text-xs tracking-[0.1em] text-faint uppercase">Fase 1 · base</p>
      <h1 className="text-6xl font-bold tracking-[-0.045em]">Luis Daniel</h1>
      <p className="animate-sheen bg-(image:--grad) bg-size-[200%_100%] bg-clip-text text-3xl font-semibold text-transparent">
        Desarrollador Full Stack
      </p>
    </main>
  );
}
