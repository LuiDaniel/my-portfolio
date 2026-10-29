import { getTranslations } from 'next-intl/server';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { RichText } from '@/components/ui/RichText';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { Locale } from '@/i18n/routing';
import {
  getEducation,
  getFeaturedProject,
  getHome,
  getProfile,
  getSkills,
  isPending,
} from '@/lib/content';
import { getContributions } from '@/lib/github';
import { navHref } from '@/lib/nav';
import { vars } from '@/lib/ui';
import { BentoClock } from './hero/BentoClock';
import { BentoEducation } from './hero/BentoEducation';
import { BentoFeatured } from './hero/BentoFeatured';
import { BentoGithub } from './hero/BentoGithub';
import { BentoStack } from './hero/BentoStack';

const production = process.env.NODE_ENV === 'production';

/** Portada: nombre, rol, frase de valor, botones y redes a la izquierda; bento a la derecha. */
export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('Home');
  const profile = getProfile(locale);
  const { hero } = getHome(locale);
  const skills = getSkills(locale);
  const education = getEducation(locale);
  const featured = getFeaturedProject(locale);
  const github = hero.bento.showGithub ? await getContributions(profile.github.username) : null;

  // Redes sin dirección todavía: en desarrollo se ven (para el diseño), en producción no.
  const socials = profile.socials.filter((s) => !production || !isPending(s.url));
  const place = [profile.location.city, profile.location.country, profile.workModes]
    .filter((part) => !production || !isPending(part))
    .join(' · ');

  // Tarjetas pequeñas del bento (2 columnas): si quedan impares, la última ocupa el ancho.
  const small = ['stack', github && 'github', 'education', hero.bento.showClock && 'clock'].filter(
    Boolean,
  );
  const wide = (id: string) => small.length % 2 === 1 && small.at(-1) === id;
  let card = featured ? 1 : 0;

  return (
    <section
      id="inicio"
      aria-labelledby="hero-name"
      className="relative z-1 mx-auto grid min-h-[max(100vh,720px)] max-w-site grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center gap-[clamp(32px,5vw,80px)] pt-[120px] pr-(--pad-r) pb-24 pl-(--pad-l) max-md:min-h-0 max-md:grid-cols-1 max-md:items-start max-md:pt-[110px] max-md:pb-20"
    >
      <div>
        {profile.status.available && (
          <div
            className="mb-7 inline-flex enter-text items-center gap-2.5 rounded-full py-[7px] pr-3.5 pl-2.5 text-[13px] text-muted glass"
            style={vars({ '--i': 0 })}
          >
            <i
              aria-hidden
              className="relative size-2 rounded-full bg-mint after:absolute after:inset-0 after:animate-pulse after:rounded-full after:bg-mint after:content-['']"
            />
            {profile.status.label}
          </div>
        )}
        <h1
          id="hero-name"
          className="enter-text text-[clamp(52px,8.4vw,112px)] leading-[0.98] font-bold tracking-[-0.045em] text-balance"
          style={vars({ '--i': 1 })}
        >
          {profile.name}
        </h1>
        {/* Entrada y brillo en elementos distintos: dos animaciones en el mismo se pisan. */}
        <p
          className="mt-3.5 enter-text text-[clamp(26px,3.4vw,44px)] leading-[1.1] font-semibold tracking-[-0.03em]"
          style={vars({ '--i': 2 })}
        >
          <span className="animate-sheen bg-(image:--grad) bg-size-[200%_100%] bg-clip-text text-transparent">
            {profile.role}
          </span>
        </p>
        <p
          className="mt-[22px] max-w-[46ch] enter-text text-[clamp(17px,1.35vw,19px)] leading-[1.6] text-muted"
          style={vars({ '--i': 3 })}
        >
          <RichText text={profile.tagline} strongClassName="font-medium text-fg" />
        </p>
        <div className="mt-[34px] flex enter-text flex-wrap gap-3" style={vars({ '--i': 4 })}>
          <ButtonLink href={navHref(hero.primaryCta)}>{hero.primaryCta.label}</ButtonLink>
          <ButtonAnchor href={profile.cv} download>
            {hero.secondaryCta.label}
          </ButtonAnchor>
        </div>
        <div className="mt-[30px] flex enter-text items-center gap-3" style={vars({ '--i': 5 })}>
          <span className="mr-1.5 font-mono text-xs leading-none font-medium tracking-[0.08em] text-faint uppercase">
            {t('findMe')}
          </span>
          {socials.map((s) => (
            <SocialIcon
              key={s.id}
              id={s.id}
              label={s.label}
              url={isPending(s.url) ? '#pendiente' : s.url}
            />
          ))}
          <SocialIcon id="email" label="Email" email={profile.email} />
        </div>
      </div>

      <div
        aria-label={t('summary')}
        role="group"
        className="grid auto-rows-[minmax(150px,auto)] grid-cols-2 gap-3.5 max-sm:grid-cols-1"
      >
        {featured && <BentoFeatured project={featured} i={0} />}
        <BentoStack items={skills.featured} i={card++} wide={wide('stack')} />
        {github && <BentoGithub data={github} i={card++} />}
        <BentoEducation
          degree={education.degree}
          status={education.status}
          university={education.university}
          i={card++}
        />
        {hero.bento.showClock && (
          <BentoClock
            timeZone={isPending(profile.location.timezone) ? undefined : profile.location.timezone}
            place={place}
            i={card++}
            wide={wide('clock')}
          />
        )}
      </div>

      <div
        aria-hidden
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 font-mono text-[11px] leading-none font-medium tracking-[0.2em] text-faint uppercase max-md:hidden"
      >
        <span className="relative h-[34px] w-[22px] rounded-xl border-[1.5px] border-faint after:absolute after:top-[7px] after:left-1/2 after:h-[7px] after:w-[3px] after:-translate-x-1/2 after:animate-wheel after:rounded-xs after:bg-fg after:content-['']" />
        {t('scroll')}
      </div>
    </section>
  );
}
