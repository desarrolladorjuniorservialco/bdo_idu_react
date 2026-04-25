'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { formatCOP } from '@/lib/utils';
import type { Rol } from '@/types/database';

const StatusBarChart = dynamic(
  () => import('@/components/charts/StatusBarChart').then(m => m.StatusBarChart),
  { ssr: false }
);

export default function PresupuestoClient({
  items, rol,
}: { items: any[]; rol: Rol }) {
  const kpis = useMemo(() => {
    const total     = items.reduce((a, i) => a + (i.cantidad ?? 0) * (i.precio_unitario ?? 0), 0);
    const ejecutado = items.reduce((a, i) => a + (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0), 0);
    const avance    = total > 0 ? (ejecutado / total) * 100 : 0;
    return { total, ejecutado, avance };
  }, [items]);

  const chartData = useMemo(() => {
    const by: Record<string, { valor: number; ejecutado: number }> = {};
    for (const i of items) {
      const cap = i.capitulo ?? 'Sin capítulo';
      if (!by[cap]) by[cap] = { valor: 0, ejecutado: 0 };
      by[cap].valor     += (i.cantidad ?? 0) * (i.precio_unitario ?? 0);
      by[cap].ejecutado += (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0);
    }
    return Object.entries(by).map(([name, v]) => ({ name, ...v }));
  }, [items]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Seguimiento Presupuesto" page="presupuesto" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Presupuesto total" value={formatCOP(kpis.total)} accent="blue" />
        <KpiCard label="Ejecutado"         value={formatCOP(kpis.ejecutado)} accent="green" />
        <KpiCard label="% Avance"          value={`${kpis.avance.toFixed(1)}%`} accent="purple" />
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-semibold mb-3">Presupuesto vs Ejecutado por capítulo</p>
        <StatusBarChart data={chartData} />
      </div>

      <div className="flex justify-end">
        <ExportCsvButton data={items} filename="presupuesto" />
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-xs min-w-[700px]">
          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {['Capítulo','Actividad','Und','Cantidad','Ejec.','P.U.','Valor','Ejecutado'].map(h => (
                <th key={h} className="p-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i: any, idx: number) => (
              <tr key={i.id ?? idx} className="border-t hover:bg-[var(--muted)]/30" style={{ borderColor: 'var(--border)' }}>
                <td className="p-2">{i.capitulo ?? '—'}</td>
                <td className="p-2">{i.actividad}</td>
                <td className="p-2 font-mono">{i.unidad}</td>
                <td className="p-2 text-right font-mono tabular-nums">{i.cantidad?.toLocaleString('es-CO')}</td>
                <td className="p-2 text-right font-mono tabular-nums">{i.cantidad_ejecutada?.toLocaleString('es-CO') ?? '0'}</td>
                <td className="p-2 text-right font-mono tabular-nums">{formatCOP(i.precio_unitario)}</td>
                <td className="p-2 text-right font-mono tabular-nums">{formatCOP((i.cantidad ?? 0) * (i.precio_unitario ?? 0))}</td>
                <td className="p-2 text-right font-mono tabular-nums">{formatCOP((i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
