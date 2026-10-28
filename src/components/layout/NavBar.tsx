'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Link, usePathname } from '@/i18n/navigation';
import type { SiteData } from '@/lib/site-fixture';
import { navHref } from '@/lib/nav';
import { LocaleSwitch } from './LocaleSwitch';
import { MobileMenu } from './MobileMenu';

type NavItem = SiteData['nav'][number];

// Menú de cristal flotante: resaltado que se desliza entre enlaces, ES/EN y «Contacto».
// Por debajo de 980 px los enlaces se cambian por un botón que abre MobileMenu.
export function NavBar({
  initials,
  items,
  cta,
}: {
  initials: string;
  items: NavItem[];
  cta: SiteData['navCta'];
}) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = useRef<HTMLDivElement>(null);
  const hl = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Página activa: «Inicio» en el Home y las páginas propias por prefijo. Las secciones del Home
  // se marcarán con el scrollspy (fase 4).
  const active = items.findIndex(
    (item) =>
      !item.section && (item.route === '/' ? pathname === '/' : pathname.startsWith(item.route)),
  );

  const moveHl = useCallback((a?: Element | null) => {
    const el = hl.current;
    if (!el) return;
    if (!(a instanceof HTMLElement) || !a.offsetWidth) {
      el.style.opacity = '0';
      return;
    }
    el.style.left = `${a.offsetLeft}px`;
    el.style.width = `${a.offsetWidth}px`;
    el.style.opacity = '1';
  }, []);

  const activeLink = useCallback(
    () => (active < 0 ? null : links.current?.querySelectorAll('a')[active]),
    [active],
  );

  useLayoutEffect(() => {
    moveHl(activeLink());
    const onResize = () => moveHl(activeLink());
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, [activeLink, moveHl]);

  // El menú móvil se cierra al volver a escritorio.
  useEffect(() => {
    const wide = matchMedia('(min-width: 980px)');
    const onChange = () => wide.matches && setOpen(false);
    wide.addEventListener('change', onChange);
    return () => wide.removeEventListener('change', onChange);
  }, []);

  const close = useCallback((focusButton = false) => {
    setOpen(false);
    if (focusButton) menuButton.current?.focus();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+16px)] z-20 flex flex-col items-center pr-[max(16px,env(safe-area-inset-right,0px))] pl-[max(16px,env(safe-area-inset-left,0px))]">
      <nav
        aria-label={t('label')}
        className="pointer-events-auto relative flex animate-drop items-center gap-1 rounded-full p-1.5 glass-nav"
      >
        <Logo initials={initials} label={t('home')} className="mr-1.5" />

        <div
          ref={links}
          className="relative flex gap-0.5 max-md:hidden"
          onPointerLeave={() => moveHl(activeLink())}
        >
          <span
            ref={hl}
            aria-hidden
            className="absolute top-0 z-0 h-full rounded-full bg-glass-hi opacity-0 transition-[left,width,opacity] duration-450 ease-spring"
          />
          {items.map((item, i) => (
            <Link
              key={item.label}
              href={navHref(item)}
              aria-current={i === active ? 'page' : undefined}
              onPointerEnter={(e) => moveHl(e.currentTarget)}
              onFocus={(e) => moveHl(e.currentTarget)}
              onBlur={() => moveHl(activeLink())}
              className="relative z-1 rounded-full px-3.5 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg aria-[current=page]:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <span aria-hidden className="mx-1.5 h-5 w-px bg-edge max-md:hidden" />
        <LocaleSwitch className="max-sm:hidden" />

        <Link
          href={navHref(cta)}
          className="ml-1.5 rounded-full bg-fg px-4 py-[9px] text-sm font-semibold text-bg transition-[transform,box-shadow] duration-[120ms,300ms] ease-out hover:shadow-[0_0_0_4px_rgb(255_255_255/0.1)] active:scale-96"
        >
          {cta.label}
        </Link>

        <button
          ref={menuButton}
          type="button"
          aria-label={open ? t('closeMenu') : t('openMenu')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-1.5 hidden size-[34px] cursor-pointer place-items-center rounded-full bg-glass-hi transition-transform duration-[120ms] ease-out active:scale-94 max-md:grid"
        >
          {open ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
        </button>
      </nav>

      {open && <MobileMenu items={items} active={active} onClose={close} />}
    </div>
  );
}
