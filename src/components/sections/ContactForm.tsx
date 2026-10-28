'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState, type FormEvent } from 'react';
import { sendContact } from '@/app/actions/contact';
import { Button } from '@/components/ui/Button';
import { invalidFields, type ContactField, type ContactState } from '@/lib/contact-schema';
import { cn } from '@/lib/ui';

const field =
  'w-full resize-y rounded-[14px] border border-edge bg-bg/50 px-[15px] py-[13px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-indigo focus:shadow-[0_0_0_4px_rgb(123_116_255/0.18)] aria-invalid:border-coral';

/**
 * Formulario de contacto: valida en el cliente (mensaje y foco en el primer error) y envía con la
 * Server Action. Sin JavaScript también funciona: el navegador envía el formulario al servidor.
 */
export function ContactForm() {
  const t = useTranslations('Contact');
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {
    status: 'idle',
  });
  const [clientErrors, setClientErrors] = useState<ContactField[] | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const errors = clientErrors ?? (state.status === 'invalid' ? state.fields : []);
  const first = errors[0];
  const message = first
    ? t(`errors.${first}`)
    : state.status === 'rate_limited'
      ? t('errors.rateLimited')
      : state.status === 'error'
        ? t('errors.server')
        : state.status === 'ok'
          ? t('success')
          : '';
  const failed = Boolean(first) || state.status === 'rate_limited' || state.status === 'error';

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const invalid = invalidFields(data);
    if (invalid.length > 0) {
      e.preventDefault();
      setClientErrors(invalid);
      form.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      return;
    }
    setClientErrors(null);
  }

  // Tras un envío correcto se vacía el formulario.
  useEffect(() => {
    if (state.status === 'ok') form.current?.reset();
  }, [state]);

  const props = (name: ContactField) => ({
    id: `f-${name}`,
    name,
    'aria-invalid': errors.includes(name) || undefined,
    'aria-describedby': errors.includes(name) ? 'form-msg' : undefined,
    className: field,
  });

  return (
    <form
      ref={form}
      action={action}
      onSubmit={onSubmit}
      noValidate
      className="grid content-start gap-3.5"
    >
      <div className="grid gap-[7px]">
        <label htmlFor="f-name" className="text-[13px] text-muted">
          {t('name')}
        </label>
        <input {...props('name')} autoComplete="name" placeholder={t('namePlaceholder')} />
      </div>
      <div className="grid gap-[7px]">
        <label htmlFor="f-email" className="text-[13px] text-muted">
          {t('email')}
        </label>
        <input
          {...props('email')}
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
        />
      </div>
      <div className="grid gap-[7px]">
        <label htmlFor="f-message" className="text-[13px] text-muted">
          {t('message')}
        </label>
        <textarea
          {...props('message')}
          placeholder={t('messagePlaceholder')}
          className={cn(field, 'min-h-32')}
        />
      </div>
      {/* Honeypot: invisible para personas; si llega relleno, el servidor lo descarta. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-3.5">
        <Button type="submit" disabled={pending} icon={<Send aria-hidden />}>
          {pending ? t('sending') : t('send')}
        </Button>
        <span
          id="form-msg"
          role="status"
          aria-live="polite"
          className={cn('text-sm', failed ? 'text-coral' : 'text-mint')}
        >
          {message}
        </span>
      </div>
    </form>
  );
}
