'use client';
import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatCOP } from '@/lib/utils';
import type { Rol } from '@/types/database';

// ─── Paleta IDU ─────────────────────────────────────────────
const IDU_BLUE  = '#002D57';
const IDU_GREEN = '#6D8E2D';
const IDU_TEAL  = '#0076B0';
const IDU_GOLD  = '#E6BC00';

const TIPOS: Record<string, { nombre: string; und: string; colorMeta: string; colorEjec: string; accent: 'blue' | 'green' | 'teal' | 'gold' }> = {
  MV: { nombre: 'Malla Vial',     und: 'ml',  colorMeta: IDU_BLUE,  colorEjec: IDU_TEAL,  accent: 'teal'  },
  EP: { nombre: 'Espacio Público', und: 'm²', colorMeta: IDU_BLUE,  colorEjec: IDU_GREEN, accent: 'green' },
  CI: { nombre: 'Ciclorruta',     und: 'km',  colorMeta: IDU_BLUE,  colorEjec: IDU_GOLD,  accent: 'blue'  },
};

// ─── Helpers ────────────────────────────────────────────────
function pctColor(pct: number) {
  if (pct >= 70) return IDU_GREEN;
  if (pct >= 40) return '#FD7E14';
  return '#ED1C24';
}

function GlobalProgressBar({ label, pct, ejecutado, pendiente, total }: {
  label: string; pct: number; ejecutado: string; pendiente: string; total: string;
}) {
  const fill = pctColor(pct);
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: fill }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill, minWidth: pct > 5 ? undefined : '0' }}
        >
          {pct > 8 && (
            <span className="text-[10px] font-bold text-white">{pct.toFixed(1)}%</span>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>Ejecutado: <b style={{ color: 'var(--text-primary)' }}>{ejecutado}</b></span>
        <span>Pendiente: <b style={{ color: 'var(--text-primary)' }}>{pendiente}</b></span>
        <span>Total: <b style={{ color: 'var(--text-primary)' }}>{total}</b></span>
      </div>
    </div>
  );
}

