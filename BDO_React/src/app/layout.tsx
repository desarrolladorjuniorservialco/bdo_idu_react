import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BDO · IDU-1556-2025',
  description: 'Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
