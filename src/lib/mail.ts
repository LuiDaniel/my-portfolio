import { Resend } from 'resend';

// Envío del formulario de contacto con Resend. Sin RESEND_API_KEY, en desarrollo el mensaje se
// escribe en la consola del servidor; en producción falla, para que el formulario pida escribir por
// email en lugar de dar por enviado un mensaje que nadie recibirá.

export type ContactMessage = { name: string; email: string; message: string };

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\n/g, '<br>');

export async function sendContactMail(data: ContactMessage) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!key || !to || !from) {
    if (process.env.NODE_ENV === 'production') throw new Error('Resend sin configurar');
    console.info('[contacto] Mensaje recibido (sin servicio de email configurado):', data);
    return;
  }

  const { error } = await new Resend(key).emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `Portafolio · Mensaje de ${data.name}`,
    text: `${data.name} <${data.email}>\n\n${data.message}`,
    html: `<p><strong>${escape(data.name)}</strong> &lt;${escape(data.email)}&gt;</p><p>${escape(data.message)}</p>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
