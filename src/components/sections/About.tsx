import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { RichText } from '@/components/ui/RichText';
import { SectionHead } from '@/components/ui/SectionHead';
import type { Locale } from '@/i18n/routing';
import { getHome } from '@/lib/content';
import { accent, vars } from '@/lib/ui';

/** Sobre mí: 2–3 párrafos (el primero más grande) y tres tarjetas de valores. */
export function About({ locale }: { locale: Locale }) {
  const { about } = getHome(locale);
  return (
    <section id="about" aria-labelledby="t-about" className="wrap section-gap">
      <SectionHead
        id="t-about"
        eyebrow={about.eyebrow}
        title={about.title}
        titleSoft={about.titleSoft}
        color="violet"
        more={about.more}
      />
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-[clamp(28px,5vw,72px)] max-md:grid-cols-1">
        <div className="reveal">
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              className="mb-[18px] max-w-[58ch] text-[clamp(18px,1.6vw,21px)] leading-[1.6] text-muted first:text-[clamp(21px,2vw,26px)] first:leading-[1.45] first:tracking-[-0.01em] first:text-fg"
            >
              <RichText text={p} strongClassName="font-semibold text-fg" />
            </p>
          ))}
        </div>
        <div className="grid gap-3">
          {about.values.map((value) => (
            <Card
              key={value.title}
              className="grid reveal grid-cols-[auto_1fr] items-start gap-4"
              style={vars({ '--c': accent(value.color), '--glow': accent(value.color, 80) })}
            >
              <div className="grid size-[42px] place-items-center rounded-[13px] border border-[color-mix(in_srgb,var(--c)_30%,transparent)] bg-[color-mix(in_srgb,var(--c)_18%,transparent)] text-(--c)">
                <Icon name={value.icon} className="size-5" />
              </div>
              <div>
                <h3 className="mb-1 text-[17px] font-bold tracking-[-0.01em]">{value.title}</h3>
                <p className="text-[14.5px] text-muted">{value.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
