'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

// ES / EN: enlaces a la misma página en el otro idioma (funcionan sin JS y los rastrean los
// buscadores). Al elegir, next-intl guarda la cookie y esa elección manda en las visitas siguientes.
export function LocaleSwitch({ className = '' }: { className?: string }) {
  const t = useTranslations('Locale');
  const tNav = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div
      role="group"
      aria-label={tNav('language')}
      className={`flex rounded-full bg-white/5 p-[3px] font-mono text-xs leading-none font-medium ${className}`}
    >
      {routing.locales.map((l) => (
        <Link
          key={l}
          // pathname y params describen la página actual, así que siempre encajan entre sí.
          // @ts-expect-error -- patrón documentado por next-intl para cambiar de idioma
          href={{ pathname, params }}
          locale={l}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? 'true' : undefined}
          aria-label={`${l.toUpperCase()} · ${t(l)}`}
          className="rounded-full px-[9px] py-1.5 text-faint transition-colors duration-200 hover:text-fg aria-[current=true]:bg-glass-hi aria-[current=true]:text-fg"
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
