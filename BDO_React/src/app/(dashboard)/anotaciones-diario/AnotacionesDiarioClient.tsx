'use client';
import { useMemo, useReducer } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { FilterForm } from '@/components/shared/FilterForm';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import type { Rol } from '@/types/database';

type Filters = { desde: string; hasta: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action = { type: 'SET_FILTERS'; payload: Partial<Filters> } | { type: 'SELECT'; id: string | null };

const today = new Date().toISOString().slice(0, 10);
const initial: State = { filters: { desde: '', hasta: today, buscar: '' }, selected: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT':      return { ...state, selected: action.id };
    default:            return state;
  }
}

interface Subtablas {
  personal: any[]; clima: any[]; maquinaria: any[]; sst: any[]; fotos: any[];
}

export default function AnotacionesDiarioClient({
  registros, subtablas, rol,
}: { registros: any[]; subtablas: Subtablas; rol: Rol }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { filters, selected } = state;

  const maps = useMemo(() => {
    const toMap = (arr: any[]) =>
      arr.reduce((m, x) => { (m[x.registro_id] ??= []).push(x); return m; }, {} as Record<string, any[]>);
    return {
      personal:   toMap(subtablas.personal),
      clima:      toMap(subtablas.clima),
      maquinaria: toMap(subtablas.maquinaria),
      sst:        toMap(subtablas.sst),
      fotos:      toMap(subtablas.fotos),
    };
  }, [subtablas]);

  const filtered = useMemo(() => {
    let rows = registros;
    if (filters.desde) rows = rows.filter(r => r.fecha >= filters.desde);
    if (filters.hasta) rows = rows.filter(r => r.fecha <= filters.hasta);
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(r =>
        String(r.folio ?? '').toLowerCase().includes(q) ||
        String(r.tramo ?? '').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [registros, filters]);

  const totalPersonal = subtablas.personal.reduce((a, p) => a + (p.cantidad ?? 0), 0);

  return (
    <div className="space-y-4">
      <SectionBadge label="Anotaciones Diario de Obra" page="anotaciones-diario" />
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Registros diarios" value={filtered.length} accent="blue" />
        <KpiCard label="Personal total" value={totalPersonal} accent="green" />
      </div>
      <FilterForm
        filters={filters as any}
        estadoOpts={[]}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />
      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename="anotaciones-diario" />
      </div>
      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{r.fecha}</span>
            <span className="text-xs">{r.folio}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.tramo ?? ''}</span>
          </div>
        )}
        renderDetail={r => {
          const personal   = maps.personal[r.id] ?? [];
          const clima      = maps.clima[r.id]?.[0];
          const maquinaria = maps.maquinaria[r.id] ?? [];
          const sst        = maps.sst[r.id] ?? [];
          const fotos      = maps.fotos[r.id] ?? [];
          return (
            <div className="space-y-4 p-4 text-sm">
              {clima && (
                <div className="flex gap-4 flex-wrap">
                  <span><b>Condición:</b> {clima.condicion}</span>
                  <span><b>Temperatura máx:</b> {clima.temperatura_max}°C</span>
                </div>
              )}
              {personal.length > 0 && (
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide mb-1"
                     style={{ color: 'var(--text-muted)' }}>Personal</p>
                  <ul className="space-y-0.5 text-xs">
                    {personal.map((p: any, i: number) => (
                      <li key={i}>{p.cargo}: <b>{p.cantidad}</b> — {p.empresa}</li>
                    ))}
                  </ul>
                </div>
              )}
              {maquinaria.length > 0 && (
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide mb-1"
                     style={{ color: 'var(--text-muted)' }}>Maquinaria</p>
                  <ul className="space-y-0.5 text-xs">
                    {maquinaria.map((m: any, i: number) => (
                      <li key={i}>{m.tipo}: <b>{m.cantidad}</b> — {m.estado}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sst.length > 0 && (
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide mb-1"
                     style={{ color: 'var(--text-muted)' }}>SST / Ambiental</p>
                  <ul className="space-y-0.5 text-xs">
                    {sst.map((s: any, i: number) => (
                      <li key={i}>{s.tipo_evento}: {s.descripcion}</li>
                    ))}
                  </ul>
                </div>
              )}
              <PhotoGrid fotos={fotos} />
            </div>
          );
        }}
      />
    </div>
  );
}
