'use client';
import { ApprovalPanel } from '@/components/approval/ApprovalPanel';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { FilterForm } from '@/components/shared/FilterForm';
import { KpiCard } from '@/components/shared/KpiCard';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import { SectionBadge } from '@/components/shared/SectionBadge';
import type { FotoRegistro, Rol } from '@/types/database';
import { useCallback, useMemo, useReducer, useState } from 'react';

type Filters = { desde: string; hasta: string; estado: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT'; id: string | null };
type DiarioRegistro = Record<string, unknown> & { id: string };
type SubRegistro = Record<string, unknown> & { registro_id?: string };
const toNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const toText = (value: unknown, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value);
const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && String(value).trim() !== '';

const initial: State = {
  filters: { desde: '', hasta: '', estado: 'Todos', buscar: '' },
  selected: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT':
      return { ...state, selected: action.id };
    default:
      return state;
  }
}

interface Subtablas {
  personal: SubRegistro[];
  clima: SubRegistro[];
  maquinaria: SubRegistro[];
  sst: SubRegistro[];
  fotos: FotoRegistro[];
}

function DiarioHeader({ item: r }: { item: DiarioRegistro }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        {toText(r.fecha_reporte ?? r.fecha)}
      </span>
      <span className="text-xs">{toText(r.folio)}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {toText(r.tramo ?? r.id_tramo)}
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-md"
        style={{ background: 'var(--muted)', color: 'var(--text-muted)' }}
      >
        {String(r.estado ?? 'SIN ESTADO')}
      </span>
    </div>
  );
}

