import { Eyebrow } from '@/components/ui/SectionHead';
import type { Locale } from '@/i18n/routing';
import { getHome, getProfile, isPending } from '@/lib/content';
import { ContactForm } from './ContactForm';
import { ContactLinks } from './ContactLinks';

const production = process.env.NODE_ENV === 'production';

/** Caja grande de cristal: texto y accesos directos a la izquierda, formulario a la derecha. */
export function Contact({ locale }: { locale: Locale }) {
  const { contact } = getHome(locale);
  const profile = getProfile(locale);
  const socials = profile.socials
    .filter((s) => s.id !== 'email' && (!production || !isPending(s.url)))
    .sort((a, b) => (a.id === 'linkedin' ? -1 : b.id === 'linkedin' ? 1 : 0));

  return (
    <section id="contact" aria-labelledby="t-contact" className="wrap section-gap">
      <div
        className="grid reveal grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[clamp(24px,4vw,56px)] rounded-box p-[clamp(24px,4vw,48px)] glass max-md:grid-cols-1"
        style={{
          // Brillos en dos esquinas sobre el cristal (en línea para que `glass` no los pise).
          background:
            'radial-gradient(80% 120% at 0% 0%, rgb(91 132 255 / .22), transparent 60%), radial-gradient(80% 120% at 100% 100%, rgb(167 123 255 / .2), transparent 60%), var(--color-glass)',
        }}
      >
        <div>
          <Eyebrow color="mint">{contact.eyebrow}</Eyebrow>
          <h2 id="t-contact" className="text-h2 mb-4">
            {contact.title}
          </h2>
          <p className="mb-7 max-w-[42ch] text-lg text-muted">
            {contact.text} {profile.responseTime}
          </p>
          <ContactLinks email={profile.email} socials={socials} />
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
