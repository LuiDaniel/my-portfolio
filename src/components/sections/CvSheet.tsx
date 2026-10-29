import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/routing';
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSite,
  getSkills,
  isPending,
} from '@/lib/content';
import { formatPeriod } from '@/lib/format';
import { plainText } from '@/lib/rich-text';

const production = process.env.NODE_ENV === 'production';
const known = (value: string) => !production || !isPending(value);

/** El CV en una hoja A4 clara: perfil, experiencia, proyectos, formación y habilidades. */
export async function CvSheet({ locale }: { locale: Locale }) {
  const t = await getTranslations();
  const profile = getProfile(locale);
  const site = getSite(locale);
  const jobs = getExperience(locale);
  const projects = getProjects(locale, { featured: true });
  const edu = getEducation(locale);
  const { areas } = getSkills(locale);

  const contact = [
    profile.email,
    [profile.location.city, profile.location.country].join(', '),
    ...profile.socials.map((s) => s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')),
    site.url.replace(/^https?:\/\//, ''),
  ].filter(known);
  const certifications = edu.certifications.filter((c) => known(c.title));
  const achievements = edu.achievements.filter((a) => known(a.title));

  return (
    <article className="cv-sheet mx-auto max-w-[820px] rounded-[18px] bg-paper px-[clamp(24px,5vw,56px)] py-[clamp(28px,5vw,52px)] text-[13.5px] leading-[1.5] text-ink shadow-[0_30px_80px_rgb(0_0_0/0.45)] print:text-[11.5px]">
      <header className="border-b-2 border-blue pb-4">
        <h2 className="text-[30px] leading-tight font-bold tracking-[-0.03em] print:text-[24px]">
          {profile.fullName}
        </h2>
        <p className="mt-0.5 text-[16px] font-semibold text-ink-accent">{profile.role}</p>
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-ink-muted">
          {contact.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </p>
      </header>

      <CvSection title={t('CV.profile')}>
        <p>{plainText(profile.tagline)}</p>
      </CvSection>

      {jobs.length > 0 && (
        <CvSection title={t('CV.experience')}>
          {jobs.map((job) => (
            <div key={job.id} className="break-inside-avoid">
              <div className="flex flex-wrap justify-between gap-x-4">
                <h4 className="font-bold">
                  {job.role} <span className="font-normal text-ink-muted">· {job.org}</span>
                </h4>
                <span className="font-mono text-[11.5px] text-ink-muted">
                  {formatPeriod(job.start, job.end, locale, t('Home.today'))}
                </span>
              </div>
              <ul className="mt-1 list-disc pl-5 marker:text-ink-faint">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </CvSection>
      )}

      {projects.length > 0 && (
        <CvSection title={t('CV.projects')}>
          {projects.map((p) => (
            <div key={p.slug} className="break-inside-avoid">
              <h4 className="font-bold">
                {p.title} <span className="font-normal text-ink-muted">· {p.stack.join(', ')}</span>
              </h4>
              <p>{p.summary}</p>
            </div>
          ))}
        </CvSection>
      )}

      <CvSection title={t('CV.education')}>
        <div className="flex flex-wrap justify-between gap-x-4">
          <h4 className="font-bold">
            {edu.degree} <span className="font-normal text-ink-muted">· {edu.university}</span>
          </h4>
          <span className="text-ink-muted">{edu.status}</span>
        </div>
        {edu.previous.map((p) => (
          <div key={p.institution}>
            <h4 className="font-bold">
              {p.degree} <span className="font-normal text-ink-muted">· {p.institution}</span>
            </h4>
            <p>
              {p.detail}: {p.courses.join(', ')}.
            </p>
          </div>
        ))}
        {certifications.length > 0 && (
          <p>
            <b>{t('CV.certifications')}:</b>{' '}
            {certifications.map((c) => `${c.title} (${c.issuer}, ${c.year})`).join(' · ')}
          </p>
        )}
        {achievements.length > 0 && (
          <p>
            <b>{t('CV.achievements')}:</b>{' '}
            {achievements.map((a) => `${a.title} — ${a.detail} (${a.year})`).join(' · ')}
          </p>
        )}
      </CvSection>

      <CvSection title={t('CV.skills')}>
        <dl className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-x-4 print:grid-cols-[auto_1fr] print:gap-x-4">
          {areas.map((area) => (
            <div key={area.id} className="contents">
              <dt className="font-bold">{area.title}</dt>
              <dd>{area.items.map((i) => i.name).join(', ')}</dd>
            </div>
          ))}
          {profile.languages.length > 0 && (
            <div className="contents">
              <dt className="font-bold">{t('CV.languages')}</dt>
              <dd>{profile.languages.map((l) => `${l.name} (${l.level})`).join(', ')}</dd>
            </div>
          )}
        </dl>
      </CvSection>
    </article>
  );
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 grid gap-2.5">
      <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-ink-accent uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
