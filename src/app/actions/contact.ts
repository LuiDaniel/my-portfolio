'use server';

import { contactSchema, invalidFields, type ContactState } from '@/lib/contact-schema';

/**
 * Server Action del formulario de contacto (docs/03-arquitectura.md#backend). Valida con Zod y
 * descarta en silencio los envíos con el honeypot relleno. Sin claves de servicios (desarrollo),
 * el mensaje se escribe en la consola del servidor.
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

  const data = contactSchema.parse(values);
  console.info('[contacto] Mensaje recibido (sin servicio de email configurado):', data);
  return { status: 'ok' };
}
