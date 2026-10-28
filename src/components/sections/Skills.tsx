import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Locale } from '@/i18n/routing';
import { getHome, getSkills } from '@/lib/content';
import { accent, cn, vars } from '@/lib/ui';

type Level = 'daily' | 'experienced' | 'learning';

// Relleno (a diario), borde (con experiencia) y discontinuo (aprendiendo).
const CHIP: Record<Level, string> = {
  daily:
    'border border-[color-mix(in_srgb,var(--c)_45%,transparent)] bg-[color-mix(in_srgb,var(--c)_22%,transparent)] text-fg',
  experienced: 'border border-[color-mix(in_srgb,var(--c)_40%,transparent)] text-muted',
  learning: 'border border-dashed border-white/22 text-faint',
};

const SWATCH: Record<Level, string> = {
  daily: 'bg-indigo',
  experienced: 'border-[1.5px] border-indigo',
  learning: 'border-[1.5px] border-dashed border-faint',
};

/** Habilidades por área con tres niveles, y su leyenda en texto (no solo estilo). */
export async function Skills({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home.levels');
  const { skills: section } = getHome(locale);
  const { areas } = getSkills(locale);
  const levels: Level[] = ['daily', 'experienced', 'learning'];

  return (
    <section id="skills" aria-labelledby="t-skills" className="wrap section-gap">
      <SectionHead
        id="t-skills"
        eyebrow={section.eyebrow}
        title={section.title}
        color="cyan"
        aside={
          <ul className="flex flex-wrap gap-4 text-[13px] text-muted">
            {levels.map((level) => (
              <li key={level} className="inline-flex items-center gap-2">
                <i
                  aria-hidden
                  className={cn('inline-block h-2.5 w-[22px] rounded-full', SWATCH[level])}
                />
                {t(level)}
              </li>
            ))}
          </ul>
        }
      />
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {areas.map((area) => (
          <Card
            key={area.id}
            className="reveal"
            style={vars({ '--c': accent(area.color), '--glow': accent(area.color, 80) })}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-[38px] place-items-center rounded-xl border border-[color-mix(in_srgb,var(--c)_30%,transparent)] bg-[color-mix(in_srgb,var(--c)_16%,transparent)] text-(--c)">
                <Icon name={area.icon} className="size-[19px]" />
              </div>
              <h3 className="text-[17px] font-bold">{area.title}</h3>
            </div>
            <ul className="flex flex-wrap gap-[7px]">
              {area.items.map((item) => (
                <li
                  key={item.name}
                  className={cn(
                    'rounded-full px-[11px] py-1.5 text-[13px] transition-transform duration-350 ease-spring hover:-translate-y-0.5',
                    CHIP[item.level],
                  )}
                >
                  {item.name}
                  <span className="sr-only"> ({t(item.level)})</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
