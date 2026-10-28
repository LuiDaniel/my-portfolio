import { getLocale } from 'next-intl/server';
import { getSiteFixture } from '@/lib/site-fixture';

// Provisional: el Home de design/home.html llega en la fase 4.
export default async function HomePage() {
  const { name } = getSiteFixture(await getLocale());
  return (
    <main className="wrap grid min-h-dvh content-center gap-4">
      <h1 className="text-[clamp(52px,8.4vw,112px)] leading-[0.98] font-bold tracking-[-0.045em]">
        {name}
      </h1>
    </main>
  );
}
