'use client';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { useMemo, useReducer, useState } from 'react';

const MapaEjecucionFull = dynamic(() => import('@/components/maps/MapaEjecucionFull'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[520px] rounded-md flex items-center justify-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Cargando mapa…
      </p>
    </div>
  ),
});

// ─── Paleta de estados ────────────────────────────────────────────────────────
const ESTADO_COLOR: Record<string, string> = {
  BORRADOR: '#5bc0de',
  REVISADO: '#ffb71b',
  APROBADO: '#859226',
  DEVUELTO: '#ea273f',
};

const LEYENDA = [
  { color: ESTADO_COLOR.BORRADOR, label: 'Borrador' },
  { color: ESTADO_COLOR.REVISADO, label: 'Revisado' },
  { color: ESTADO_COLOR.APROBADO, label: 'Aprobado' },
  { color: ESTADO_COLOR.DEVUELTO, label: 'Devuelto' },
];

const ESTADO_OPTS = ['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO'];

// ─── Estado de filtros ────────────────────────────────────────────────────────
type Filters = {
  desde: string;
  hasta: string;
  estado: string;
  buscar: string;
  tramo: string;
  civ: string;
  item: string;
  comp: string;
  showCant: boolean;
  showComp: boolean;
  showDiario: boolean;
  showPmt: boolean;
};

type Action = { type: 'SET'; payload: Partial<Filters> };
type Row = Record<string, unknown>;

const today = new Date().toISOString().slice(0, 10);
const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const initial: Filters = {
  desde: thirtyAgo,
  hasta: today,
  estado: 'Todos',
  buscar: '',
  tramo: '',
  civ: '',
  item: '',
  comp: '',
  showCant: true,
  showComp: true,
  showDiario: true,
  showPmt: true,
};

function reducer(state: Filters, action: Action): Filters {
  return { ...state, ...action.payload };
}

// ─── Utilidades de filtrado ───────────────────────────────────────────────────
function dateOf(r: Row, ...cols: string[]): string {
  for (const c of cols) if (r[c]) return String(r[c]).slice(0, 10);
  return '';
}

function applyFilters(
  records: Row[],
  dateCols: string[],
  textCols: string[],
  advFilters: [string[], string][],
  f: Filters,
): Row[] {
  let rows = records;

  if (f.desde || f.hasta) {
    rows = rows.filter((r) => {
      const d = dateOf(r, ...dateCols);
      if (!d) return true;
      if (f.desde && d < f.desde) return false;
      if (f.hasta && d > f.hasta) return false;
      return true;
    });
  }

  if (f.estado !== 'Todos') {
    rows = rows.filter((r) => r.estado === f.estado);
  }

  if (f.buscar.trim()) {
    const q = f.buscar.toLowerCase();
    rows = rows.filter((r) =>
      textCols.some(
        (c) =>
          String(r[c] ?? '')
            .toLowerCase()
            .indexOf(q) !== -1,
      ),
    );
  }

  for (const [cols, val] of advFilters) {
    if (val.trim()) {
      const v = val.toLowerCase();
      rows = rows.filter((r) =>
        cols.some(
          (c) =>
            String(r[c] ?? '')
              .toLowerCase()
              .indexOf(v) !== -1,
        ),
      );
    }
  }

  return rows;
}

function withGeo(records: Row[]): Row[] {
  return records.filter((r) => {
    const lat = Number.parseFloat(r.latitud);
    const lon = Number.parseFloat(r.longitud);
    return !Number.isNaN(lat) && !Number.isNaN(lon);
  });
}

function pickCols(records: Row[], cols: string[]): object[] {
  if (!records.length) return [];
  const available = cols.filter((c) => records.some((r) => r[c] != null));
  if (!available.length) return records;
  return records.map((r) => Object.fromEntries(available.map((c) => [c, r[c] ?? ''])));
}

