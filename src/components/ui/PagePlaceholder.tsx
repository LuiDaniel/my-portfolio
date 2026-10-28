// Provisional (fase 2): cabecera de las páginas que aún no tienen diseño. Se retira en la fase 6.
export function PagePlaceholder({
  title,
  detail,
  note,
}: {
  title: string;
  detail?: string;
  note: string;
}) {
  return (
    <main className="wrap grid min-h-[70dvh] content-center gap-4 pt-32">
      <h1 className="text-[clamp(34px,4.6vw,56px)] leading-[1.02] font-bold tracking-[-0.04em]">
        {title}
      </h1>
      {detail && <p className="font-mono text-sm text-faint">{detail}</p>}
      <p className="text-muted">{note}</p>
    </main>
  );
}
