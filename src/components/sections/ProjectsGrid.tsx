'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { ProjectCard } from '@/components/ui/ProjectCard';
import type { Project } from '@/lib/content';
import { cn } from '@/lib/ui';

export type ProjectSummary = Omit<Project, 'body' | 'toc'>;

const chip =
  'cursor-pointer rounded-full border px-3.5 py-[7px] text-[13px] transition-[color,background-color,border-color,transform] duration-200 active:scale-96';
const off = 'border-edge bg-white/4 text-muted hover:bg-white/8 hover:text-fg';
const on = 'border-[color-mix(in_srgb,var(--color-violet)_55%,transparent)] bg-violet/18 text-fg';

/** Lista de proyectos con filtros por tecnología y tipo (sin recargar la página). */
export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const t = useTranslations('Projects');
  const tHome = useTranslations('Home');
  const [tech, setTech] = useState<string | null>(null);
  const [kind, setKind] = useState<string | null>(null);

  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.stack))].sort(), [projects]);
  const kinds = useMemo(() => [...new Set(projects.map((p) => p.kind))], [projects]);
  const shown = projects.filter(
    (p) => (!tech || p.stack.includes(tech)) && (!kind || p.kind === kind),
  );
  const labels = { caseStudy: tHome('caseStudy'), example: tHome('example') };

  const group = (
    label: string,
    values: string[],
    value: string | null,
    set: (v: string | null) => void,
  ) => (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
        {label}
      </span>
      {[null, ...values].map((v) => (
        <button
          key={v ?? 'all'}
          type="button"
          aria-pressed={value === v}
          onClick={() => set(v)}
          className={cn(chip, value === v ? on : off)}
        >
          {v ?? t('all')}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-8 grid gap-3">
        {group(t('tech'), techs, tech, setTech)}
        {kinds.length > 1 && group(t('kind'), kinds, kind, setKind)}
        <p className="text-sm text-faint" aria-live="polite">
          {t('results', { count: shown.length })}
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="text-muted">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          {shown.map((project) => (
            <ProjectCard key={project.slug} project={project as Project} labels={labels} />
          ))}
        </div>
      )}
    </div>
  );
}
