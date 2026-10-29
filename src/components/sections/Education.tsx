import { Award } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Card, CardLabel } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';
import { Tags } from '@/components/ui/Tag';
import type { Locale } from '@/i18n/routing';
import { getEducation, getHome } from '@/lib/content';
import { accent, vars, type Accent } from '@/lib/ui';

/** Universidad con barra de avance, certificaciones y logros (las listas vacías se ocultan). */
export async function Education({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home');
  const { education: section } = getHome(locale);
  const edu = getEducation(locale);
  const progress = edu.progress;
  const percent =
    progress && typeof progress.current === 'number' && typeof progress.total === 'number'
      ? Math.round((progress.current / progress.total) * 100)
      : null;
  // Sin certificaciones ni logros, la tarjeta de la universidad ocupa toda la fila.
  const alone = edu.certifications.length === 0 && edu.achievements.length === 0;

  return (
    <section id="education" aria-labelledby="t-edu" className="wrap section-gap">
      <SectionHead id="t-edu" eyebrow={section.eyebrow} title={section.title} color="coral" />
      <div
        className={
          alone
            ? 'grid'
            : 'grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1'
        }
      >
        <Card
          className="reveal max-lg:col-span-full"
          style={{
            background:
              'radial-gradient(120% 120% at 0% 0%, rgb(246 181 90 / .16), transparent 55%), radial-gradient(100% 100% at 100% 100%, rgb(255 125 147 / .12), transparent 60%), var(--color-glass)',
            ...vars({ '--glow': 'rgb(246 181 90 / 0.75)' }),
          }}
        >
          <CardLabel>{t('university')}</CardLabel>
          <h3 className="mb-1 text-[24px] font-bold tracking-[-0.02em]">{edu.degree}</h3>
          <div className="text-muted">
            {edu.university} · {edu.city}
          </div>
          {progress && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[13px] text-muted">
                <span>{t('progress')}</span>
                <span>
                  {progress.unit}{' '}
                  {t('progressOf', {
                    current: String(progress.current),
                    total: String(progress.total),
                  })}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <i
                  className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-amber),var(--color-coral))]"
                  style={{ width: `${percent ?? 60}%` }}
                />
              </div>
            </div>
          )}
          <Tags items={edu.courses} className="mt-[18px]" />
        </Card>

        {edu.certifications.length > 0 && (
          <ListCard label={t('certifications')} glow="blue">
            {edu.certifications.map((c, i) => (
              <ListItem
                key={i}
                color={c.color}
                icon={<Award aria-hidden className="size-4" />}
                title={c.title}
                detail={`${c.issuer} · ${c.year}`}
                href={c.url}
              />
            ))}
          </ListCard>
        )}

        {edu.achievements.length > 0 && (
          <ListCard label={t('achievements')} glow="amber">
            {edu.achievements.map((a, i) => (
              <ListItem
                key={i}
                color={a.color}
                icon={a.icon ? <Icon name={a.icon} className="size-4" /> : <Award aria-hidden />}
                title={a.title}
                detail={`${a.detail} · ${a.year}`}
              />
            ))}
          </ListCard>
        )}
      </div>
    </section>
  );
}

function ListCard({ label, glow, children }: { label: string; glow: Accent; children: ReactNode }) {
  return (
    <Card className="reveal" style={vars({ '--glow': accent(glow, 80) })}>
      <CardLabel>{label}</CardLabel>
      <ul className="grid gap-3">{children}</ul>
    </Card>
  );
}

function ListItem({
  color,
  icon,
  title,
  detail,
  href,
}: {
  color: Accent;
  icon: ReactNode;
  title: string;
  detail: string;
  href?: string;
}) {
  return (
    <li
      className="grid grid-cols-[auto_1fr] items-start gap-3 text-[14.5px]"
      style={vars({ '--c': accent(color) })}
    >
      <span className="grid size-[30px] place-items-center rounded-[9px] bg-[color-mix(in_srgb,var(--c)_18%,transparent)] text-(--c)">
        {icon}
      </span>
      <div>
        <b className="block font-semibold">
          {href && href.startsWith('http') ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
              {title}
            </a>
          ) : (
            title
          )}
        </b>
        <span className="text-[13px] text-faint">{detail}</span>
      </div>
    </li>
  );
}
