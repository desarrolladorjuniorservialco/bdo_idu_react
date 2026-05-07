'use client';
import { useMemo, useState } from 'react';
import { filterByDateRange, getMondayOfWeek, getTodayISO } from './cierre-semanal.utils';
import { SeccionAnotaciones } from './components/SeccionAnotaciones';
import { SeccionCantidades } from './components/SeccionCantidades';
import { SeccionComponentes } from './components/SeccionComponentes';
import { SeccionCorrespondencia } from './components/SeccionCorrespondencia';
import { SeccionDiario } from './components/SeccionDiario';
import { SeccionPresupuesto } from './components/SeccionPresupuesto';

const MAX = 10;

interface AnotacionRow {
  id: string;
  fecha: string;
  tramo?: string | null;
  civ?: string | null;
  anotacion?: string | null;
  usuario_nombre?: string | null;
  usuario_rol?: string | null;
}

interface DiarioRow {
  id: string;
  fecha: string;
  actividad?: string | null;
  estado?: string | null;
  usuario_nombre?: string | null;
}

interface CantidadRow {
  id: string;
  fecha_creacion: string;
  actividad?: string | null;
  cantidad?: number | null;
  unidad?: string | null;
  estado?: string | null;
}

interface CorrespondenciaRow {
  id: string;
  fecha: string;
  radicado?: string | null;
  asunto?: string | null;
  tipo?: string | null;
  estado?: string | null;
}

interface ComponenteRow {
  id: string;
  fecha_creacion: string;
  componente: string;
  actividad?: string | null;
  observacion?: string | null;
  estado?: string | null;
}

interface PresupuestoItem {
  valor_total?: number | null;
  valor_ejecutado?: number | null;
  cantidad?: number | null;
  precio_unitario?: number | null;
  cantidad_ejecutada?: number | null;
}

interface Tramo {
  infraestructura?: string | null;
  meta_fisica?: number | null;
  cicloruta_km?: number | null;
  esp_publico_m2?: number | null;
  ejecutado?: boolean | number | null;
  avance_pct?: number | null;
}

interface Props {
  anotaciones: AnotacionRow[];
  diario: DiarioRow[];
  cantidades: CantidadRow[];
  correspondencia: CorrespondenciaRow[];
  componentes: ComponenteRow[];
  presupuestoItems: PresupuestoItem[];
  tramos: Tramo[];
}

export default function CierreSemanalClient({
  anotaciones,
  diario,
  cantidades,
  correspondencia,
  componentes,
  presupuestoItems,
  tramos,
}: Props) {
  const defaultDesde = useMemo(() => getMondayOfWeek(), []);
  const defaultHasta = useMemo(() => getTodayISO(), []);

  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);

  const filteredAnotaciones = useMemo(
    () => filterByDateRange(anotaciones, 'fecha', desde, hasta),
    [anotaciones, desde, hasta],
  );
  const filteredDiario = useMemo(
    () => filterByDateRange(diario, 'fecha', desde, hasta),
    [diario, desde, hasta],
  );
  const filteredCantidades = useMemo(
    () => filterByDateRange(cantidades, 'fecha_creacion', desde, hasta),
    [cantidades, desde, hasta],
  );
  const filteredCorrespondencia = useMemo(
    () => filterByDateRange(correspondencia, 'fecha', desde, hasta),
    [correspondencia, desde, hasta],
  );
  const filteredComponentes = useMemo(
    () => filterByDateRange(componentes, 'fecha_creacion', desde, hasta),
    [componentes, desde, hasta],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Encabezado y filtro */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Cierre Semanal
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Resumen consolidado del contrato por rango de fechas
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3 sm:ml-auto">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="filtro-desde"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              Desde
            </label>
            <input
              id="filtro-desde"
              type="date"
              value={desde}
              max={hasta}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-md px-3 py-1.5 text-sm"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="filtro-hasta"
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              Hasta
            </label>
            <input
              id="filtro-hasta"
              type="date"
              value={hasta}
              min={desde}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-md px-3 py-1.5 text-sm"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setDesde(defaultDesde);
              setHasta(defaultHasta);
            }}
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Secciones */}
      <SeccionAnotaciones
        items={filteredAnotaciones.slice(0, MAX)}
        total={filteredAnotaciones.length}
      />
      <SeccionDiario items={filteredDiario.slice(0, MAX)} total={filteredDiario.length} />
      <SeccionCantidades
        items={filteredCantidades.slice(0, MAX)}
        total={filteredCantidades.length}
      />
      <SeccionCorrespondencia
        items={filteredCorrespondencia.slice(0, MAX)}
        total={filteredCorrespondencia.length}
      />
      <SeccionComponentes
        items={filteredComponentes.slice(0, MAX)}
        total={filteredComponentes.length}
      />
      <SeccionPresupuesto items={presupuestoItems} tramos={tramos} />
    </div>
  );
}
