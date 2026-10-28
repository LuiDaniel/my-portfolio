import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/ui/Logo';
import { Link } from '@/i18n/navigation';
import type { SiteData } from '@/lib/site-fixture';
import { navHref } from '@/lib/nav';

// Pie de cristal oscuro: marca, tres columnas de enlaces y copyright.
export async function Footer({
  name,
  initials,
  footer,
}: Pick<SiteData, 'name' | 'initials' | 'footer'>) {
  const t = await getTranslations();

  return (
    <footer className="relative z-1 mt-(--section-gap) border-t border-edge glass-bar">
      <div className="wrap">
        <div className="grid grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-8 pt-14 pb-8 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <div className="max-lg:col-span-full">
            <Logo initials={initials} label={t('Nav.home')} />
            <p className="mt-3.5 max-w-[34ch] text-[14.5px] text-muted">{footer.about}</p>
          </div>
          {footer.groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3.5 font-mono text-xs leading-none font-medium tracking-[0.1em] text-faint uppercase">
                {group.title}
              </h2>
              <ul className="grid gap-2.5 text-[14.5px] text-muted">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {'href' in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-fg"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={navHref(link)} className="transition-colors hover:text-fg">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-edge pt-5 pb-9 text-[13px] text-faint">
          <span>
            © {new Date().getFullYear()} {name}
          </span>
          <span>{t('Footer.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
