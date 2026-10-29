'use server';

import { headers } from 'next/headers';
import { contactSchema, invalidFields, type ContactState } from '@/lib/contact-schema';
import { sendContactMail } from '@/lib/mail';
import { allowContact } from '@/lib/rate-limit';

/**
 * Server Action del formulario de contacto (docs/03-arquitectura.md#backend): Zod, honeypot,
 * límite de 3 envíos por IP cada 10 min (Upstash) y envío con Resend (reply-to = visitante).
 * Sin claves (desarrollo) no hay límite y el mensaje se escribe en consola.
 */
export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: un campo oculto que solo rellenan los bots. Se responde «ok» para no darles pistas.
  if (String(form.get('website') ?? '') !== '') return { status: 'ok' };

  const values = {
    name: form.get('name'),
    email: form.get('email'),
    message: form.get('message'),
  };
  const fields = invalidFields(values);
  if (fields.length > 0) return { status: 'invalid', fields };

  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
  if (!(await allowContact(ip))) return { status: 'rate_limited' };

  try {
    await sendContactMail(contactSchema.parse(values));
    return { status: 'ok' };
  } catch (err) {
    console.error('[contacto] No se pudo enviar:', err);
    return { status: 'error' };
  }
}