export default function AnotacionesDiarioClient({
  registros,
  subtablas,
  rol,
}: { registros: DiarioRegistro[]; subtablas: Subtablas; rol: Rol }) {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [state, dispatch] = useReducer(reducer, initial);
  const filters = state.filters.hasta ? state.filters : { ...state.filters, hasta: today };
  const { selected } = state;

  const estadoOpts = useMemo(() => {
    const set = new Set<string>(['Todos']);
    for (const r of registros) {
      const estado = String(r.estado ?? '').trim();
      if (estado) set.add(estado);
    }
    return Array.from(set);
  }, [registros]);

  const maps = useMemo(() => {
    const toMap = <T extends { registro_id?: string }>(arr: T[]) => {
      const mapped: Record<string, T[]> = {};
      for (const x of arr) {
        const key = String(x.registro_id ?? '');
        if (!key) continue;
        if (!mapped[key]) mapped[key] = [];
        mapped[key].push(x);
      }
      return mapped;
    };

    return {
      personal: toMap(subtablas.personal),
      clima: toMap(subtablas.clima),
      maquinaria: toMap(subtablas.maquinaria),
      sst: toMap(subtablas.sst),
      fotos: toMap(subtablas.fotos),
    };
  }, [subtablas]);

  const filtered = useMemo(() => {
    let rows = registros;

    if (filters.desde) {
      rows = rows.filter((r) => String(r.fecha_reporte ?? r.fecha ?? '') >= filters.desde);
    }
    if (filters.hasta) {
      rows = rows.filter((r) => String(r.fecha_reporte ?? r.fecha ?? '') <= filters.hasta);
    }
    if (filters.estado && filters.estado !== 'Todos') {
      rows = rows.filter((r) => String(r.estado ?? '') === filters.estado);
    }
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(
        (r) =>
          String(r.folio ?? '')
            .toLowerCase()
            .includes(q) ||
          String(r.tramo ?? '')
            .toLowerCase()
            .includes(q) ||
          String(r.usuario_qfield ?? '')
            .toLowerCase()
            .includes(q) ||
          String(r.observaciones ?? '')
            .toLowerCase()
            .includes(q) ||
          String(r.civ ?? '')
            .toLowerCase()
            .includes(q) ||
          String(r.id_tramo ?? '')
            .toLowerCase()
            .includes(q),
      );
    }

    return rows.toSorted((a, b) => {
      const fa = Number(a.folio) || 0;
      const fb = Number(b.folio) || 0;
      return fb - fa;
    });
  }, [registros, filters]);

  const totalPersonal = subtablas.personal.reduce((a, p) => a + toNumber(p.cantidad), 0);
  const totalAprobados = filtered.filter((r) => String(r.estado ?? '') === 'APROBADO').length;

  const DiarioDetail = useCallback(
    function DiarioDetailComponent({ item: r }: { item: DiarioRegistro }) {
      const personal = maps.personal[r.id] ?? [];
      const clima = maps.clima[r.id]?.[0];
      const maquinaria = maps.maquinaria[r.id] ?? [];
      const sst = maps.sst[r.id] ?? [];
      const fotos = maps.fotos[r.id] ?? [];

      return (
        <div className="space-y-4 p-4 text-sm">
          <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <span>
                  <b>Folio:</b> {toText(r.folio, '-')}
                </span>
                <span>
                  <b>Fecha:</b> {String(r.fecha_reporte ?? r.fecha ?? '-')}
                </span>
                <span>
                  <b>Inspector:</b> {toText(r.usuario_qfield, '-')}
                </span>
                <span>
                  <b>Estado:</b> {toText(r.estado, '-')}
                </span>
                <span>
                  <b>Tramo:</b> {toText(r.tramo ?? r.id_tramo, '-')}
                </span>
                <span>
                  <b>CIV:</b> {toText(r.civ, '-')}
                </span>
                <span>
                  <b>PK:</b> {toText(r.pk_id, '-')}
                </span>
                <span>
                  <b>Cantidad:</b> {toText(r.cantidad, '-')}
                </span>
                <span>
                  <b>Unidad:</b> {toText(r.unidad, '-')}
                </span>
              </div>

              {hasValue(r.observaciones) && (
                <div className="rounded-md p-2 text-xs" style={{ background: 'var(--muted)' }}>
                  <b>Observaciones:</b> {toText(r.observaciones)}
                </div>
              )}

              {clima && (
                <div className="flex gap-4 flex-wrap">
                  <span>
                    <b>Condicion:</b> {String(clima.condicion ?? clima.estado_clima ?? '-')}
                  </span>
                  <span>
                    <b>Hora:</b> {String(clima.hora ?? '').slice(0, 5) || '-'}
                  </span>
                </div>
              )}

              {personal.length > 0 && (
                <div>
                  <p
                    className="font-semibold text-xs uppercase tracking-wide mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Personal
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    {personal.map((p) => (
                      <li
                        key={`${String(p.cargo ?? p.tipo ?? 'Personal')}-${String(p.empresa ?? '')}-${String(p.cantidad ?? '')}`}
                      >
                        {String(p.cargo ?? p.tipo ?? 'Personal')}:{' '}
                        <b>{String(p.cantidad ?? '-')}</b>{' '}
                        {hasValue(p.empresa) ? `- ${String(p.empresa)}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {maquinaria.length > 0 && (
                <div>
                  <p
                    className="font-semibold text-xs uppercase tracking-wide mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Maquinaria
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    {maquinaria.map((m) => (
                      <li
                        key={`${String(m.tipo ?? 'Equipo')}-${String(m.estado ?? '')}-${String(m.cantidad ?? '')}`}
                      >
                        {String(m.tipo ?? 'Equipo')}: <b>{String(m.cantidad ?? '-')}</b>{' '}
                        {hasValue(m.estado) ? `- ${String(m.estado)}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sst.length > 0 && (
                <div>
                  <p
                    className="font-semibold text-xs uppercase tracking-wide mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    SST / Ambiental
                  </p>
                  <ul className="space-y-0.5 text-xs">
                    {sst.map((s) => (
                      <li
                        key={`${String(s.tipo_evento ?? s.tipo ?? 'Evento')}-${String(s.descripcion ?? '')}`}
                      >
                        {String(s.tipo_evento ?? s.tipo ?? 'Evento')}:{' '}
                        {String(s.descripcion ?? '-')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fotos.length > 0 ? (
                <PhotoGrid fotos={fotos} />
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Sin fotos registradas.
                </p>
              )}
            </div>

            <div>
              <ApprovalPanel
                registro={r}
                rol={rol}
                tabla="registros_reporte_diario"
                rutaRevalidar="/anotaciones-diario"
              />
            </div>
          </div>
        </div>
      );
    },
    [maps, rol],
  );

  return (
    <div className="space-y-4">
      <SectionBadge label="Anotaciones Diario de Obra" page="anotaciones-diario" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard label="Registros diarios" value={filtered.length} accent="blue" />
        <KpiCard label="Aprobados" value={totalAprobados} accent="green" />
        <KpiCard label="Personal total" value={totalPersonal} accent="teal" />
      </div>

      <FilterForm
        filters={filters}
        estadoOpts={estadoOpts}
        onChange={(payload) => dispatch({ type: 'SET_FILTERS', payload })}
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          {filtered.length > 15 && ' · desplázate para ver todos'}
        </span>
        <ExportCsvButton data={filtered} filename="anotaciones-diario" />
      </div>

      <div
        className="overflow-y-auto rounded-lg"
        style={{
          maxHeight: '720px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--text-muted) transparent',
        }}
      >
        <RecordList
          items={filtered}
          selected={selected}
          onSelect={(id) => dispatch({ type: 'SELECT', id })}
          HeaderComponent={DiarioHeader}
          DetailComponent={DiarioDetail}
        />
      </div>
    </div>
  );
}
