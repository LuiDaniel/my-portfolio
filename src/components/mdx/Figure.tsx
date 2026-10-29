import Image from 'next/image';

/** Imagen con pie: <Figure src="./captura.png" alt="…" caption="…" />. Velite copia la imagen. */
export function Figure({
  src,
  alt,
  caption,
  width = 1600,
  height = 1000,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 980px) 100vw, 760px"
        className="rounded-2xl border border-edge"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-faint">{caption}</figcaption>
      )}
    </figure>
  );
}
