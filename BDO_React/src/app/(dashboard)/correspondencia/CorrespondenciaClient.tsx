'use client';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  actualizarCorrespondencia,
  insertarCorrespondencia,
} from '@/lib/supabase/actions/correspondencia';
import type { CorrespondenciaInput } from '@/lib/validators/correspondencia.schema';
import type { Rol } from '@/types/database';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { CorrespondenciaForm } from './CorrespondenciaForm';

const ESTADOS = ['PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA'] as const;
const COMPONENTES = [
  'Ambiental - SST',
  'Social',
  'PMT',
  'Técnico',
  'Jurídico',
  'Financiero',
  'General',
];
const PUEDE_EDITAR: Rol[] = ['obra', 'admin'];
const TODAY = new Date().toISOString().slice(0, 10);
type CorrespondenciaRow = {
  id: string;
  estado: string;
  plazo_respuesta?: string | null;
  fecha?: string | null;
  emisor?: string | null;
  receptor?: string | null;
  componente?: string | null;
  asunto?: string | null;
  consecutivo?: string | null;
  consecutivo_respuesta?: string | null;
  fecha_respuesta?: string | null;
  link?: string | null;
  [key: string]: unknown;
};

// Column definitions with default widths in px
const COL_DEFS = [
  { key: 'consecutivo', label: 'Consecutivo', defaultW: 130 },
  { key: 'fecha', label: 'Fecha', defaultW: 100 },
  { key: 'emisor', label: 'Emisor', defaultW: 155 },
  { key: 'receptor', label: 'Receptor', defaultW: 155 },
  { key: 'componente', label: 'Componente', defaultW: 135 },
  { key: 'asunto', label: 'Asunto', defaultW: 215 },
  { key: 'plazo_resp', label: 'Plazo Resp.', defaultW: 108 },
  { key: 'estado', label: 'Estado', defaultW: 130 },
  { key: 'consec_resp', label: 'Consec. Resp.', defaultW: 130 },
  { key: 'fecha_resp', label: 'Fecha Resp.', defaultW: 100 },
  { key: 'link', label: 'Link', defaultW: 78 },
  { key: 'acciones', label: 'Acciones', defaultW: 85 },
];

function isVencida(r: CorrespondenciaRow): boolean {
  return (
    r.estado === 'PENDIENTE' &&
    Boolean(r.plazo_respuesta) &&
    String(r.plazo_respuesta).slice(0, 10) < TODAY
  );
}

function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  const d = String(val).slice(0, 10);
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return '—';
  return `${day}/${m}/${y}`;
}

