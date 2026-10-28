import { icons, type LucideProps } from 'lucide-react';

const pascal = (name: string) =>
  name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase()) as keyof typeof icons;

/** Icono de Lucide por su nombre en kebab-case (el de content/). Solo en Server Components. */
export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Component = icons[pascal(name)];
  if (!Component && process.env.NODE_ENV !== 'production') {
    console.warn(`[Icon] «${name}» no existe en Lucide: se usa un círculo.`);
  }
  const Resolved = Component ?? icons.Circle;
  return <Resolved aria-hidden strokeWidth={1.9} {...props} />;
}
