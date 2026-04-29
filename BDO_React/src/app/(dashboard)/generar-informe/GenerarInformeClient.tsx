'use client';

import type {
  InformeAnotacion,
  InformeCantidad,
  InformeComponente,
  InformeData,
  InformeDiario,
} from '@/components/pdf/InformePdf';
import { InformePdfDownload } from '@/components/pdf/InformePdf';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { createClient } from '@/lib/supabase/client';
import { type ReactElement, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

type EstadoFiltro =
  | 'Todos'
  | 'Solo Aprobados'
  | 'Revisados y Aprobados'
  | 'Solo Borradores'
  | 'Solo Devueltos';

type TipoFormulario =
  | 'Cantidades de Obra'
  | 'Componentes Transversales'
  | 'Reporte Diario'
  | 'Anotaciones';

const ESTADO_MAP: Record<EstadoFiltro, string[] | null> = {
  Todos: null,
  'Solo Aprobados': ['APROBADO'],
  'Revisados y Aprobados': ['REVISADO', 'APROBADO'],
  'Solo Borradores': ['BORRADOR'],
  'Solo Devueltos': ['DEVUELTO'],
};

const TIPOS: TipoFormulario[] = [
  'Cantidades de Obra',
  'Componentes Transversales',
  'Reporte Diario',
  'Anotaciones',
];

const PREVIEW_LIMIT = 5;

function asDate(raw: unknown): Date | null {
  if (!raw) return null;
  const d = new Date(String(raw));
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(raw: unknown, fi: string, ff: string): boolean {
  const d = asDate(raw);
  if (!d) return false;
  const from = new Date(`${fi}T00:00:00`);
  const to = new Date(`${ff}T23:59:59`);
  return d >= from && d <= to;
}

function containsInsensitive(raw: unknown, q: string): boolean {
  if (!q.trim()) return true;
  return String(raw ?? '')
    .toLowerCase()
    .includes(q.trim().toLowerCase());
}

function byEstado<T extends { estado?: unknown }>(rows: T[], filtro: EstadoFiltro): T[] {
  const estados = ESTADO_MAP[filtro];
  if (!estados) return rows;
  return rows.filter((r) => estados.includes(String(r.estado ?? '').toUpperCase()));
}

function fmtDate(raw: unknown): string {
  if (!raw) return '—';
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function truncate(s: unknown, n = 45): string {
  const str = String(s ?? '');
  if (!str || str === 'undefined' || str === 'null') return '—';
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

function EstadoBadge({ estado }: { estado: unknown }) {
  const val = String(estado ?? '').toUpperCase();
  const map: Record<string, { background: string; color: string }> = {
    APROBADO: { background: '#d1fae5', color: '#065f46' },
    REVISADO: { background: '#dbeafe', color: '#1e40af' },
    BORRADOR: { background: '#fef3c7', color: '#92400e' },
    DEVUELTO: { background: '#fee2e2', color: '#991b1b' },
  };
  const s = map[val] ?? { background: 'var(--bg-muted)', color: 'var(--text-muted)' };
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={s}
    >
      {val || '—'}
    </span>
  );
}

type CellValue = string | ReactElement;

function PreviewTable({ headers, rows }: { headers: string[]; rows: CellValue[][] }) {
  return (
    <div
      className="overflow-x-auto rounded-md border text-xs"
      style={{ borderColor: 'var(--border)' }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--bg-muted)' }}>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-left font-medium whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static preview table, rows never reorder
            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
              {row.map((cell, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed column count, stable order
                <td key={j} className="px-3 py-2 max-w-[200px] truncate">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-2">
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium w-full text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-xs opacity-60">{open ? '▾' : '▸'}</span>
        {title}
        <span
          className="rounded-full px-2 py-0.5 text-xs font-normal"
          style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}
        >
          {count}
        </span>
      </button>
      {open && children}
    </div>
  );
}

export default function GenerarInformeClient({ contratoId }: { contratoId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [data, setData] = useState<InformeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fi, setFi] = useState(weekAgo);
  const [ff, setFf] = useState(today);
  const [estado, setEstado] = useState<EstadoFiltro>('Todos');
  const [tramo, setTramo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [tiposSel, setTiposSel] = useState<TipoFormulario[]>(['Cantidades de Obra']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const [
        { data: contrato, error: contratoError },
        { data: cantidades, error: cantidadesError },
        { data: componentes, error: componentesError },
        { data: diario, error: diarioError },
        { data: anotaciones, error: anotacionesError },
        { data: clima, error: climaError },
        { data: personal, error: personalError },
        { data: maquinaria, error: maquinariaError },
        { data: sst, error: sstError },
      ] = await Promise.all([
        supabase.from('contratos').select('*').eq('id', contratoId).single(),
        supabase.from('registros_cantidades').select('*').eq('contrato_id', contratoId),
        supabase.from('registros_componentes').select('*').eq('contrato_id', contratoId),
        supabase.from('registros_reporte_diario').select('*').eq('contrato_id', contratoId),
        supabase.from('anotaciones_generales').select('*').eq('contrato_id', contratoId),
        supabase.from('bd_condicion_climatica').select('*').eq('contrato_id', contratoId),
        supabase.from('bd_personal_obra').select('*').eq('contrato_id', contratoId),
        supabase.from('bd_maquinaria_obra').select('*').eq('contrato_id', contratoId),
        supabase.from('bd_sst_ambiental').select('*').eq('contrato_id', contratoId),
      ]);

      const firstError =
        contratoError ??
        cantidadesError ??
        componentesError ??
        diarioError ??
        anotacionesError ??
        climaError ??
        personalError ??
        maquinariaError ??
        sstError;

      if (!active) return;

      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      setData({
        contrato,
        cantidades: cantidades ?? [],
        componentes: componentes ?? [],
        diario: diario ?? [],
        anotaciones: anotaciones ?? [],
        clima: clima ?? [],
        personal: personal ?? [],
        maquinaria: maquinaria ?? [],
        sst: sst ?? [],
        generado_en: new Date().toISOString(),
      });
      setLoading(false);
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [contratoId]);

  const filtered = useMemo(() => {
    const baseData: InformeData = data ?? {};
    const cantidadesBase = byEstado(baseData.cantidades ?? [], estado).filter(
      (r: InformeCantidad) => {
        const tramoVal = r.id_tramo ?? r.tramo;
        const userVal = r.usuario_qfield ?? r.usuario_nombre;
        return (
          inRange(r.fecha, fi, ff) &&
          containsInsensitive(tramoVal, tramo) &&
          containsInsensitive(userVal, usuario)
        );
      },
    );

    const componentesBase = byEstado(baseData.componentes ?? [], estado).filter(
      (r: InformeComponente) => {
        const tramoVal = r.id_tramo ?? r.tramo;
        const userVal = r.usuario_qfield ?? r.usuario_nombre;
        return (
          inRange(r.fecha, fi, ff) &&
          containsInsensitive(tramoVal, tramo) &&
          containsInsensitive(userVal, usuario)
        );
      },
    );

    const diarioBase = byEstado(baseData.diario ?? [], estado).filter((r: InformeDiario) => {
      const tramoVal = r.id_tramo ?? r.tramo;
      const userVal = r.usuario_qfield ?? r.usuario_nombre;
      return (
        inRange(r.fecha_reporte ?? r.fecha, fi, ff) &&
        containsInsensitive(tramoVal, tramo) &&
        containsInsensitive(userVal, usuario)
      );
    });

    const anotacionesBase = (baseData.anotaciones ?? []).filter((r: InformeAnotacion) => {
      return (
        inRange(r.fecha, fi, ff) &&
        containsInsensitive(r.tramo ?? r.id_tramo, tramo) &&
        containsInsensitive(r.usuario_nombre ?? r.usuario_qfield, usuario)
      );
    });

    const useType = (tipo: TipoFormulario) => tiposSel.includes(tipo);

    return {
      ...baseData,
      cantidades: useType('Cantidades de Obra') ? cantidadesBase : [],
      componentes: useType('Componentes Transversales') ? componentesBase : [],
      diario: useType('Reporte Diario') ? diarioBase : [],
      anotaciones: useType('Anotaciones') ? anotacionesBase : [],
      fi,
      ff,
    };
  }, [data, estado, fi, ff, tramo, usuario, tiposSel]);

  const totalRegistros =
    filtered.cantidades.length +
    filtered.componentes.length +
    filtered.diario.length +
    filtered.anotaciones.length;

  const aprobados = useMemo(() => {
    const rows = [...filtered.cantidades, ...filtered.componentes, ...filtered.diario] as Array<{
      estado?: string;
    }>;
    return rows.filter((r) => String(r.estado ?? '').toUpperCase() === 'APROBADO').length;
  }, [filtered]);

  const revisados = useMemo(() => {
    const rows = [...filtered.cantidades, ...filtered.componentes, ...filtered.diario] as Array<{
      estado?: string;
    }>;
    return rows.filter((r) => String(r.estado ?? '').toUpperCase() === 'REVISADO').length;
  }, [filtered]);

  const devueltos = useMemo(() => {
    const rows = [...filtered.cantidades, ...filtered.componentes, ...filtered.diario] as Array<{
      estado?: string;
    }>;
    return rows.filter((r) => String(r.estado ?? '').toUpperCase() === 'DEVUELTO').length;
  }, [filtered]);

  const borradores = Math.max(totalRegistros - aprobados - revisados - devueltos, 0);

  function toggleTipo(tipo: TipoFormulario) {
    setTiposSel((prev) => (prev.includes(tipo) ? prev.filter((x) => x !== tipo) : [...prev, tipo]));
  }

  const dropdownLabel =
    tiposSel.length === 0
      ? 'Seleccionar tipos...'
      : tiposSel.length === TIPOS.length
        ? 'Todos los tipos'
        : tiposSel.join(', ');

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionBadge label="Generar Informe" page="generar-informe" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Cargando datos del informe...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <SectionBadge label="Generar Informe" page="generar-informe" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No se pudieron cargar los datos del informe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionBadge label="Generar Informe" page="generar-informe" />

      <div
        className="rounded-2xl border p-5 md:p-6 space-y-4"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
      >
        <h3 className="text-lg font-semibold">Período y Contenido</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">
            Desde
            <input
              type="date"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={fi}
              onChange={(e) => setFi(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Hasta
            <input
              type="date"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={ff}
              onChange={(e) => setFf(e.target.value)}
            />
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-sm">
            Estado de las anotaciones
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoFiltro)}
            >
              {Object.keys(ESTADO_MAP).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Filtrar por Tramo
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={tramo}
              onChange={(e) => setTramo(e.target.value)}
              placeholder="Ej: T-01"
            />
          </label>
          <label className="text-sm">
            Filtrar por Usuario / Inspector
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Nombre"
            />
          </label>
        </div>

        {/* Multi-select dropdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Tipos de formulario a incluir</p>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="w-full rounded-md border px-3 py-2 text-sm text-left flex items-center justify-between gap-2"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-input, var(--bg-card))',
              }}
            >
              <span className={tiposSel.length === 0 ? 'opacity-40' : ''}>{dropdownLabel}</span>
              <svg
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute z-20 mt-1 w-full rounded-md border shadow-lg overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {TIPOS.map((tipo, idx) => (
                  <label
                    key={tipo}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer select-none hover:opacity-80"
                    style={
                      idx < TIPOS.length - 1
                        ? { borderBottom: '1px solid var(--border)' }
                        : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={tiposSel.includes(tipo)}
                      onChange={() => toggleTipo(tipo)}
                    />
                    {tipo}
                  </label>
                ))}
              </div>
            )}
          </div>

          {tiposSel.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tiposSel.map((tipo) => (
                <span
                  key={tipo}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: 'rgba(0, 118, 176, 0.12)', color: '#0076B0' }}
                >
                  {tipo}
                  <button
                    type="button"
                    onClick={() => toggleTipo(tipo)}
                    className="rounded-full leading-none hover:opacity-60"
                    aria-label={`Quitar ${tipo}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <KpiCard label="Registros totales" value={totalRegistros} accent="blue" />
        <KpiCard label="Aprobados" value={aprobados} accent="green" />
        <KpiCard label="Revisados" value={revisados} accent="blue" />
        <KpiCard label="Borradores" value={borradores} accent="orange" />
        <KpiCard label="Devueltos" value={devueltos} accent="red" />
      </div>

      {/* Vista previa con datos reales */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold">Vista previa</h3>

        {totalRegistros === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            No hay registros con los filtros seleccionados.
          </p>
        ) : (
          <div className="space-y-5">
            {tiposSel.includes('Cantidades de Obra') && filtered.cantidades.length > 0 && (
              <PreviewSection title="Cantidades de Obra" count={filtered.cantidades.length}>
                <PreviewTable
                  headers={[
                    'Fecha',
                    'Tramo',
                    'Item',
                    'Descripción',
                    'Cantidad',
                    'Unidad',
                    'Estado',
                  ]}
                  rows={filtered.cantidades
                    .slice(0, PREVIEW_LIMIT)
                    .map((r) => [
                      fmtDate(r.fecha),
                      String(r.id_tramo ?? r.tramo ?? '—'),
                      String(r.item_pago ?? '—'),
                      truncate(r.item_descripcion),
                      String(r.cantidad ?? '—'),
                      String(r.unidad ?? '—'),
                      <EstadoBadge key="estado" estado={r.estado} />,
                    ])}
                />
                {filtered.cantidades.length > PREVIEW_LIMIT && (
                  <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    + {filtered.cantidades.length - PREVIEW_LIMIT} registros más
                  </p>
                )}
              </PreviewSection>
            )}

            {tiposSel.includes('Componentes Transversales') && filtered.componentes.length > 0 && (
              <PreviewSection title="Componentes Transversales" count={filtered.componentes.length}>
                <PreviewTable
                  headers={[
                    'Fecha',
                    'Tramo',
                    'Componente',
                    'Actividad',
                    'Cantidad',
                    'Unidad',
                    'Estado',
                  ]}
                  rows={filtered.componentes
                    .slice(0, PREVIEW_LIMIT)
                    .map((r) => [
                      fmtDate(r.fecha),
                      String(r.id_tramo ?? r.tramo ?? '—'),
                      truncate(r.tipo_componente),
                      truncate(r.tipo_actividad),
                      String(r.cantidad ?? '—'),
                      String(r.unidad ?? '—'),
                      <EstadoBadge key="estado" estado={r.estado} />,
                    ])}
                />
                {filtered.componentes.length > PREVIEW_LIMIT && (
                  <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    + {filtered.componentes.length - PREVIEW_LIMIT} registros más
                  </p>
                )}
              </PreviewSection>
            )}

            {tiposSel.includes('Reporte Diario') && filtered.diario.length > 0 && (
              <PreviewSection title="Reporte Diario" count={filtered.diario.length}>
                <PreviewTable
                  headers={['Fecha', 'Tramo', 'Usuario', 'Observaciones', 'Estado']}
                  rows={filtered.diario
                    .slice(0, PREVIEW_LIMIT)
                    .map((r) => [
                      fmtDate(r.fecha_reporte ?? r.fecha),
                      String(r.id_tramo ?? r.tramo ?? '—'),
                      String(r.usuario_qfield ?? r.usuario_nombre ?? '—'),
                      truncate(r.observaciones, 60),
                      <EstadoBadge key="estado" estado={r.estado} />,
                    ])}
                />
                {filtered.diario.length > PREVIEW_LIMIT && (
                  <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    + {filtered.diario.length - PREVIEW_LIMIT} registros más
                  </p>
                )}
              </PreviewSection>
            )}

            {tiposSel.includes('Anotaciones') && filtered.anotaciones.length > 0 && (
              <PreviewSection title="Anotaciones" count={filtered.anotaciones.length}>
                <PreviewTable
                  headers={['Fecha', 'Tramo', 'Usuario', 'Anotación', 'Estado']}
                  rows={filtered.anotaciones
                    .slice(0, PREVIEW_LIMIT)
                    .map((r) => [
                      fmtDate(r.fecha),
                      String(r.tramo ?? r.id_tramo ?? '—'),
                      String(r.usuario_nombre ?? r.usuario_qfield ?? '—'),
                      truncate(r.anotacion, 60),
                      <EstadoBadge key="estado" estado={r.estado} />,
                    ])}
                />
                {filtered.anotaciones.length > PREVIEW_LIMIT && (
                  <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    + {filtered.anotaciones.length - PREVIEW_LIMIT} registros más
                  </p>
                )}
              </PreviewSection>
            )}
          </div>
        )}
      </div>

      <div
        className="rounded-xl p-6 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-semibold">Generar Bitácora PDF</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          El PDF se genera con el diseño institucional y los filtros seleccionados.
        </p>
        <InformePdfDownload data={filtered} disabled={totalRegistros === 0} />
      </div>
    </div>
  );
}
