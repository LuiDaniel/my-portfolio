import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  axes: ['opsz'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

// Clases que definen --font-inter y --font-jetbrains-mono en <html> (los usa tokens.css).
export const fontVariables = `${inter.variable} ${jetbrainsMono.variable}`;
