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
import { useMemo, useState } from 'react';

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

function byEstado<T extends { estado?: string }>(rows: T[], filtro: EstadoFiltro): T[] {
  const estados = ESTADO_MAP[filtro];
  if (!estados) return rows;
  return rows.filter((r) => estados.includes(String(r.estado ?? '').toUpperCase()));
}

export default function GenerarInformeClient({ data }: { data: InformeData }) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [fi, setFi] = useState(weekAgo);
  const [ff, setFf] = useState(today);
  const [estado, setEstado] = useState<EstadoFiltro>('Todos');
  const [tramo, setTramo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [tiposSel, setTiposSel] = useState<TipoFormulario[]>(['Cantidades de Obra']);

  const filtered = useMemo(() => {
    const cantidadesBase = byEstado(data.cantidades ?? [], estado).filter((r: InformeCantidad) => {
      const tramoVal = r.id_tramo ?? r.tramo;
      const userVal = r.usuario_qfield ?? r.usuario_nombre;
      return (
        inRange(r.fecha, fi, ff) &&
        containsInsensitive(tramoVal, tramo) &&
        containsInsensitive(userVal, usuario)
      );
    });

    const componentesBase = byEstado(data.componentes ?? [], estado).filter(
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

    const diarioBase = byEstado(data.diario ?? [], estado).filter((r: InformeDiario) => {
      const tramoVal = r.id_tramo ?? r.tramo;
      const userVal = r.usuario_qfield ?? r.usuario_nombre;
      return (
        inRange(r.fecha_reporte ?? r.fecha, fi, ff) &&
        containsInsensitive(tramoVal, tramo) &&
        containsInsensitive(userVal, usuario)
      );
    });

    const anotacionesBase = (data.anotaciones ?? []).filter((r: InformeAnotacion) => {
      return (
        inRange(r.fecha, fi, ff) &&
        containsInsensitive(r.tramo ?? r.id_tramo, tramo) &&
        containsInsensitive(r.usuario_nombre ?? r.usuario_qfield, usuario)
      );
    });

    const useType = (tipo: TipoFormulario) => tiposSel.includes(tipo);

    return {
      ...data,
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

        <div className="space-y-2">
          <p className="text-sm font-medium">Tipos de formulario a incluir</p>
          <div className="grid md:grid-cols-2 gap-2">
            {TIPOS.map((tipo) => (
              <label
                key={tipo}
                className="rounded-md border px-3 py-2 text-sm flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={tiposSel.includes(tipo)}
                  onChange={() => toggleTipo(tipo)}
                />
                {tipo}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <KpiCard label="Registros totales" value={totalRegistros} accent="blue" />
        <KpiCard label="Aprobados" value={aprobados} accent="green" />
        <KpiCard label="Revisados" value={revisados} accent="blue" />
        <KpiCard label="Borradores" value={borradores} accent="orange" />
        <KpiCard label="Devueltos" value={devueltos} accent="red" />
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold">Vista previa</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Cantidades: {filtered.cantidades.length} · Componentes: {filtered.componentes.length} ·
          Diario: {filtered.diario.length} · Anotaciones: {filtered.anotaciones.length}
        </p>
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
