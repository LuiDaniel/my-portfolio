import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Card, CardLabel } from '@/components/ui/Card';
import { PAIRS } from '@/components/ui/ProjectCard';
import { ExampleBadge } from '@/components/ui/Tag';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content';
import { accent, cn, vars } from '@/lib/ui';
import styles from './Bento.module.css';

/** Tarjeta ancha: proyecto destacado con su portada (o una miniatura abstracta si no tiene) dentro de
 *  un marco de ventana; toda la tarjeta lleva al caso de estudio. */
export async function BentoFeatured({ project, i }: { project: Project; i: number }) {
  const t = await getTranslations('Home');
  const [c1, c2] = PAIRS[project.color];
  return (
    <Card
      as={Link}
      href={{ pathname: '/proyectos/[slug]', params: { slug: project.slug } }}
      className={cn(
        styles.featured,
        'col-span-2 grid enter-card grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-end gap-[18px] max-sm:col-span-1 max-sm:grid-cols-1',
      )}
      style={vars({ '--i': i, '--c1': accent(c1), '--c2': accent(c2) })}
    >
      <div>
        <CardLabel>
          {t('featured')}
          {project.draft && <ExampleBadge label={t('example')} />}
        </CardLabel>
        <h2 className="mb-1.5 text-[22px] font-bold tracking-[-0.02em]">{project.title}</h2>
        <p className="text-sm text-muted">
          {project.stack.join(' · ')}. {project.summary}
        </p>
        <span className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg">
          {t('caseStudy')}
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform duration-350 ease-spring group-hover/card:translate-x-[3px] group-hover/card:-translate-y-[3px]"
          />
        </span>
      </div>
      <div className={styles.shot} aria-hidden>
        <div className={styles.shotBar}>
          <i />
          <i />
          <i />
        </div>
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt=""
            width={project.cover.width}
            height={project.cover.height}
            placeholder={project.cover.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={project.cover.blurDataURL}
            sizes="(max-width: 640px) 90vw, 360px"
            className={styles.shotImg}
          />
        ) : (
          <div className={styles.shotUi}>
            <div>
              <span />
              <span />
              <span />
            </div>
            <div>
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
