import { beforeEach, describe, expect, it, vi } from 'vitest';

// La Server Action con los servicios simulados: validación, honeypot, límite y errores de envío.
const sendContactMail = vi.fn();
const allowContact = vi.fn();
vi.mock('@/lib/mail', () => ({ sendContactMail }));
vi.mock('@/lib/rate-limit', () => ({ allowContact }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }),
}));

const { sendContact } = await import('@/app/actions/contact');

const form = (values: Record<string, string>) => {
  const data = new FormData();
  for (const [k, v] of Object.entries(values)) data.set(k, v);
  return data;
};
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hola, me interesa tu perfil.' };

describe('sendContact', () => {
  beforeEach(() => {
    sendContactMail.mockReset().mockResolvedValue(undefined);
    allowContact.mockReset().mockResolvedValue(true);
  });

  it('devuelve los campos inválidos sin enviar', async () => {
    const state = await sendContact(
      { status: 'idle' },
      form({ name: 'A', email: 'x', message: '' }),
    );
    expect(state).toEqual({ status: 'invalid', fields: ['name', 'email', 'message'] });
    expect(sendContactMail).not.toHaveBeenCalled();
  });

  it('descarta en silencio si el honeypot viene relleno', async () => {
    const state = await sendContact({ status: 'idle' }, form({ ...valid, website: 'spam' }));
    expect(state).toEqual({ status: 'ok' });
    expect(sendContactMail).not.toHaveBeenCalled();
  });

  it('limita por la IP del visitante', async () => {
    allowContact.mockResolvedValue(false);
    const state = await sendContact({ status: 'idle' }, form(valid));
    expect(allowContact).toHaveBeenCalledWith('203.0.113.7');
    expect(state).toEqual({ status: 'rate_limited' });
  });

  it('envía el mensaje validado', async () => {
    const state = await sendContact({ status: 'idle' }, form({ ...valid, name: '  Ada  ' }));
    expect(state).toEqual({ status: 'ok' });
    expect(sendContactMail).toHaveBeenCalledWith({ ...valid, name: 'Ada' });
  });

  it('informa del error si el envío falla', async () => {
    sendContactMail.mockRejectedValue(new Error('caído'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const state = await sendContact({ status: 'idle' }, form(valid));
    expect(state).toEqual({ status: 'error' });
  });
});
