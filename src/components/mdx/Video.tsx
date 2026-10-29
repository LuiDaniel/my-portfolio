/** Vídeo corto sin sonido (demo de un proyecto): <Video src="./demo.mp4" caption="…" />. */
export function Video({
  src,
  caption,
  poster,
}: {
  src: string;
  caption?: string;
  poster?: string;
}) {
  return (
    <figure className="my-8">
      <video
        src={src}
        poster={poster}
        controls
        muted
        playsInline
        preload="metadata"
        className="w-full rounded-2xl border border-edge"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-faint">{caption}</figcaption>
      )}
    </figure>
  );
}
