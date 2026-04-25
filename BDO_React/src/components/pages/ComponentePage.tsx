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

interface ComponentePageProps {
  title:      string;
  page:       string;
  tabla:      string;
  registros:  any[];
  fotos:      any[];
  rol:        Rol;
}

export default function ComponentePage({
  title, page, tabla, registros, fotos, rol,
}: ComponentePageProps) {
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
        [r.folio, r.actividad, r.tramo, r.tipo_actividad]
          .some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registros, filters]);

  const aprobados = filtered.filter(r => r.estado === 'APROBADO').length;

  return (
    <div className="space-y-4">
      <SectionBadge label={title} page={page} />
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total registros" value={filtered.length} accent="blue" />
        <KpiCard label="Aprobados" value={aprobados} accent="green" />
      </div>
      <FilterForm
        filters={filters}
        estadoOpts={['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO']}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />
      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename={page} />
      </div>
      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge estado={r.estado} />
            <span className="font-mono text-xs">{r.folio}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {r.tipo_actividad ?? r.actividad}
            </span>
          </div>
        )}
        renderDetail={r => (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
              <span><b>Actividad:</b> {r.actividad ?? '—'}</span>
            </div>
            {r.descripcion && <p className="text-sm">{r.descripcion}</p>}
            <PhotoGrid fotos={fotoMap[r.id] ?? []} />
            <ApprovalPanel registro={r} rol={rol} tabla={tabla} rutaRevalidar={`/${page}`} />
          </div>
        )}
      />
    </div>
  );
}
