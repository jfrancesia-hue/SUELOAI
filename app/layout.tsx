import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Suelo — Invertí en lo que pisás',
  description:
    'Plataforma latinoamericana de inversión inmobiliaria fraccionada con analista IA personal. Desde USD 100 o 100 USDT, construí tu patrimonio en proyectos reales.',
  keywords: [
    'inversión', 'inmobiliaria', 'fraccionada', 'Paraguay', 'Argentina',
    'real estate', 'fintech', 'proptech', 'IA', 'analista', 'USDT',
  ],
  openGraph: {
    title: 'Suelo — Invertí en lo que pisás',
    description: 'Inversión inmobiliaria fraccionada con IA personal para LATAM.',
    type: 'website',
    locale: 'es_LA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suelo — Invertí en lo que pisás',
    description: 'Plataforma LATAM de inversión inmobiliaria con IA personal.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-surface-50 text-surface-900 antialiased">
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
