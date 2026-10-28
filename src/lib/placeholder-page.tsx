import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PagePlaceholder } from '@/components/ui/PagePlaceholder';

type PageKey = 'projects' | 'project' | 'blog' | 'post' | 'about' | 'cv' | 'uses' | 'colophon';

// Provisional (fase 2): genera el título y la página vacía de cada ruta. Se retira en la fase 6.
export function placeholderPage(key: PageKey) {
  async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Pages');
    return { title: t(`${key}.title`) };
  }

  async function Page({ params }: { params: Promise<{ slug?: string }> }) {
    const [t, { slug }] = await Promise.all([getTranslations('Pages'), params]);
    return <PagePlaceholder title={t(`${key}.title`)} detail={slug} note={t('soon')} />;
  }

  return { generateMetadata, Page };
}
