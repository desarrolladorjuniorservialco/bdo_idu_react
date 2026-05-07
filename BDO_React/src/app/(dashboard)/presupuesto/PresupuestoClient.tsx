'use client';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCOP } from '@/lib/utils';
import type { Rol } from '@/types/database';
import { useCallback, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type BudgetItem = Record<string, unknown>;
type TramoItem = Record<string, unknown>;

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

// â”€â”€â”€ Paleta IDU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IDU_BLUE = '#002D57';
const IDU_GREEN = '#6D8E2D';
const IDU_TEAL = '#0076B0';
const IDU_GOLD = '#E6BC00';

const TIPOS: Record<
  string,
  {
    nombre: string;
    und: string;
    colorMeta: string;
    colorEjec: string;
    accent: 'blue' | 'green' | 'teal' | 'gold';
  }
> = {
  MV: {
    nombre: 'Malla Vial',
    und: 'ml',
    colorMeta: IDU_BLUE,
    colorEjec: IDU_TEAL,
    accent: 'teal',
  },
  EP: {
    nombre: 'Espacio Público',
    und: 'm²',
    colorMeta: IDU_BLUE,
    colorEjec: IDU_GREEN,
    accent: 'green',
  },
  CI: {
    nombre: 'Ciclorruta',
    und: 'km',
    colorMeta: IDU_BLUE,
    colorEjec: IDU_GOLD,
    accent: 'blue',
  },
};

// â”€â”€â”€ Anchos por defecto de la tabla presupuestal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEFAULT_COL_WIDTHS = [110, 220, 55, 95, 110, 120, 95, 120, 130];
const COL_HEADERS = [
  'Capítulo',
  'Actividad',
  'Und',
  'Cant. Prog.',
  'V. Unitario',
  'V. Programado',
  'Cant. Ejec.',
  'V. Ejecutado',
  'Ejecución',
];

// â”€â”€â”€ Hook redimensionamiento de columnas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useColumnResize(defaults: number[]) {
  const [widths, setWidths] = useState<number[]>(defaults);

  const startResize = useCallback(
    (colIdx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = widths[colIdx];

      const onMove = (ev: PointerEvent) => {
        const next = Math.max(50, startWidth + ev.clientX - startX);
        setWidths((prev) => {
          const a = [...prev];
          a[colIdx] = next;
          return a;
        });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [widths],
  );

  return { widths, startResize };
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function pctColor(pct: number) {
  if (pct >= 70) return IDU_GREEN;
  if (pct >= 40) return '#FD7E14';
  return '#ED1C24';
}

function GlobalProgressBar({
  label,
  pct,
  ejecutado,
  pendiente,
  total,
}: {
  label: string;
  pct: number;
  ejecutado: string;
  pendiente: string;
  total: string;
}) {
  const fill = pctColor(pct);
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color: fill }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill }}
        >
          {pct > 8 && <span className="text-[10px] font-bold text-white">{pct.toFixed(1)}%</span>}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>
          Ejecutado: <b style={{ color: 'var(--text-primary)' }}>{ejecutado}</b>
        </span>
        <span>
          Pendiente: <b style={{ color: 'var(--text-primary)' }}>{pendiente}</b>
        </span>
        <span>
          Total: <b style={{ color: 'var(--text-primary)' }}>{total}</b>
        </span>
      </div>
    </div>
  );
}

function InlineProgressBar({ pct }: { pct: number }) {
  const fill = pctColor(pct);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--muted)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill }}
        />
      </div>
      <span className="text-[10px] font-mono tabular-nums w-10 text-right" style={{ color: fill }}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

function TypeProgressBar({ pct, label }: { pct: number; label?: string }) {
  const fill = pctColor(pct);
  return (
    <div className="mt-2">
      <div className="flex justify-between mb-1">
        {label && (
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {label}
          </span>
        )}
        <span className="text-[11px] font-bold ml-auto" style={{ color: fill }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill }}
        />
      </div>
    </div>
  );
}

