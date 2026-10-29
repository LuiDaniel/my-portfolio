import { ImageResponse } from 'next/og';
import { routing, type Locale } from '@/i18n/routing';
import { getProfile, getSite } from '@/lib/content';
import { plainText } from '@/lib/rich-text';

// Imagen para compartir (Open Graph / Twitter): nombre, rol y frase sobre el fondo del sitio.

export const alt = 'Luis Daniel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale as Locale;
  const profile = getProfile(locale);
  const site = getSite(locale);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 88px',
        background:
          'radial-gradient(60% 70% at 85% 10%, rgba(37,70,216,0.75), transparent), radial-gradient(50% 60% at 75% 85%, rgba(107,47,217,0.6), transparent), #05060b',
        color: '#f4f5fb',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          background: 'linear-gradient(100deg, #5b84ff, #7b74ff 50%, #a77bff)',
        }}
      >
        {profile.initials}
      </div>
      <div style={{ marginTop: 48, fontSize: 104, fontWeight: 700, letterSpacing: -4 }}>
        {profile.name}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 52,
          fontWeight: 600,
          backgroundImage: 'linear-gradient(100deg, #5b84ff, #7b74ff 50%, #a77bff)',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {profile.role}
      </div>
      <div style={{ marginTop: 32, fontSize: 28, color: 'rgba(226,230,245,0.7)', maxWidth: 900 }}>
        {plainText(profile.tagline).split(':')[0] || site.seo.description}
      </div>
    </div>,
    size,
  );
}
