import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luis Daniel',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
