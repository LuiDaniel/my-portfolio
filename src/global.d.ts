import type { routing } from '@/i18n/routing';
import type messages from '@/i18n/messages/es.json';

// Tipos de next-intl: idiomas válidos y claves de mensajes comprobadas por TypeScript.
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
