import { ReducedMotionProvider } from '@/components/layout/ReducedMotionProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BDO · IDU-1556-2025',
  description: 'Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={ibmPlexSans.variable}>
      <body>
        <ReducedMotionProvider />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
