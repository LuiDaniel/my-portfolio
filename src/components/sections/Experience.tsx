import { getTranslations } from 'next-intl/server';
import { SectionHead } from '@/components/ui/SectionHead';
import { TimelineItem } from '@/components/ui/TimelineItem';
import type { Locale } from '@/i18n/routing';
import { getExperience, getHome } from '@/lib/content';
import { formatPeriod } from '@/lib/format';

/** Línea de tiempo: degradado ámbar → violeta con un nodo del color de cada trabajo. */
export async function Experience({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home');
  const { experience: section } = getHome(locale);
  const jobs = getExperience(locale);
  if (jobs.length === 0) return null;

  return (
    <section id="experience" aria-labelledby="t-exp" className="wrap section-gap">
      <SectionHead
        id="t-exp"
        eyebrow={section.eyebrow}
        title={section.title}
        color="amber"
        more={section.more}
      />
      <div className="relative grid gap-[18px] pl-[34px] before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:rounded-xs before:bg-[linear-gradient(var(--color-amber),var(--color-violet)_55%,rgb(167_123_255/0))] before:content-['']">
        {jobs.map((job) => (
          <TimelineItem
            key={job.id}
            role={job.role}
            org={job.org}
            when={formatPeriod(job.start, job.end, locale, t('today'))}
            current={job.end === null ? t('current') : undefined}
            highlights={job.highlights}
            stack={job.stack}
            color={job.color}
          />
        ))}
      </div>
    </section>
  );
}