// ─── Tabla de resumen ─────────────────────────────────────────────────────────
function RecordTable({
  records,
  columns,
  labels,
  empty,
}: {
  records: Row[];
  columns: string[];
  labels: Record<string, string>;
  empty: string;
}) {
  const getRowKey = (r: Row) =>
    String(
      r.id ??
        r.folio ??
        r.numero_pmt ??
        `${r.latitud ?? 'na'}-${r.longitud ?? 'na'}-${r.fecha ?? r.fecha_reporte ?? r.fecha_creacion ?? 'na'}`,
    );

  if (!records.length) {
    return (
      <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>
        {empty}
      </p>
    );
  }

  const available = columns.filter((c) => records.some((r) => r[c] != null));

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: 'var(--muted, #f8f9fa)' }}>
            {available.map((c) => (
              <th
                key={c}
                className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                style={{
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {labels[c] ?? c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={getRowKey(r)}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 ? 'var(--muted, rgba(0,0,0,0.02))' : 'transparent',
              }}
            >
              {available.map((c) => (
                <td key={c} className="px-3 py-1.5" style={{ color: 'var(--text-primary)' }}>
                  {c === 'estado' ? (
                    <StatusBadge estado={String(r[c] ?? '')} />
                  ) : (
                    <span className="font-mono text-[13px] whitespace-nowrap">
                      {String(r[c] ?? '—')}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pestañas manuales ────────────────────────────────────────────────────────
type TabKey = 'cantidades' | 'componentes' | 'diario' | 'pmt';

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props {
  tramos: Row[];
  cantidades: Row[];
  componentes: Row[];
  reporteDiario: Row[];
  formularioPmt: Row[];
}

export default function MapaClient({
  tramos,
  cantidades,
  componentes,
  reporteDiario,
  formularioPmt,
}: Props) {
  const [filters, dispatch] = useReducer(reducer, initial);
  const [activeTab, setActiveTab] = useState<TabKey>('cantidades');

  const set = (payload: Partial<Filters>) => dispatch({ type: 'SET', payload });

  // ── Filtrado por capa ──────────────────────────────────────────────────────
  const filteredCant = useMemo(() => {
    if (!filters.showCant) return [];
    return applyFilters(
      cantidades,
      ['fecha', 'fecha_creacion'],
      [
        'folio',
        'id_tramo',
        'tramo',
        'civ',
        'tipo_actividad',
        'actividad',
        'item_pago',
        'capitulo',
        'usuario_qfield',
      ],
      [
        [['id_tramo', 'tramo'], filters.tramo],
        [['civ'], filters.civ],
        [['item_pago', 'capitulo'], filters.item],
        [['codigo_elemento', 'tipo_actividad', 'actividad'], filters.comp],
      ],
      filters,
    );
  }, [cantidades, filters]);

  const filteredComp = useMemo(() => {
    if (!filters.showComp) return [];
    return applyFilters(
      componentes,
      ['fecha', 'fecha_creacion'],
      [
        'folio',
        'id_tramo',
        'tramo',
        'civ',
        'tipo_componente',
        'tipo_actividad',
        'actividad',
        'usuario_qfield',
      ],
      [
        [['id_tramo', 'tramo'], filters.tramo],
        [['civ'], filters.civ],
        [['tipo_componente', 'componente'], filters.comp],
      ],
      filters,
    );
  }, [componentes, filters]);

  const filteredDiario = useMemo(() => {
    if (!filters.showDiario) return [];
    return applyFilters(
      reporteDiario,
      ['fecha_reporte', 'fecha', 'fecha_creacion'],
      ['folio', 'id_tramo', 'tramo', 'civ', 'observaciones', 'usuario_qfield'],
      [
        [['id_tramo', 'tramo'], filters.tramo],
        [['civ'], filters.civ],
      ],
      filters,
    );
  }, [reporteDiario, filters]);

  const filteredPmt = useMemo(() => {
    if (!filters.showPmt) return [];
    return applyFilters(
      formularioPmt,
      ['inicio_vigencia', 'fecha_creacion'],
      ['folio', 'civ', 'descripcion', 'usuario', 'numero_pmt'],
      [[['civ'], filters.civ]],
      filters,
    );
  }, [formularioPmt, filters]);

  // ── Geo-filtrado (solo registros con lat/lon válidas) ──────────────────────
  const geoCant = useMemo(() => withGeo(filteredCant), [filteredCant]);
  const geoComp = useMemo(() => withGeo(filteredComp), [filteredComp]);
  const geoDiario = useMemo(() => withGeo(filteredDiario), [filteredDiario]);
  const geoPmt = useMemo(() => withGeo(filteredPmt), [filteredPmt]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const cantAprobadas = useMemo(
    () => filteredCant.filter((r) => r.estado === 'APROBADO').length,
    [filteredCant],
  );

  // ── Datos de exportación (columnas relevantes por capa) ────────────────────
  const expCant = useMemo(
    () =>
      pickCols(geoCant, [
        'folio',
        'fecha',
        'fecha_creacion',
        'id_tramo',
        'tramo',
        'civ',
        'tipo_actividad',
        'actividad',
        'item_pago',
        'capitulo',
        'cantidad',
        'unidad',
        'estado',
        'latitud',
        'longitud',
      ]),
    [geoCant],
  );

  const expComp = useMemo(
    () =>
      pickCols(geoComp, [
        'folio',
        'fecha',
        'fecha_creacion',
        'id_tramo',
        'tramo',
        'tipo_componente',
        'tipo_actividad',
        'actividad',
        'cantidad',
        'unidad',
        'estado',
        'latitud',
        'longitud',
      ]),
    [geoComp],
  );

  const expDiario = useMemo(
    () =>
      pickCols(geoDiario, [
        'folio',
        'fecha_reporte',
        'fecha',
        'id_tramo',
        'tramo',
        'usuario_qfield',
        'observaciones',
        'estado',
        'latitud',
        'longitud',
      ]),
    [geoDiario],
  );

  const expPmt = useMemo(
    () =>
      pickCols(geoPmt, [
        'folio',
        'numero_pmt',
        'civ',
        'descripcion',
        'inicio_vigencia',
        'fin_vigencia',
        'responsable',
        'usuario',
        'estado',
        'latitud',
        'longitud',
      ]),
    [geoPmt],
  );

  // ── Capas para el toggle de capas ─────────────────────────────────────────
  const CAPAS = [
    { key: 'showCant' as const, label: 'Cantidades de Obra', color: ESTADO_COLOR.APROBADO },
    { key: 'showComp' as const, label: 'Componentes Transv.', color: ESTADO_COLOR.REVISADO },
    { key: 'showDiario' as const, label: 'Reporte Diario', color: ESTADO_COLOR.BORRADOR },
    { key: 'showPmt' as const, label: 'Formularios PMT', color: ESTADO_COLOR.DEVUELTO },
  ] as const;

  // ── Tabs de resumen ────────────────────────────────────────────────────────
  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'cantidades', label: 'Cantidades', count: geoCant.length },
    { key: 'componentes', label: 'Componentes', count: geoComp.length },
    { key: 'diario', label: 'Reporte Diario', count: geoDiario.length },
    { key: 'pmt', label: 'PMT', count: geoPmt.length },
  ];

  return (
    <div className="space-y-4">
      <SectionBadge label="Mapa de Ejecución" page="mapa-ejecucion" />
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Distribución Geográfica de Registros
      </h2>

      {/* ── Panel de filtros ── */}
      <div
        className="rounded-lg p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Filtros y capas
        </p>

        {/* Fila 1: rango de fechas, estado, búsqueda libre */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Desde</Label>
            <Input
              type="date"
              value={filters.desde}
              onChange={(e) => set({ desde: e.target.value })}
            />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input
              type="date"
              value={filters.hasta}
              onChange={(e) => set({ hasta: e.target.value })}
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={filters.estado} onValueChange={(v) => set({ estado: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPTS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Búsqueda libre</Label>
            <Input
              placeholder="Folio, CIV, tramo…"
              value={filters.buscar}
              onChange={(e) => set({ buscar: e.target.value })}
            />
          </div>
        </div>

        {/* Fila 2: filtros avanzados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>Tramo</Label>
            <Input value={filters.tramo} onChange={(e) => set({ tramo: e.target.value })} />
          </div>
          <div>
            <Label>CIV</Label>
            <Input value={filters.civ} onChange={(e) => set({ civ: e.target.value })} />
          </div>
          <div>
            <Label>Ítem de pago</Label>
            <Input value={filters.item} onChange={(e) => set({ item: e.target.value })} />
          </div>
          <div>
            <Label>Componente / Cap.</Label>
            <Input value={filters.comp} onChange={(e) => set({ comp: e.target.value })} />
          </div>
        </div>

        {/* Fila 3: toggle de capas */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {CAPAS.map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={(e) => set({ [key]: e.target.checked })}
                style={{ accentColor: color, width: 14, height: 14 }}
              />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Cantidades"
          value={filteredCant.length}
          accent="green"
          sublabel={`${geoCant.length} con coordenadas`}
        />
        <KpiCard
          label="Componentes"
          value={filteredComp.length}
          accent="orange"
          sublabel={`${geoComp.length} con coordenadas`}
        />
        <KpiCard
          label="Reporte Diario"
          value={filteredDiario.length}
          accent="blue"
          sublabel={`${geoDiario.length} con coordenadas`}
        />
        <KpiCard
          label="Cantidades Aprobadas"
          value={cantAprobadas}
          accent="teal"
          sublabel="registros_cantidades · APROBADO"
        />
      </div>

      {/* ── Exportación CSV ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <ExportCsvButton data={expCant} filename="Cantidades_geo" label="CSV Cantidades" />
        <ExportCsvButton data={expComp} filename="Componentes_geo" label="CSV Componentes" />
        <ExportCsvButton data={expDiario} filename="Diario_geo" label="CSV Diario" />
        <ExportCsvButton data={expPmt} filename="PMT_geo" label="CSV PMT" />
      </div>

      {/* ── Leyenda de estados ── */}
      <div className="flex flex-wrap gap-4">
        {LEYENDA.map((l) => (
          <div key={l.color} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span
            className="inline-block w-6 border-t-2 opacity-60"
            style={{ borderColor: '#6D8E2D' }}
          />
          Tramos (líneas)
        </div>
      </div>

      {/* ── Mapa ── */}
      <MapaEjecucionFull
        tramos={tramos}
        cantidades={geoCant}
        componentes={geoComp}
        reporteDiario={geoDiario}
        formularioPmt={geoPmt}
      />

      {/* ── Tablas de resumen ── */}
      <hr style={{ borderColor: 'var(--border)', margin: '0' }} />

      <div>
        {/* Tab headers */}
        <div className="flex border-b mb-3" style={{ borderColor: 'var(--border)' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === t.key ? 'var(--accent-teal)' : 'var(--text-muted)',
                borderBottom:
                  activeTab === t.key ? '2px solid var(--accent-teal)' : '2px solid transparent',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {t.label}
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: activeTab === t.key ? 'var(--accent-teal)' : 'var(--muted)',
                  color: activeTab === t.key ? '#1c3277' : 'var(--text-muted)',
                }}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'cantidades' && (
          <RecordTable
            records={geoCant}
            columns={[
              'folio',
              'fecha',
              'fecha_creacion',
              'id_tramo',
              'tramo',
              'civ',
              'tipo_actividad',
              'actividad',
              'item_pago',
              'capitulo',
              'cantidad',
              'unidad',
              'estado',
              'latitud',
              'longitud',
            ]}
            labels={{
              folio: 'Folio',
              fecha: 'Fecha',
              fecha_creacion: 'F. Creación',
              id_tramo: 'Tramo',
              tramo: 'Tramo',
              civ: 'CIV',
              tipo_actividad: 'Actividad',
              actividad: 'Actividad',
              item_pago: 'Ítem Pago',
              capitulo: 'Capítulo',
              cantidad: 'Cantidad',
              unidad: 'Unidad',
              estado: 'Estado',
              latitud: 'Lat',
              longitud: 'Lon',
            }}
            empty="Sin registros de cantidades con coordenadas."
          />
        )}
        {activeTab === 'componentes' && (
          <RecordTable
            records={geoComp}
            columns={[
              'folio',
              'fecha',
              'fecha_creacion',
              'id_tramo',
              'tramo',
              'tipo_componente',
              'tipo_actividad',
              'actividad',
              'cantidad',
              'unidad',
              'estado',
              'latitud',
              'longitud',
            ]}
            labels={{
              folio: 'Folio',
              fecha: 'Fecha',
              fecha_creacion: 'F. Creación',
              id_tramo: 'Tramo',
              tramo: 'Tramo',
              tipo_componente: 'Componente',
              tipo_actividad: 'Actividad',
              actividad: 'Actividad',
              cantidad: 'Cantidad',
              unidad: 'Unidad',
              estado: 'Estado',
              latitud: 'Lat',
              longitud: 'Lon',
            }}
            empty="Sin registros de componentes con coordenadas."
          />
        )}
        {activeTab === 'diario' && (
          <RecordTable
            records={geoDiario}
            columns={[
              'folio',
              'fecha_reporte',
              'fecha',
              'id_tramo',
              'tramo',
              'usuario_qfield',
              'observaciones',
              'estado',
              'latitud',
              'longitud',
            ]}
            labels={{
              folio: 'Folio',
              fecha_reporte: 'F. Reporte',
              fecha: 'Fecha',
              id_tramo: 'Tramo',
              tramo: 'Tramo',
              usuario_qfield: 'Usuario',
              observaciones: 'Observaciones',
              estado: 'Estado',
              latitud: 'Lat',
              longitud: 'Lon',
            }}
            empty="Sin registros de reporte diario con coordenadas."
          />
        )}
        {activeTab === 'pmt' && (
          <RecordTable
            records={geoPmt}
            columns={[
              'folio',
              'numero_pmt',
              'civ',
              'descripcion',
              'inicio_vigencia',
              'fin_vigencia',
              'responsable',
              'usuario',
              'estado',
              'latitud',
              'longitud',
            ]}
            labels={{
              folio: 'Folio',
              numero_pmt: 'Nro PMT',
              civ: 'CIV',
              descripcion: 'Descripción',
              inicio_vigencia: 'Inicio',
              fin_vigencia: 'Fin',
              responsable: 'Responsable',
              usuario: 'Usuario',
              estado: 'Estado',
              latitud: 'Lat',
              longitud: 'Lon',
            }}
            empty="Sin formularios PMT con coordenadas."
          />
        )}
      </div>
    </div>
  );
}
