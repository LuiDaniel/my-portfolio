import { notFound } from 'next/navigation';

// Cualquier ruta desconocida dentro de un idioma muestra el 404 traducido de [locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
