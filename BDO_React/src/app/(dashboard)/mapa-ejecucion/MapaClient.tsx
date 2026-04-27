'use client';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';

const MapaEjecucion = dynamic(() => import('@/components/maps/MapaEjecucion'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] rounded-md flex items-center justify-center"
         style={{ background: 'var(--muted)' }}>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando mapa…</p>
    </div>
  ),
});

const LEYENDA = [
  { color: '#6D8E2D', label: 'Ejecutado' },
  { color: '#FFD200', label: 'En ejecución' },
  { color: '#9CA3AF', label: 'Sin iniciar' },
  { color: '#ED1C24', label: 'Suspendido' },
];

export default function MapaClient({ tramos }: { tramos: any[] }) {
  return (
    <div className="space-y-4">
      <SectionBadge label="Mapa de Ejecución" page="mapa-ejecucion" />
      <div className="flex gap-4 flex-wrap">
        {LEYENDA.map(l => (
          <div key={l.color} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-5 h-1.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
      <MapaEjecucion tramos={tramos} />
      <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
        {tramos.length} tramos cargados
      </p>
    </div>
  );
}
