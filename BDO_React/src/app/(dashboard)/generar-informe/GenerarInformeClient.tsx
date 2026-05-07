'use client';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { formatCOP } from '@/lib/utils';

const InformePdfDownload = dynamic(
  () => import('@/components/pdf/InformePdf').then(m => m.InformePdfDownload),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cargando generador de PDF…</p>
    ),
  }
);

export default function GenerarInformeClient({ data }: { data: any }) {
  const aprobadas  = (data.cantidades ?? []).filter((r: any) => r.estado === 'APROBADO').length;
  const pendientes = (data.correspondencia ?? []).filter((c: any) => c.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-6">
      <SectionBadge label="Generar Informe" page="generar-informe" />

      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Registros cantidades" value={data.cantidades?.length ?? 0} accent="blue" />
        <KpiCard label="Aprobados"            value={aprobadas}  accent="green" />
        <KpiCard label="Corresp. pendientes"  value={pendientes} accent="red" />
      </div>

      {data.contrato && (
        <div className="rounded-xl p-4 space-y-2"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold">Datos del contrato</h3>
          <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span><b>Número:</b> {data.contrato.id}</span>
            <span><b>Contratista:</b> {data.contrato.contratista}</span>
            <span><b>Valor:</b> {formatCOP(data.contrato.valor_actual)}</span>
            <span><b>Fin:</b> {data.contrato.fecha_fin?.slice(0, 10) ?? '—'}</span>
          </div>
        </div>
      )}

      <div className="rounded-xl p-6 space-y-4"
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-semibold">Generar informe PDF</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          El informe incluye: datos del contrato, resumen de cantidades aprobadas y estado de correspondencia.
        </p>
        <InformePdfDownload data={data} />
      </div>
    </div>
  );
}
