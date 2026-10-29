import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ExampleBadge } from '@/components/ui/Tag';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Post } from '@/lib/content';
import { formatDate } from '@/lib/format';
import { accent, vars, type Accent } from '@/lib/ui';

// Portadas en degradado de la maqueta, por color del artículo.
export const COVERS: Record<Accent, string> = {
  blue: 'linear-gradient(135deg, #3a4fd6, var(--color-blue))',
  indigo: 'linear-gradient(135deg, #3a4fd6, var(--color-indigo))',
  violet: 'linear-gradient(135deg, #3a4fd6, #8a4fe0)',
  green: 'linear-gradient(135deg, #1f9e74, var(--color-green))',
  mint: 'linear-gradient(135deg, #1f9e74, var(--color-cyan))',
  amber: 'linear-gradient(135deg, var(--color-amber), var(--color-coral))',
  coral: 'linear-gradient(135deg, var(--color-coral), var(--color-amber))',
  cyan: 'linear-gradient(135deg, var(--color-cyan), var(--color-blue))',
};

/** Tarjeta de artículo: portada 16:9 con palabra grande e icono, fecha, minutos, título y extracto. */
export function PostCard({
  post,
  locale,
  heading: Heading = 'h3',
  labels,
  className,
}: {
  post: Post;
  locale: Locale;
  /** h3 dentro de una sección del Home; h2 en la lista del blog (bajo el h1). */
  heading?: 'h2' | 'h3';
  labels: { minutes: string; example: string };
  className?: string;
}) {
  return (
    <Card
      as={Link}
      href={{ pathname: '/blog/[slug]', params: { slug: post.slug } }}
      className={`grid content-start gap-3 ${className ?? ''}`}
      style={vars({ '--glow': accent(post.color, 80) })}
    >
      <div
        className="relative aspect-video max-w-full overflow-hidden rounded-2xl"
        style={{ background: COVERS[post.color] }}
      >
        {post.icon && (
          <Icon
            name={post.icon}
            className="absolute -top-2.5 -right-2.5 size-[120px] text-white opacity-25 transition-transform duration-800 ease-spring group-hover/card:scale-110 group-hover/card:-rotate-12"
          />
        )}
        {post.label && (
          <b className="absolute bottom-3 left-4 text-[44px] font-bold tracking-[-0.05em] text-white/90 mix-blend-overlay">
            {post.label}
          </b>
        )}
      </div>
      <div className="flex items-center gap-2.5 font-mono text-xs leading-none font-medium text-faint">
        <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
        <span aria-hidden>·</span>
        <span>{labels.minutes}</span>
        {post.draft && <ExampleBadge label={labels.example} />}
      </div>
      <Heading className="text-[19px] leading-[1.3] font-bold tracking-[-0.01em] text-balance">
        {post.title}
      </Heading>
      <p className="text-[14.5px] text-muted">{post.description}</p>
    </Card>
  );
}
