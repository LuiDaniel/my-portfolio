import { Link } from '@/i18n/navigation';

// Logo circular con las iniciales en el degradado de marca. Lleva al inicio.
export function Logo({
  initials,
  label,
  className = '',
}: {
  initials: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${initials} · ${label}`}
      className={`grid size-[34px] shrink-0 place-items-center rounded-full bg-(image:--grad) text-[13px] font-bold tracking-[-0.02em] text-white ${className}`}
    >
      {initials}
    </Link>
  );
}
