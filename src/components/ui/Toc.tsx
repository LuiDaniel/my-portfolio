type TocEntry = { title: string; url: string; items: TocEntry[] };

/** Tabla de contenidos (de los h2/h3 del MDX) en una columna fija al lado del texto. */
export function Toc({ items, label }: { items: TocEntry[]; label: string }) {
  if (items.length < 2) return null;
  return (
    <nav aria-label={label} className="sticky top-28 max-lg:hidden">
      <p className="mb-3.5 font-mono text-[11px] leading-none font-medium tracking-[0.1em] text-faint uppercase">
        {label}
      </p>
      <ol className="grid gap-2 border-l border-edge text-sm">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className="-ml-px block border-l border-transparent pl-4 text-muted transition-colors hover:border-violet hover:text-fg"
            >
              {item.title}
            </a>
            {item.items.length > 0 && (
              <ol className="mt-2 grid gap-2 pl-4">
                {item.items.map((sub) => (
                  <li key={sub.url}>
                    <a href={sub.url} className="block pl-4 text-faint hover:text-fg">
                      {sub.title}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
