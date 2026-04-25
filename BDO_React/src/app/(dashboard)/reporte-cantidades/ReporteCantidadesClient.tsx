'use client';
import { useMemo, useReducer } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { FilterForm } from '@/components/shared/FilterForm';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { ApprovalPanel } from '@/components/approval/ApprovalPanel';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCOP } from '@/lib/utils';
import type { Rol } from '@/types/database';

type Filters = { desde: string; hasta: string; estado: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT'; id: string | null };

const today = new Date().toISOString().slice(0, 10);
const initial: State = {
  filters: { desde: '', hasta: today, estado: 'Todos', buscar: '' },
  selected: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT':      return { ...state, selected: action.id };
    default:            return state;
  }
}

export default function ReporteCantidadesClient({
  registros, fotos, rol,
}: { registros: any[]; fotos: any[]; rol: Rol }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { filters, selected } = state;

  const fotoMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const f of fotos) (m[f.registro_id] ??= []).push(f);
    return m;
  }, [fotos]);

  const filtered = useMemo(() => {
    let rows = registros;
    if (filters.desde) rows = rows.filter(r => r.fecha_creacion >= filters.desde);
    if (filters.hasta) rows = rows.filter(r => r.fecha_creacion <= filters.hasta);
    if (filters.estado !== 'Todos') rows = rows.filter(r => r.estado === filters.estado);
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(r =>
        [r.folio, r.civ, r.actividad, r.tramo]
          .some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registros, filters]);

  const kpis = useMemo(() => ({
    total:     filtered.length,
    aprobados: filtered.filter(r => r.estado === 'APROBADO').length,
    sumaCant:  filtered.reduce((a, r) => a + (r.cantidad ?? 0), 0),
    valorEst:  filtered.reduce((a, r) => a + (r.cantidad ?? 0) * (r.precio_unitario ?? 0), 0),
  }), [filtered]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Reporte de Cantidades de Obra" page="reporte-cantidades" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total registros" value={kpis.total} accent="blue" />
        <KpiCard label="Aprobados" value={kpis.aprobados} accent="green" />
        <KpiCard
          label="Suma cantidades"
          value={kpis.sumaCant.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
          accent="teal"
        />
        <KpiCard label="Valor estimado" value={formatCOP(kpis.valorEst)} accent="purple" />
      </div>
      <FilterForm
        filters={filters}
        estadoOpts={['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO']}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />
      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename="reporte-cantidades" />
      </div>
      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge estado={r.estado} />
            <span className="font-mono text-xs">{r.folio}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.actividad}</span>
          </div>
        )}
        renderDetail={r => (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span><b>CIV:</b> {r.civ ?? '—'}</span>
              <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
              <span><b>Unidad:</b> {r.unidad}</span>
              <span><b>Cantidad:</b> {r.cantidad}</span>
              <span><b>P.U.:</b> {formatCOP(r.precio_unitario)}</span>
              <span><b>Valor:</b> {formatCOP((r.cantidad ?? 0) * (r.precio_unitario ?? 0))}</span>
            </div>
            <PhotoGrid fotos={fotoMap[r.id] ?? []} />
            <ApprovalPanel registro={r} rol={rol} tabla="registros_cantidades" rutaRevalidar="/reporte-cantidades" />
          </div>
        )}
      />
    </div>
  );
}
