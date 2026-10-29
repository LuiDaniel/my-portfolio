import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Límite de envíos del formulario: 3 por IP cada 10 minutos (Upstash). Sin las variables de Upstash
// (desarrollo) no hay límite.

let limiter: Ratelimit | null | undefined;

function getLimiter() {
  if (limiter !== undefined) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  limiter =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(3, '10 m'),
          prefix: 'contact',
        })
      : null;
  return limiter;
}

/** true si esta IP aún puede enviar. */
export async function allowContact(ip: string) {
  const l = getLimiter();
  if (!l) return true;
  const { success } = await l.limit(ip);
  return success;
}
