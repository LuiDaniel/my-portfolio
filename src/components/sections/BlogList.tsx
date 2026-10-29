'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { PostCard } from '@/components/ui/PostCard';
import type { Locale } from '@/i18n/routing';
import type { Post } from '@/lib/content';
import { cn } from '@/lib/ui';

export type PostSummary = Omit<Post, 'body' | 'toc'>;

const chip =
  'cursor-pointer rounded-full border px-3.5 py-[7px] text-[13px] transition-[color,background-color,border-color,transform] duration-200 active:scale-96';
const off = 'border-edge bg-white/4 text-muted hover:bg-white/8 hover:text-fg';
const on = 'border-[color-mix(in_srgb,var(--color-coral)_55%,transparent)] bg-coral/16 text-fg';

/** Artículos del idioma con filtro por etiqueta. */
export function BlogList({ posts }: { posts: PostSummary[] }) {
  const t = useTranslations('Blog');
  const tHome = useTranslations('Home');
  const locale = useLocale() as Locale;
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);
  const shown = posts.filter((p) => !tag || p.tags.includes(tag));

  return (
    <div>
      {tags.length > 0 && (
        <div role="group" aria-label={t('tags')} className="mb-8 flex flex-wrap items-center gap-2">
          {[null, ...tags].map((v) => (
            <button
              key={v ?? 'all'}
              type="button"
              aria-pressed={tag === v}
              onClick={() => setTag(v)}
              className={cn(chip, tag === v ? on : off)}
            >
              {v ?? t('all')}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="text-muted">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
          {shown.map((post) => (
            <PostCard
              key={post.slug}
              post={post as Post}
              locale={locale}
              heading="h2"
              labels={{
                minutes: tHome('minutes', { minutes: post.metadata.readingTime }),
                example: tHome('example'),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