function TabBar({
  tabs,
  active,
  onChange,
}: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--muted)' }}>
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
          style={
            active === t ? { background: IDU_BLUE, color: '#fff' } : { color: 'var(--text-muted)' }
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PresupuestoClient({
  items,
  tramos,
  rol,
}: { items: BudgetItem[]; tramos: TramoItem[]; rol: Rol }) {
  // â”€â”€ Filtros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [compFilter, setCompFilter] = useState<string>('Todos');
  const [buscar, setBuscar] = useState('');

  const capitulos = useMemo(() => {
    const set = new Set<string>();
    for (const i of items) {
      const cap = i.capitulo ?? i.componente ?? i.compenente;
      if (cap) set.add(String(cap).trim());
    }
    return ['Todos', ...Array.from(set).sort()];
  }, [items]);

  const itemsFiltrados = useMemo(() => {
    let list = items;
    if (compFilter !== 'Todos') {
      list = list.filter((i) => {
        const cap = i.capitulo ?? i.componente ?? i.compenente ?? '';
        return String(cap).trim() === compFilter;
      });
    }
    if (buscar.trim()) {
      const q = buscar.trim().toLowerCase();
      list = list.filter((i) =>
        [i.actividad, i.capitulo, i.componente, i.unidad, i.item_pago, i.descripcion].some(
          (v) => v && String(v).toLowerCase().includes(q),
        ),
      );
    }
    return list;
  }, [items, compFilter, buscar]);

  // â”€â”€ KPIs financieros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const kpis = useMemo(() => {
    const total = itemsFiltrados.reduce(
      (a, i) => a + (toNumber(i.valor_total) || toNumber(i.cantidad) * toNumber(i.precio_unitario)),
      0,
    );
    const ejecutado = itemsFiltrados.reduce(
      (a, i) =>
        a +
        (toNumber(i.valor_ejecutado) ||
          toNumber(i.cantidad_ejecutada) * toNumber(i.precio_unitario)),
      0,
    );
    const pct = total > 0 ? (ejecutado / total) * 100 : 0;
    return { total, ejecutado, pendiente: Math.max(total - ejecutado, 0), pct };
  }, [itemsFiltrados]);

  // â”€â”€ Gráfica por capítulo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chartDataCap = useMemo(() => {
    const by: Record<string, { presupuestado: number; ejecutado: number }> = {};
    for (const i of itemsFiltrados) {
      const key = String(i.capitulo ?? i.componente ?? i.compenente ?? 'Sin capítulo');
      if (!by[key]) by[key] = { presupuestado: 0, ejecutado: 0 };
      by[key].presupuestado +=
        toNumber(i.valor_total) || toNumber(i.cantidad) * toNumber(i.precio_unitario);
      by[key].ejecutado +=
        toNumber(i.valor_ejecutado) || toNumber(i.cantidad_ejecutada) * toNumber(i.precio_unitario);
    }
    return Object.entries(by).map(([name, v]) => ({ name, ...v }));
  }, [itemsFiltrados]);

  // â”€â”€ Redimensionamiento de columnas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { widths, startResize } = useColumnResize(DEFAULT_COL_WIDTHS);
  const totalTableWidth = widths.reduce((a, b) => a + b, 0);

  // â”€â”€ Meta física â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const tramosData = useMemo(() => {
    return tramos
      .map((t) => {
        const infra = String(t.infraestructura ?? '').toUpperCase();
        // meta: preferir meta_fisica, luego derivar por tipo
        const meta = Number(
          t.meta_fisica ??
            (infra === 'CI' ? t.cicloruta_km : infra === 'EP' ? t.esp_publico_m2 : null) ??
            0,
        );
        // ejecutado puede ser numÃ©rico (cantidad) o booleano legacy
        const ejecRaw = t.ejecutado;
        const ejec =
          typeof ejecRaw === 'boolean'
            ? ejecRaw
              ? meta
              : 0
            : Number(ejecRaw ?? t.avance_pct ?? 0);
        const pct = meta > 0 ? Math.min((ejec / meta) * 100, 100) : 0;
        return { ...t, _meta: meta, _ejec: ejec, _pct: pct, _infra: infra };
      })
      .filter((t) => t._meta > 0);
  }, [tramos]);

  const metaKpis = useMemo(() => {
    const result: Record<string, { meta: number; ejec: number; pct: number; count: number }> = {};
    for (const codigo of Object.keys(TIPOS)) {
      const subset = tramosData.filter((t) => t._infra === codigo);
      const meta = subset.reduce((a, t) => a + t._meta, 0);
      const ejec = subset.reduce((a, t) => a + t._ejec, 0);
      result[codigo] = {
        meta,
        ejec,
        pct: meta > 0 ? Math.min((ejec / meta) * 100, 100) : 0,
        count: subset.length,
      };
    }
    return result;
  }, [tramosData]);

  const tabLabels = Object.values(TIPOS).map((t) => t.nombre);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const activeCodigo = Object.entries(TIPOS).find(([, v]) => v.nombre === activeTab)?.[0] ?? 'MV';

  const chartDataTramo = useMemo(() => {
    return tramosData
      .filter((t) => t._infra === activeCodigo)
      .map((t) => ({
        name: String(
          (t as Record<string, unknown>).id_tramo ??
            (t as Record<string, unknown>).nombre ??
            (t as Record<string, unknown>).id ??
            'â€”',
        ),
        meta: t._meta,
        ejecutado: t._ejec,
      }));
  }, [tramosData, activeCodigo]);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="space-y-5">
      <SectionBadge label="Seguimiento Presupuestal" page="presupuesto" />

      {/* â”€â”€ Filtros â”€â”€ */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Filtros
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Componente / Capítulo</Label>
            <Select value={compFilter} onValueChange={setCompFilter}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {capitulos.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Buscar ítem / descripción</Label>
            <Input
              className="mt-1 h-8 text-xs"
              placeholder="Actividad, unidad, ítem…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* â”€â”€ KPIs financieros â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Valor total contrato"
          value={formatCOP(kpis.total)}
          accent="blue"
          sublabel={`$${kpis.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
        />
        <KpiCard
          label="Valor ejecutado"
          value={formatCOP(kpis.ejecutado)}
          accent="green"
          sublabel={`${kpis.pct.toFixed(1)}% del contrato`}
        />
        <KpiCard
          label="Valor pendiente"
          value={formatCOP(kpis.pendiente)}
          accent="orange"
          sublabel={`${(100 - kpis.pct).toFixed(1)}% por ejecutar`}
        />
        <KpiCard
          label="Ítems con ejecución"
          value={String(itemsFiltrados.filter((i) => toNumber(i.cantidad_ejecutada) > 0).length)}
          accent="teal"
          sublabel={`de ${itemsFiltrados.length} ítems`}
        />
      </div>

      {/* â”€â”€ Barra de ejecución global â”€â”€ */}
      <GlobalProgressBar
        label="Ejecución global del presupuesto"
        pct={kpis.pct}
        ejecutado={formatCOP(kpis.ejecutado)}
        pendiente={formatCOP(kpis.pendiente)}
        total={formatCOP(kpis.total)}
      />

      {/* â”€â”€ Gráfica por capítulo â”€â”€ */}
      {chartDataCap.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm font-semibold mb-3">Presupuesto vs Ejecutado por capítulo</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartDataCap}
              margin={{ top: 5, right: 16, left: 16, bottom: 5 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis
                tickFormatter={(v: string | number) => `$${(toNumber(v) / 1_000_000).toFixed(0)}M`}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(v: string | number, name: string) => [
                  `$${(toNumber(v) / 1_000_000).toFixed(1)} M`,
                  name === 'presupuestado' ? 'Presupuestado' : 'Ejecutado',
                ]}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="presupuestado"
                name="Presupuestado"
                fill={IDU_BLUE}
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="ejecutado" name="Ejecutado" fill={IDU_GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* â”€â”€ Tabla presupuestal con columnas redimensionables â”€â”€ */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold">Tabla presupuestal</p>
          <ExportCsvButton data={itemsFiltrados} filename="presupuesto" />
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* contenedor con scroll horizontal + vertical (~10 filas Ã— 38px) */}
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 420 }}>
            <table
              style={{
                tableLayout: 'fixed',
                width: totalTableWidth,
                fontSize: 12,
                borderCollapse: 'collapse',
              }}
            >
              <colgroup>
                {widths.map((w, i) => (
                  <col key={COL_HEADERS[i] ?? `col-${w}`} style={{ width: w }} />
                ))}
              </colgroup>

              <thead className="sticky top-0 z-10" style={{ background: 'var(--muted)' }}>
                <tr>
                  {COL_HEADERS.map((h, i) => (
                    <th
                      key={h}
                      className="text-left font-semibold select-none"
                      style={{
                        padding: '8px 10px',
                        color: 'var(--text-muted)',
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      {h}
                      {/* Manija de redimensionamiento */}
                      <div
                        onPointerDown={startResize(i)}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 5,
                          cursor: 'col-resize',
                          background: 'transparent',
                          borderRight: '2px solid var(--border)',
                          zIndex: 1,
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                      }}
                    >
                      Sin resultados para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((item: BudgetItem, idx: number) => {
                    const cantProg = toNumber(item.cantidad ?? item.cantidad_contrato);
                    const pu = toNumber(item.precio_unitario ?? item.valor_unitario);
                    const vProg = toNumber(item.valor_total) || cantProg * pu;
                    const cantEjec = toNumber(item.cantidad_ejecutada);
                    const vEjec = toNumber(item.valor_ejecutado) || cantEjec * pu;
                    const pct = vProg > 0 ? (vEjec / vProg) * 100 : 0;

                    const cellStyle: React.CSSProperties = {
                      padding: '7px 10px',
                      borderTop: '1px solid var(--border)',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    };

                    return (
                      <tr
                        key={String(item.id ?? idx)}
                        style={{
                          background: idx % 2 === 0 ? 'transparent' : 'var(--muted)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'color-mix(in srgb, var(--muted) 60%, transparent)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            idx % 2 === 0 ? 'transparent' : 'var(--muted)';
                        }}
                      >
                        <td
                          style={cellStyle}
                          title={String(item.capitulo ?? item.componente ?? '')}
                        >
                          {String(item.capitulo ?? item.componente ?? item.compenente ?? 'â€”')}
                        </td>
                        <td
                          style={cellStyle}
                          title={String(item.actividad ?? item.descripcion ?? '')}
                        >
                          {String(item.actividad ?? item.descripcion ?? 'â€”')}
                        </td>
                        <td style={{ ...cellStyle, fontFamily: 'monospace' }}>
                          {String(item.unidad ?? item.und ?? 'â€”')}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                          }}
                        >
                          {Number(cantProg).toLocaleString('es-CO', {
                            maximumFractionDigits: 3,
                          })}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                          }}
                        >
                          {formatCOP(pu)}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                          }}
                        >
                          {formatCOP(vProg)}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                          }}
                        >
                          {Number(cantEjec).toLocaleString('es-CO', {
                            maximumFractionDigits: 3,
                          })}
                        </td>
                        <td
                          style={{
                            ...cellStyle,
                            textAlign: 'right',
                            fontFamily: 'monospace',
                          }}
                        >
                          {formatCOP(vEjec)}
                        </td>
                        <td style={{ ...cellStyle, minWidth: 0 }}>
                          <InlineProgressBar pct={pct} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {itemsFiltrados.length} ítems Â· arrastra el borde de la columna para redimensionar Â·
          desplaza verticalmente para ver más
        </p>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SECCIÓN META FÍSICA â€” siempre visible
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="pt-2">
        <SectionBadge label="Seguimiento Avance Meta Física General" page="presupuesto" />
      </div>

      {tramos.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Sin datos de meta física. Verifica la tabla <code>tramos_bd</code> en Supabase.
          </p>
        </div>
      ) : tramosData.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ningún tramo tiene meta física registrada (<code>meta_fisica</code>,{' '}
            <code>cicloruta_km</code> o <code>esp_publico_m2</code>).
          </p>
        </div>
      ) : (
        <>
          {/* â”€â”€ KPIs acumulados por tipo â”€â”€ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(TIPOS).map(([codigo, info]) => {
              const k = metaKpis[codigo] ?? {
                meta: 0,
                ejec: 0,
                pct: 0,
                count: 0,
              };
              if (k.meta === 0) return null;
              return (
                <div
                  key={codigo}
                  className="rounded-xl p-4"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <KpiCard
                    label={info.nombre}
                    value={`${k.ejec.toLocaleString('es-CO', { maximumFractionDigits: 1 })} / ${k.meta.toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${info.und}`}
                    accent={info.accent}
                    sublabel={`${k.count} tramo(s) Â· Pendiente: ${Math.max(k.meta - k.ejec, 0).toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${info.und}`}
                  />
                  <TypeProgressBar pct={k.pct} label="Avance" />
                </div>
              );
            })}
          </div>

          {/* â”€â”€ Dashboard por tramo con tabs â”€â”€ */}
          <div className="pt-1">
            <SectionBadge label="Seguimiento Avance Meta Física por Tramo" page="presupuesto" />
          </div>

          <div
            className="rounded-xl p-4 space-y-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <TabBar tabs={tabLabels} active={activeTab} onChange={setActiveTab} />

            {chartDataTramo.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                Sin tramos registrados para <b>{activeTab}</b>.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-2">
                {/* Gráfica barras */}
                <div className="lg:col-span-3">
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                    Meta física vs Ejecutado â€” {activeTab} ({TIPOS[activeCodigo].und})
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={chartDataTramo}
                      margin={{ top: 8, right: 16, left: 8, bottom: 40 }}
                      barCategoryGap="28%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={50}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string | number) =>
                          toNumber(v).toLocaleString('es-CO', {
                            maximumFractionDigits: 0,
                          })
                        }
                        label={{
                          value: TIPOS[activeCodigo].und,
                          angle: -90,
                          position: 'insideLeft',
                          fontSize: 10,
                          dy: 20,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: 11,
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                        }}
                        formatter={(v: string | number, name: string) => [
                          `${toNumber(v).toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${TIPOS[activeCodigo].und}`,
                          name === 'meta' ? 'Meta física' : 'Ejecutado',
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11 }}
                        formatter={(v: string) => (v === 'meta' ? 'Meta física' : 'Ejecutado')}
                      />
                      <Bar
                        dataKey="meta"
                        name="meta"
                        fill={TIPOS[activeCodigo].colorMeta}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="ejecutado"
                        name="ejecutado"
                        fill={TIPOS[activeCodigo].colorEjec}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabla de detalle por tramo */}
                <div className="lg:col-span-2">
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                    Detalle por tramo
                  </p>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    <table className="w-full" style={{ fontSize: 12, borderCollapse: 'collapse' }}>
                      <thead className="sticky top-0" style={{ background: 'var(--muted)' }}>
                        <tr>
                          {[
                            'Tramo',
                            `Meta (${TIPOS[activeCodigo].und})`,
                            `Ejec. (${TIPOS[activeCodigo].und})`,
                            'Avance',
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: '6px 8px',
                                textAlign: h === 'Tramo' ? 'left' : 'right',
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tramosData
                          .filter((t) => t._infra === activeCodigo)
                          .map((t, idx) => (
                            <tr
                              key={String(
                                (t as Record<string, unknown>).id_tramo ??
                                  (t as Record<string, unknown>).id ??
                                  idx,
                              )}
                              style={{ borderTop: '1px solid var(--border)' }}
                            >
                              <td
                                style={{
                                  padding: '6px 8px',
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                }}
                              >
                                {String(
                                  (t as Record<string, unknown>).id_tramo ??
                                    (t as Record<string, unknown>).nombre ??
                                    (t as Record<string, unknown>).id ??
                                    'â€”',
                                )}
                              </td>
                              <td
                                style={{
                                  padding: '6px 8px',
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {t._meta.toLocaleString('es-CO', {
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td
                                style={{
                                  padding: '6px 8px',
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {t._ejec.toLocaleString('es-CO', {
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td style={{ padding: '6px 8px', minWidth: 100 }}>
                                <InlineProgressBar pct={t._pct} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