function InlineProgressBar({ pct }: { pct: number }) {
  const fill = pctColor(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
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
        {label && <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>}
        <span className="text-[11px] font-bold ml-auto" style={{ color: fill }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, background: fill }}
        />
      </div>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────
function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--muted)' }}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className="flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
          style={
            active === t
              ? { background: IDU_BLUE, color: '#fff' }
              : { color: 'var(--text-muted)' }
          }
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────
export default function PresupuestoClient({
  items, tramos, rol,
}: { items: any[]; tramos: any[]; rol: Rol }) {

  // ── Filtros ────────────────────────────────────────────────
  const [compFilter, setCompFilter] = useState<string>('Todos');
  const [buscar, setBuscar]         = useState('');

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
      list = list.filter(i => {
        const cap = i.capitulo ?? i.componente ?? i.compenente ?? '';
        return String(cap).trim() === compFilter;
      });
    }
    if (buscar.trim()) {
      const q = buscar.trim().toLowerCase();
      list = list.filter(i =>
        [i.actividad, i.capitulo, i.componente, i.unidad, i.item_pago, i.descripcion]
          .some(v => v && String(v).toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, compFilter, buscar]);

  // ── KPIs financieros ───────────────────────────────────────
  const kpis = useMemo(() => {
    const total     = itemsFiltrados.reduce((a, i) => a + (Number(i.valor_total ?? 0) || (i.cantidad ?? 0) * (i.precio_unitario ?? 0)), 0);
    const ejecutado = itemsFiltrados.reduce((a, i) => a + (Number(i.valor_ejecutado ?? 0) || (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0)), 0);
    const pct       = total > 0 ? (ejecutado / total) * 100 : 0;
    return { total, ejecutado, pendiente: Math.max(total - ejecutado, 0), pct };
  }, [itemsFiltrados]);

  // ── Gráfica por capítulo ───────────────────────────────────
  const chartDataCap = useMemo(() => {
    const by: Record<string, { presupuestado: number; ejecutado: number }> = {};
    for (const i of itemsFiltrados) {
      const key = i.capitulo ?? i.componente ?? i.compenente ?? 'Sin capítulo';
      if (!by[key]) by[key] = { presupuestado: 0, ejecutado: 0 };
      by[key].presupuestado += Number(i.valor_total ?? 0) || (i.cantidad ?? 0) * (i.precio_unitario ?? 0);
      by[key].ejecutado     += Number(i.valor_ejecutado ?? 0) || (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0);
    }
    return Object.entries(by).map(([name, v]) => ({ name, ...v }));
  }, [itemsFiltrados]);

  // ── Meta física ────────────────────────────────────────────
  const tramosData = useMemo(() => {
    return tramos
      .filter(t => Number(t.meta_fisica ?? t.cicloruta_km ?? t.esp_publico_m2 ?? 0) > 0)
      .map(t => {
        const infra = t.infraestructura ?? '';
        const meta = Number(
          t.meta_fisica ??
          (infra === 'CI' ? t.cicloruta_km : t.esp_publico_m2) ??
          0
        );
        const ejec = Number(t.ejecutado ?? t.avance_pct ?? 0);
        const pct  = meta > 0 ? Math.min((ejec / meta) * 100, 100) : 0;
        return { ...t, _meta: meta, _ejec: ejec, _pct: pct, _infra: infra };
      });
  }, [tramos]);

  const metaKpis = useMemo(() => {
    const result: Record<string, { meta: number; ejec: number; pct: number; count: number }> = {};
    for (const codigo of Object.keys(TIPOS)) {
      const subset = tramosData.filter(t => t._infra === codigo);
      const meta   = subset.reduce((a, t) => a + t._meta, 0);
      const ejec   = subset.reduce((a, t) => a + t._ejec, 0);
      result[codigo] = {
        meta, ejec,
        pct: meta > 0 ? Math.min((ejec / meta) * 100, 100) : 0,
        count: subset.length,
      };
    }
    return result;
  }, [tramosData]);

  // ── Tab de meta física ─────────────────────────────────────
  const tabLabels = Object.values(TIPOS).map(t => t.nombre);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const activeCodigo = Object.entries(TIPOS).find(([, v]) => v.nombre === activeTab)?.[0] ?? 'MV';

  const chartDataTramo = useMemo(() => {
    const info = TIPOS[activeCodigo];
    return tramosData
      .filter(t => t._infra === activeCodigo)
      .map(t => ({
        name: String(t.id_tramo ?? t.nombre ?? t.id ?? '—'),
        meta: t._meta,
        ejecutado: t._ejec,
        und: info.und,
      }));
  }, [tramosData, activeCodigo]);

  return (
    <div className="space-y-5">
      <SectionBadge label="Seguimiento Presupuestal" page="presupuesto" />

      {/* ── Filtros ── */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Filtros</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Componente / Capítulo</Label>
            <Select value={compFilter} onValueChange={setCompFilter}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {capitulos.map(c => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
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
              onChange={e => setBuscar(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── KPIs financieros ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Valor total contrato" value={formatCOP(kpis.total)}    accent="blue"   sublabel={`$${kpis.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`} />
        <KpiCard label="Valor ejecutado"       value={formatCOP(kpis.ejecutado)} accent="green"  sublabel={`${kpis.pct.toFixed(1)}% del contrato`} />
        <KpiCard label="Valor pendiente"       value={formatCOP(kpis.pendiente)} accent="orange" sublabel={`${(100 - kpis.pct).toFixed(1)}% por ejecutar`} />
        <KpiCard
          label="Ítems con ejecución"
          value={String(itemsFiltrados.filter(i => (i.cantidad_ejecutada ?? 0) > 0).length)}
          accent="teal"
          sublabel={`de ${itemsFiltrados.length} ítems`}
        />
      </div>

      {/* ── Barra global de ejecución ── */}
      <GlobalProgressBar
        label="Ejecución global del presupuesto"
        pct={kpis.pct}
        ejecutado={formatCOP(kpis.ejecutado)}
        pendiente={formatCOP(kpis.pendiente)}
        total={formatCOP(kpis.total)}
      />

      {/* ── Gráfica presupuesto por capítulo ── */}
      {chartDataCap.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold mb-3">Presupuesto vs Ejecutado por capítulo</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartDataCap} margin={{ top: 5, right: 16, left: 16, bottom: 5 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={v => `$${(v / 1_000_000).toFixed(0)}M`} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number, name: string) => [`$${(v / 1_000_000).toFixed(1)} M`, name === 'presupuestado' ? 'Presupuestado' : 'Ejecutado']}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="presupuestado" name="Presupuestado" fill={IDU_BLUE}  radius={[4, 4, 0, 0]} />
              <Bar dataKey="ejecutado"     name="Ejecutado"     fill={IDU_GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Tabla presupuestal ── */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold">Tabla presupuestal</p>
          <ExportCsvButton data={itemsFiltrados} filename="presupuesto" />
        </div>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* scroll: 10 filas visibles × ~40px ≈ 440px */}
          <div className="overflow-x-auto">
            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              <table className="w-full text-xs min-w-[900px]">
                <thead
                  className="sticky top-0 z-10"
                  style={{ background: 'var(--muted)' }}
                >
                  <tr>
                    {['Capítulo', 'Actividad', 'Und', 'Cant. Prog.', 'V. Unitario', 'V. Programado', 'Cant. Ejec.', 'V. Ejecutado', 'Ejecución'].map(h => (
                      <th key={h} className="p-2 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {itemsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sin resultados para los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    itemsFiltrados.map((i: any, idx: number) => {
                      const cantProg = i.cantidad ?? i.cantidad_contrato ?? 0;
                      const pu       = i.precio_unitario ?? i.valor_unitario ?? 0;
                      const vProg    = Number(i.valor_total ?? 0) || cantProg * pu;
                      const cantEjec = i.cantidad_ejecutada ?? 0;
                      const vEjec    = Number(i.valor_ejecutado ?? 0) || cantEjec * pu;
                      const pct      = vProg > 0 ? (vEjec / vProg) * 100 : 0;
                      return (
                        <tr
                          key={i.id ?? idx}
                          className="border-t hover:bg-[var(--muted)]/40 transition-colors"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <td className="p-2 whitespace-nowrap">{i.capitulo ?? i.componente ?? i.compenente ?? '—'}</td>
                          <td className="p-2 max-w-[200px] truncate" title={i.actividad ?? i.descripcion}>{i.actividad ?? i.descripcion ?? '—'}</td>
                          <td className="p-2 font-mono">{i.unidad ?? i.und ?? '—'}</td>
                          <td className="p-2 text-right font-mono tabular-nums">{(cantProg as number).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="p-2 text-right font-mono tabular-nums">{formatCOP(pu)}</td>
                          <td className="p-2 text-right font-mono tabular-nums">{formatCOP(vProg)}</td>
                          <td className="p-2 text-right font-mono tabular-nums">{(cantEjec as number).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="p-2 text-right font-mono tabular-nums">{formatCOP(vEjec)}</td>
                          <td className="p-2 min-w-[120px]">
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
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {itemsFiltrados.length} ítems · desplaza para ver más
        </p>
      </div>

      {/* ══ SECCIÓN META FÍSICA ══════════════════════════════════ */}
      {tramosData.length > 0 && (
        <>
          <div className="pt-2">
            <SectionBadge label="Seguimiento Avance Meta Física General" page="presupuesto" />
          </div>

          {/* ── KPIs por tipo + barra ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(TIPOS).map(([codigo, info]) => {
              const k = metaKpis[codigo] ?? { meta: 0, ejec: 0, pct: 0, count: 0 };
              if (k.meta === 0) return null;
              return (
                <div
                  key={codigo}
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <KpiCard
                    label={info.nombre}
                    value={`${k.ejec.toLocaleString('es-CO', { maximumFractionDigits: 1 })} / ${k.meta.toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${info.und}`}
                    accent={info.accent}
                    sublabel={`${k.count} tramo(s) · Pendiente: ${Math.max(k.meta - k.ejec, 0).toLocaleString('es-CO', { maximumFractionDigits: 1 })} ${info.und}`}
                  />
                  <TypeProgressBar pct={k.pct} label="Avance" />
                </div>
              );
            })}
          </div>

          {/* ── Dashboard detalle por tramo con tabs ── */}
          <div>
            <SectionBadge label="Seguimiento Avance Meta Física por Tramo" page="presupuesto" />
          </div>

          <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Tabs tabs={tabLabels} active={activeTab} onChange={setActiveTab} />

            {chartDataTramo.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                Sin tramos registrados para {activeTab}.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Gráfica */}
                <div className="lg:col-span-3">
                  <p className="text-xs font-semibold mb-3">
                    Meta física vs Ejecutado — {activeTab} ({TIPOS[activeCodigo].und})
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartDataTramo} margin={{ top: 5, right: 16, left: 8, bottom: 30 }} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--border)' }}
                        formatter={(v: number) => [v.toLocaleString('es-CO', { maximumFractionDigits: 2 }), '']}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="meta"      name="Meta física"  fill={TIPOS[activeCodigo].colorMeta} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ejecutado" name="Ejecutado"    fill={TIPOS[activeCodigo].colorEjec} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabla resumen por tramo */}
                <div className="lg:col-span-2">
                  <p className="text-xs font-semibold mb-3">Detalle por tramo</p>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    <table className="w-full text-xs">
                      <thead className="sticky top-0" style={{ background: 'var(--muted)' }}>
                        <tr>
                          <th className="p-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>Tramo</th>
                          <th className="p-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Meta</th>
                          <th className="p-2 text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Ejec.</th>
                          <th className="p-2 min-w-[90px]" style={{ color: 'var(--text-muted)' }}>Avance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tramosData
                          .filter(t => t._infra === activeCodigo)
                          .map((t, idx) => (
                            <tr
                              key={t.id_tramo ?? t.id ?? idx}
                              className="border-t"
                              style={{ borderColor: 'var(--border)' }}
                            >
                              <td className="p-2 font-mono">{t.id_tramo ?? t.nombre ?? t.id ?? '—'}</td>
                              <td className="p-2 text-right tabular-nums">{t._meta.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</td>
                              <td className="p-2 text-right tabular-nums">{t._ejec.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</td>
                              <td className="p-2">
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
