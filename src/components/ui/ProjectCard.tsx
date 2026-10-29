import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { ExampleBadge, Tags } from '@/components/ui/Tag';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content';
import { accent, cn, vars, type Accent } from '@/lib/ui';
import styles from './ProjectCard.module.css';

/** Degradado de dos colores de cada acento (azul → violeta, verde → cian…). */
export const PAIRS: Record<Accent, [Accent, Accent]> = {
  blue: ['blue', 'violet'],
  indigo: ['indigo', 'violet'],
  violet: ['blue', 'violet'],
  green: ['green', 'cyan'],
  mint: ['mint', 'cyan'],
  amber: ['amber', 'coral'],
  coral: ['coral', 'amber'],
  cyan: ['cyan', 'blue'],
};

/** Tarjeta de proyecto: miniatura 16:10, tipo en mono, título, resumen y tecnologías. */
export function ProjectCard({
  project,
  big = false,
  heading: Heading = 'h3',
  labels,
  className,
}: {
  project: Project;
  big?: boolean;
  /** h3 dentro de una sección del Home; h2 en la lista de proyectos (bajo el h1). */
  heading?: 'h2' | 'h3';
  labels: { caseStudy: string; example: string };
  className?: string;
}) {
  const [c1, c2] = PAIRS[project.color];
  return (
    <Card
      as={Link}
      flush
      href={{ pathname: '/proyectos/[slug]', params: { slug: project.slug } }}
      className={cn('grid', big ? styles.wide : 'grid-rows-[auto_1fr]', className)}
      style={vars({ '--c1': accent(c1), '--c2': accent(c2), '--glow': accent(c2, 80) })}
    >
      <div className={styles.media}>
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt=""
            width={project.cover.width}
            height={project.cover.height}
            placeholder={project.cover.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={project.cover.blurDataURL}
            sizes={big ? '(max-width: 980px) 100vw, 680px' : '(max-width: 980px) 100vw, 540px'}
          />
        ) : (
          <Mock seed={project.order} />
        )}
      </div>
      <div className="grid content-start gap-2.5 px-[22px] pt-5 pb-[22px]">
        <div className="font-mono text-[11px] leading-none font-medium tracking-[0.1em] text-(--c1) uppercase">
          {project.kind}
          {project.draft && <ExampleBadge label={labels.example} className="ml-1.5" />}
        </div>
        <Heading
          className={cn('font-bold tracking-[-0.02em]', big ? 'text-[28px]' : 'text-[22px]')}
        >
          {project.title}
        </Heading>
        <p className="text-[15px] text-muted">{project.summary}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <Tags items={project.stack} />
          {big && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg">
              {labels.caseStudy}
              <ArrowUpRight
                aria-hidden
                className="size-3.5 transition-transform duration-350 ease-spring group-hover/card:translate-x-[3px] group-hover/card:-translate-y-[3px]"
              />
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Maqueta abstracta de una app (dos variantes, según el orden del proyecto). */
export function Mock({ seed }: { seed: number }) {
  const even = seed % 2 === 0;
  return (
    <div className={styles.mock} aria-hidden>
      <div className={styles.bar}>
        <i />
        <i />
        <i />
      </div>
      <div className={styles.body}>
        {even ? (
          <>
            <div>
              <span className={styles.hi} />
              <span />
              <span />
              <span />
            </div>
            <div>
              <span className={styles.tall} />
              <span />
              <span className={styles.hi} style={{ width: '60%' }} />
            </div>
          </>
        ) : (
          <>
            <div>
              <span />
              <span className={styles.hi} />
              <span />
            </div>
            <div>
              <span className={styles.hi} style={{ width: '40%' }} />
              <span />
              <span />
              <span className={styles.tall} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
