'use client';
import { useMemo, useState } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { RecordList } from '@/components/records/RecordList';
import type { Rol } from '@/types/database';

export default function SeguimientoPmtsClient({ pmts, rol }: { pmts: any[]; rol: Rol }) {
  const [selected, setSelected] = useState<string | null>(null);

  const kpis = useMemo(() => ({
    total:    pmts.length,
    activos:  pmts.filter(p => p.estado === 'ACTIVO').length,
    vencidos: pmts.filter(p => p.estado === 'VENCIDO').length,
  }), [pmts]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Seguimiento PMTs" page="seguimiento-pmts" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total PMTs" value={kpis.total} accent="blue" />
        <KpiCard label="Activos" value={kpis.activos} accent="green" />
        <KpiCard label="Vencidos" value={kpis.vencidos} accent="red" />
      </div>
      <div className="flex justify-end">
        <ExportCsvButton data={pmts} filename="seguimiento-pmts" />
      </div>
      <RecordList
        items={pmts}
        selected={selected}
        onSelect={setSelected}
        renderHeader={r => (
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge estado={r.estado ?? 'ACTIVO'} />
            <span className="font-mono text-xs">{r.numero_pmt}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.tramo ?? ''}</span>
          </div>
        )}
        renderDetail={r => (
          <div className="p-4 grid grid-cols-2 gap-2 text-sm">
            <span><b>Número PMT:</b> {r.numero_pmt}</span>
            <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
            <span><b>Fecha inicio:</b> {r.fecha_inicio ?? '—'}</span>
            <span><b>Fecha fin:</b> {r.fecha_fin ?? '—'}</span>
            <span><b>Responsable:</b> {r.responsable ?? '—'}</span>
            <span className="col-span-2"><b>Observaciones:</b> {r.observaciones ?? '—'}</span>
          </div>
        )}
      />
    </div>
  );
}