// ─── Multi-select dropdown ───────────────────────────────────────────────────
function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  buttonId,
  ariaLabelledBy,
}: {
  options: ReadonlyArray<string>;
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  buttonId?: string;
  ariaLabelledBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function toggle(v: string) {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  }

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} seleccionados`;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        id={buttonId}
        aria-labelledby={ariaLabelledBy}
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '7px 11px',
          border: `1px solid ${open ? 'var(--accent-teal)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          background: 'var(--background)',
          color: selected.length ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: '15px',
          cursor: 'pointer',
          textAlign: 'left',
          outline: open ? '2px solid rgba(13,148,136,0.25)' : 'none',
          outlineOffset: '2px',
        }}
      >
        <span
          style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {label}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            minWidth: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {options.map((opt, i) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                cursor: 'pointer',
                fontSize: '15px',
                color: 'var(--text-primary)',
                background: selected.includes(opt) ? 'rgba(13,148,136,0.08)' : 'transparent',
                borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{
                  accentColor: 'var(--accent-teal)',
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              {opt}
            </label>
          ))}
          {selected.length > 0 && (
            <div style={{ padding: '7px 12px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setOpen(false);
                }}
                style={{
                  fontSize: '13px',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                ✕ Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Filter Panel ────────────────────────────────────────────────────────────
interface FilterPanelProps {
  fEmisor: string;
  setFEmisor: (v: string) => void;
  fReceptor: string;
  setFReceptor: (v: string) => void;
  fEstados: string[];
  setFEstados: (v: string[]) => void;
  fComponentes: string[];
  setFComponentes: (v: string[]) => void;
  fFechaIni: string;
  setFFechaIni: (v: string) => void;
  fFechaFin: string;
  setFFechaFin: (v: string) => void;
  activeCount: number;
  onClear: () => void;
}

function FilterPanel({
  fEmisor,
  setFEmisor,
  fReceptor,
  setFReceptor,
  fEstados,
  setFEstados,
  fComponentes,
  setFComponentes,
  fFechaIni,
  setFFechaIni,
  fFechaFin,
  setFFechaFin,
  activeCount,
  onClear,
}: FilterPanelProps) {
  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius)',
    padding: '7px 11px',
    fontSize: '15px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '5px',
  };

  return (
    <div className="p-4 space-y-4">
      {/* Row 1: Text search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="f-emisor" style={labelStyle}>
            Emisor
          </label>
          <input
            id="f-emisor"
            type="text"
            value={fEmisor}
            onChange={(e) => setFEmisor(e.target.value)}
            placeholder="Buscar por emisor…"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="f-receptor" style={labelStyle}>
            Receptor
          </label>
          <input
            id="f-receptor"
            type="text"
            value={fReceptor}
            onChange={(e) => setFReceptor(e.target.value)}
            placeholder="Buscar por receptor…"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2: Multi-select dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label id="f-estado-label" htmlFor="f-estado" style={labelStyle}>
            Estado
          </label>
          <MultiSelect
            buttonId="f-estado"
            ariaLabelledBy="f-estado-label"
            options={ESTADOS}
            selected={fEstados}
            onChange={setFEstados}
            placeholder="Todos los estados"
          />
        </div>
        <div>
          <label id="f-componente-label" htmlFor="f-componente" style={labelStyle}>
            Componente
          </label>
          <MultiSelect
            buttonId="f-componente"
            ariaLabelledBy="f-componente-label"
            options={COMPONENTES}
            selected={fComponentes}
            onChange={setFComponentes}
            placeholder="Todos los componentes"
          />
        </div>
      </div>

      {/* Row 3: Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="f-fecha-desde" style={labelStyle}>
            Fecha desde
          </label>
          <input
            id="f-fecha-desde"
            type="date"
            value={fFechaIni}
            onChange={(e) => setFFechaIni(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="f-fecha-hasta" style={labelStyle}>
            Fecha hasta
          </label>
          <input
            id="f-fecha-hasta"
            type="date"
            value={fFechaFin}
            onChange={(e) => setFFechaFin(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClear}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--accent-red)',
              border: '1px solid var(--accent-red)',
              background: 'transparent',
              borderRadius: 'var(--radius)',
              padding: '5px 14px',
              cursor: 'pointer',
            }}
          >
            ✕ Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CorrespondenciaClient({
  registros,
  rol,
  contratoId,
}: { registros: CorrespondenciaRow[]; rol: Rol; contratoId: string }) {
  const [openNueva, setOpenNueva] = useState(false);
  const [editando, setEditando] = useState<CorrespondenciaRow | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [fEmisor, setFEmisor] = useState('');
  const [fReceptor, setFReceptor] = useState('');
  const [fEstados, setFEstados] = useState<string[]>([]);
  const [fComponentes, setFComponentes] = useState<string[]>([]);
  const [fFechaIni, setFFechaIni] = useState('');
  const [fFechaFin, setFFechaFin] = useState('');

  // Column resize state — one width per COL_DEFS entry
  const [colWidths, setColWidths] = useState<number[]>(() => COL_DEFS.map((c) => c.defaultW));
  const resizing = useRef<{ idx: number; startX: number; startW: number } | null>(null);

  const canEdit = PUEDE_EDITAR.includes(rol);

  const visibleCols = useMemo(() => (canEdit ? COL_DEFS : COL_DEFS.slice(0, -1)), [canEdit]);

  // ── Resize handlers ────────────────────────────────────────────────────────
  function startResize(e: React.MouseEvent, idx: number) {
    e.preventDefault();
    resizing.current = { idx, startX: e.clientX, startW: colWidths[idx] };

    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const newW = Math.max(50, resizing.current.startW + (ev.clientX - resizing.current.startX));
      setColWidths((prev) => {
        const next = [...prev];
        next[resizing.current!.idx] = newW;
        return next;
      });
    }
    function onUp() {
      resizing.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Filter logic ───────────────────────────────────────────────────────────
  function clearFilters() {
    setFEmisor('');
    setFReceptor('');
    setFEstados([]);
    setFComponentes([]);
    setFFechaIni('');
    setFFechaFin('');
  }

  const activeFilterCount = [
    fEmisor.trim(),
    fReceptor.trim(),
    ...fEstados,
    ...fComponentes,
    fFechaIni,
    fFechaFin,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = registros;
    if (fEmisor.trim()) {
      const q = fEmisor.toLowerCase();
      result = result.filter((r) =>
        String(r.emisor ?? '')
          .toLowerCase()
          .includes(q),
      );
    }
    if (fReceptor.trim()) {
      const q = fReceptor.toLowerCase();
      result = result.filter((r) =>
        String(r.receptor ?? '')
          .toLowerCase()
          .includes(q),
      );
    }
    if (fEstados.length) result = result.filter((r) => fEstados.includes(r.estado));
    if (fComponentes.length) result = result.filter((r) => fComponentes.includes(r.componente));
    if (fFechaIni) result = result.filter((r) => String(r.fecha ?? '').slice(0, 10) >= fFechaIni);
    if (fFechaFin) result = result.filter((r) => String(r.fecha ?? '').slice(0, 10) <= fFechaFin);
    return result;
  }, [registros, fEmisor, fReceptor, fEstados, fComponentes, fFechaIni, fFechaFin]);

  const kpis = useMemo(
    () => ({
      total: registros.length,
      pendientes: registros.filter((r) => r.estado === 'PENDIENTE').length,
      respondidos: registros.filter((r) => r.estado === 'RESPONDIDO').length,
      vencidas: registros.filter(isVencida).length,
    }),
    [registros],
  );

  const nVencidasVisible = filtered.filter(isVencida).length;

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  function handleInsert(data: CorrespondenciaInput) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await insertarCorrespondencia(contratoId, data);
        setOpenNueva(false);
        resolve();
      });
    });
  }

  function handleUpdate(data: CorrespondenciaInput) {
    if (!editando) return Promise.resolve();
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await actualizarCorrespondencia(editando.id, contratoId, data);
        setEditando(null);
        resolve();
      });
    });
  }

  // ── Shared cell style ──────────────────────────────────────────────────────
  const cellBase: React.CSSProperties = {
    padding: '9px 12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '14px',
  };

  return (
    <div className="space-y-4">
      <SectionBadge label="Correspondencia" page="correspondencia" />

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total" value={kpis.total} accent="teal" />
        <KpiCard label="Pendientes" value={kpis.pendientes} accent="red" />
        <KpiCard label="Respondidos" value={kpis.respondidos} accent="green" />
        <KpiCard label="Vencidas" value={kpis.vencidas} accent="orange" sublabel="Plazo superado" />
      </div>

      {/* ── Collapsible Filter Panel ────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'visible',
        }}
      >
        <button
          type="button"
          onClick={() => setShowFilters((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{
            background: showFilters ? 'var(--muted)' : 'transparent',
            borderBottom: showFilters ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
            borderRadius: showFilters ? 'var(--radius) var(--radius) 0 0' : 'var(--radius)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Filtros
            </span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  background: 'var(--accent-teal)',
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '1px 9px',
                  fontSize: '13px',
                  fontWeight: 700,
                  lineHeight: '20px',
                }}
              >
                {activeFilterCount} activo{activeFilterCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {showFilters ? '▲ Ocultar' : '▼ Mostrar'}
          </span>
        </button>

        {showFilters && (
          <FilterPanel
            fEmisor={fEmisor}
            setFEmisor={setFEmisor}
            fReceptor={fReceptor}
            setFReceptor={setFReceptor}
            fEstados={fEstados}
            setFEstados={setFEstados}
            fComponentes={fComponentes}
            setFComponentes={setFComponentes}
            fFechaIni={fFechaIni}
            setFFechaIni={setFFechaIni}
            fFechaFin={fFechaFin}
            setFFechaFin={setFFechaFin}
            activeCount={activeFilterCount}
            onClear={clearFilters}
          />
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {filtered.length === registros.length
            ? `${registros.length} registro${registros.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${registros.length} registros`}
        </p>
        <div className="flex items-center gap-2">
          <ExportCsvButton data={filtered} filename="Correspondencia_IDU-1556-2025" />
          {canEdit && (
            <Dialog open={openNueva} onOpenChange={setOpenNueva}>
              <DialogTrigger asChild>
                {/* max-w-2xl (42rem) × 1.20 = 50.4rem → max-w-[50rem] */}
                <Button className="h-8 px-3 text-[14px]">+ Nueva correspondencia</Button>
              </DialogTrigger>
              <DialogContent className="max-w-[50rem]">
                <DialogHeader>
                  <DialogTitle>Nueva correspondencia</DialogTitle>
                </DialogHeader>
                <CorrespondenciaForm
                  onSubmit={handleInsert}
                  onCancel={() => setOpenNueva(false)}
                  loading={isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* ── Resizable Table ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table
          className="table-fixed"
          style={{
            width: `${visibleCols.reduce((sum, _, i) => sum + colWidths[i], 0)}px`,
            minWidth: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <colgroup>
            {visibleCols.map((col, i) => (
              <col key={col.key} style={{ width: `${colWidths[i]}px` }} />
            ))}
          </colgroup>

          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {visibleCols.map((col, i) => (
                <th
                  key={col.key}
                  style={{
                    position: 'relative',
                    width: `${colWidths[i]}px`,
                    padding: '9px 12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '13px',
                    letterSpacing: '0.03em',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    overflow: 'hidden',
                  }}
                >
                  {col.label}
                  {/* Drag-to-resize handle */}
                  <button
                    type="button"
                    aria-label={`Redimensionar columna ${col.label}`}
                    onMouseDown={(e) => startResize(e, i)}
                    title="Arrastrar para redimensionar"
                    className="hover:opacity-100 hover:bg-[var(--accent-teal)]"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '15%',
                      bottom: '15%',
                      width: '4px',
                      cursor: 'col-resize',
                      background: 'var(--border)',
                      borderRadius: '2px',
                      opacity: 0.5,
                      transition: 'opacity 0.15s, background 0.15s',
                      border: 'none',
                      padding: 0,
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  style={{
                    padding: '32px 12px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {registros.length === 0
                    ? 'Sin registros de correspondencia.'
                    : 'No hay registros que coincidan con los filtros aplicados.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const vencida = isVencida(r);
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderTop: '1px solid var(--border)',
                      background: vencida ? 'rgba(255,210,0,0.13)' : undefined,
                    }}
                  >
                    {/* Consecutivo */}
                    <td
                      style={{
                        ...cellBase,
                        fontFamily: 'monospace',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {r.consecutivo}
                    </td>

                    {/* Fecha */}
                    <td style={{ ...cellBase, fontVariantNumeric: 'tabular-nums' }}>
                      {formatDate(r.fecha)}
                    </td>

                    {/* Emisor */}
                    <td style={cellBase} title={r.emisor}>
                      {r.emisor}
                    </td>

                    {/* Receptor */}
                    <td style={cellBase} title={r.receptor}>
                      {r.receptor}
                    </td>

                    {/* Componente */}
                    <td style={cellBase}>
                      {r.componente ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: 'var(--idu-blue-lt)',
                            color: 'var(--idu-blue)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {r.componente}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Asunto */}
                    <td style={cellBase} title={r.asunto}>
                      {r.asunto}
                    </td>

                    {/* Plazo respuesta */}
                    <td style={{ ...cellBase, fontVariantNumeric: 'tabular-nums' }}>
                      {r.plazo_respuesta ? (
                        <span
                          style={{
                            color: vencida ? 'var(--accent-red)' : 'var(--text-primary)',
                            fontWeight: vencida ? 700 : 400,
                          }}
                        >
                          {formatDate(r.plazo_respuesta)}
                          {vencida && (
                            <span style={{ marginLeft: '4px', fontSize: '12px' }}>⚠</span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td style={cellBase}>
                      <StatusBadge estado={r.estado} />
                    </td>

                    {/* Consecutivo Respuesta */}
                    <td style={{ ...cellBase, fontFamily: 'monospace' }}>
                      {r.consecutivo_respuesta || (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Fecha Respuesta */}
                    <td style={{ ...cellBase, fontVariantNumeric: 'tabular-nums' }}>
                      {r.fecha_respuesta ? (
                        formatDate(r.fecha_respuesta)
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Link */}
                    <td style={cellBase}>
                      {r.link ? (
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--accent-teal)',
                            textDecoration: 'underline',
                            textUnderlineOffset: '2px',
                            fontSize: '14px',
                          }}
                        >
                          Ver ↗
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Acciones */}
                    {canEdit && (
                      <td style={{ ...cellBase, padding: '6px 8px' }}>
                        <button
                          type="button"
                          onClick={() => setEditando(r)}
                          className="hover:bg-[var(--muted)]"
                          style={{
                            height: '28px',
                            padding: '0 8px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Overdue legend ──────────────────────────────────────────────────── */}
      {nVencidasVisible > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              background: 'rgba(255,210,0,0.35)',
              border: '1px solid #c8a800',
              borderRadius: '3px',
              flexShrink: 0,
            }}
          />
          {nVencidasVisible} registro{nVencidasVisible > 1 ? 's' : ''} PENDIENTE
          {nVencidasVisible > 1 ? 'S' : ''} con plazo de respuesta vencido
        </div>
      )}

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      {editando && (
        <Dialog open={!!editando} onOpenChange={(v: boolean) => !v && setEditando(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar correspondencia · {editando.consecutivo}</DialogTitle>
            </DialogHeader>
            <CorrespondenciaForm
              defaultValues={editando}
              onSubmit={handleUpdate}
              onCancel={() => setEditando(null)}
              loading={isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
