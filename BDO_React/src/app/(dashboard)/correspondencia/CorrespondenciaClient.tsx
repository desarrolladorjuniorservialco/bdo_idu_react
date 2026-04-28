'use client';
import { useState, useTransition, useMemo } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CorrespondenciaForm } from './CorrespondenciaForm';
import { insertarCorrespondencia, actualizarCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import type { Rol } from '@/types/database';
import type { CorrespondenciaInput } from '@/lib/validators/correspondencia.schema';

const ESTADOS = ['PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA'] as const;
const COMPONENTES = ['Ambiental - SST', 'Social', 'PMT', 'Técnico', 'Jurídico', 'Financiero', 'General'];
const PUEDE_EDITAR: Rol[] = ['obra', 'admin'];
const TODAY = new Date().toISOString().slice(0, 10);

function isVencida(r: any): boolean {
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

// ─── Filter Panel ───────────────────────────────────────────────────────────
interface FilterPanelProps {
  fEmisor: string; setFEmisor: (v: string) => void;
  fReceptor: string; setFReceptor: (v: string) => void;
  fEstados: string[]; toggleEstado: (e: string) => void;
  fComponentes: string[]; toggleComponente: (c: string) => void;
  fFechaIni: string; setFFechaIni: (v: string) => void;
  fFechaFin: string; setFFechaFin: (v: string) => void;
  activeCount: number; onClear: () => void;
}

function FilterPanel({
  fEmisor, setFEmisor, fReceptor, setFReceptor,
  fEstados, toggleEstado, fComponentes, toggleComponente,
  fFechaIni, setFFechaIni, fFechaFin, setFFechaFin,
  activeCount, onClear,
}: FilterPanelProps) {
  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    background: 'var(--background)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius)',
    padding: '6px 10px',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
  };

  const chipActive: React.CSSProperties = {
    background: 'var(--accent-teal)',
    color: '#fff',
    border: '1px solid var(--accent-teal)',
    borderRadius: '9999px',
    padding: '3px 12px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const chipInactive: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '9999px',
    padding: '3px 12px',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <div className="p-4 space-y-4">
      {/* Text search row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
                 style={{ color: 'var(--text-muted)' }}>
            Emisor
          </label>
          <input
            type="text"
            value={fEmisor}
            onChange={e => setFEmisor(e.target.value)}
            placeholder="Buscar por emisor…"
            style={inputStyle}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
                 style={{ color: 'var(--text-muted)' }}>
            Receptor
          </label>
          <input
            type="text"
            value={fReceptor}
            onChange={e => setFReceptor(e.target.value)}
            placeholder="Buscar por receptor…"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Estado chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide"
               style={{ color: 'var(--text-muted)' }}>
          Estado
        </label>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map(e => (
            <button key={e} type="button" onClick={() => toggleEstado(e)}
                    style={fEstados.includes(e) ? chipActive : chipInactive}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Componente chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wide"
               style={{ color: 'var(--text-muted)' }}>
          Componente
        </label>
        <div className="flex flex-wrap gap-2">
          {COMPONENTES.map(c => (
            <button key={c} type="button" onClick={() => toggleComponente(c)}
                    style={fComponentes.includes(c) ? chipActive : chipInactive}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
                 style={{ color: 'var(--text-muted)' }}>
            Fecha desde
          </label>
          <input type="date" value={fFechaIni} onChange={e => setFFechaIni(e.target.value)}
                 style={inputStyle} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide"
                 style={{ color: 'var(--text-muted)' }}>
            Fecha hasta
          </label>
          <input type="date" value={fFechaFin} onChange={e => setFFechaFin(e.target.value)}
                 style={inputStyle} />
        </div>
      </div>

      {/* Clear button */}
      {activeCount > 0 && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-md font-medium"
            style={{
              color: 'var(--accent-red)',
              border: '1px solid var(--accent-red)',
              background: 'transparent',
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

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CorrespondenciaClient({
  registros, rol, contratoId,
}: { registros: any[]; rol: Rol; contratoId: string }) {
  const [openNueva, setOpenNueva] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [fEmisor, setFEmisor] = useState('');
  const [fReceptor, setFReceptor] = useState('');
  const [fEstados, setFEstados] = useState<string[]>([]);
  const [fComponentes, setFComponentes] = useState<string[]>([]);
  const [fFechaIni, setFFechaIni] = useState('');
  const [fFechaFin, setFFechaFin] = useState('');

  const canEdit = PUEDE_EDITAR.includes(rol);

  function toggleEstado(e: string) {
    setFEstados(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  }

  function toggleComponente(c: string) {
    setFComponentes(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  function clearFilters() {
    setFEmisor(''); setFReceptor('');
    setFEstados([]); setFComponentes([]);
    setFFechaIni(''); setFFechaFin('');
  }

  const activeFilterCount = [
    fEmisor.trim(), fReceptor.trim(),
    ...fEstados, ...fComponentes,
    fFechaIni, fFechaFin,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = registros;
    if (fEmisor.trim()) {
      const q = fEmisor.toLowerCase();
      result = result.filter(r => String(r.emisor ?? '').toLowerCase().includes(q));
    }
    if (fReceptor.trim()) {
      const q = fReceptor.toLowerCase();
      result = result.filter(r => String(r.receptor ?? '').toLowerCase().includes(q));
    }
    if (fEstados.length) result = result.filter(r => fEstados.includes(r.estado));
    if (fComponentes.length) result = result.filter(r => fComponentes.includes(r.componente));
    if (fFechaIni) result = result.filter(r => String(r.fecha ?? '').slice(0, 10) >= fFechaIni);
    if (fFechaFin) result = result.filter(r => String(r.fecha ?? '').slice(0, 10) <= fFechaFin);
    return result;
  }, [registros, fEmisor, fReceptor, fEstados, fComponentes, fFechaIni, fFechaFin]);

  const kpis = useMemo(() => ({
    total:       registros.length,
    pendientes:  registros.filter(r => r.estado === 'PENDIENTE').length,
    respondidos: registros.filter(r => r.estado === 'RESPONDIDO').length,
    vencidas:    registros.filter(isVencida).length,
  }), [registros]);

  const nVencidasVisible = filtered.filter(isVencida).length;

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

  return (
    <div className="space-y-4">
      <SectionBadge label="Correspondencia" page="correspondencia" />

      {/* KPI Cards — 4 metrics including overdue */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total"       value={kpis.total}       accent="teal" />
        <KpiCard label="Pendientes"  value={kpis.pendientes}  accent="red" />
        <KpiCard label="Respondidos" value={kpis.respondidos} accent="green" />
        <KpiCard label="Vencidas"    value={kpis.vencidas}    accent="orange"
                 sublabel="Plazo superado" />
      </div>

      {/* Collapsible Filter Panel */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        <button
          type="button"
          onClick={() => setShowFilters(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{
            background: showFilters ? 'var(--muted)' : 'transparent',
            borderBottom: showFilters ? '1px solid var(--border)' : 'none',
            cursor: 'pointer',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Filtros
            </span>
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--accent-teal)',
                color: '#fff',
                borderRadius: '9999px',
                padding: '1px 8px',
                fontSize: '11px',
                fontWeight: 700,
                lineHeight: '18px',
              }}>
                {activeFilterCount} activo{activeFilterCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {showFilters ? '▲ Ocultar' : '▼ Mostrar'}
          </span>
        </button>

        {showFilters && (
          <FilterPanel
            fEmisor={fEmisor} setFEmisor={setFEmisor}
            fReceptor={fReceptor} setFReceptor={setFReceptor}
            fEstados={fEstados} toggleEstado={toggleEstado}
            fComponentes={fComponentes} toggleComponente={toggleComponente}
            fFechaIni={fFechaIni} setFFechaIni={setFFechaIni}
            fFechaFin={fFechaFin} setFFechaFin={setFFechaFin}
            activeCount={activeFilterCount} onClear={clearFilters}
          />
        )}
      </div>

      {/* Toolbar: results count + export + new record */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {filtered.length === registros.length
            ? `${registros.length} registro${registros.length !== 1 ? 's' : ''}`
            : `${filtered.length} de ${registros.length} registros`}
        </p>
        <div className="flex items-center gap-2">
          <ExportCsvButton data={filtered} filename="Correspondencia_IDU-1556-2025" />
          {canEdit && (
            <Dialog open={openNueva} onOpenChange={setOpenNueva}>
              <DialogTrigger asChild>
                <Button className="h-8 px-3 text-xs">+ Nueva correspondencia</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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

      {/* Full-column Table */}
      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-xs" style={{ minWidth: '1160px' }}>
          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {[
                'Consecutivo', 'Fecha', 'Emisor', 'Receptor',
                'Componente', 'Asunto', 'Plazo Resp.', 'Estado',
                'Consec. Resp.', 'Fecha Resp.', 'Link',
                ...(canEdit ? ['Acciones'] : []),
              ].map(h => (
                <th key={h}
                    className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.03em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 12 : 11}
                    className="px-3 py-8 text-center"
                    style={{ color: 'var(--text-muted)' }}>
                  {registros.length === 0
                    ? 'Sin registros de correspondencia.'
                    : 'No hay registros que coincidan con los filtros aplicados.'}
                </td>
              </tr>
            ) : (
              filtered.map(r => {
                const vencida = isVencida(r);
                return (
                  <tr
                    key={r.id}
                    className="border-t"
                    style={{
                      borderColor: 'var(--border)',
                      background: vencida ? 'rgba(255,210,0,0.13)' : undefined,
                    }}
                  >
                    {/* Consecutivo */}
                    <td className="px-3 py-2 font-mono font-medium whitespace-nowrap"
                        style={{ color: 'var(--text-primary)' }}>
                      {r.consecutivo}
                    </td>

                    {/* Fecha */}
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDate(r.fecha)}
                    </td>

                    {/* Emisor */}
                    <td className="px-3 py-2 max-w-[130px] truncate" title={r.emisor}>
                      {r.emisor}
                    </td>

                    {/* Receptor */}
                    <td className="px-3 py-2 max-w-[130px] truncate" title={r.receptor}>
                      {r.receptor}
                    </td>

                    {/* Componente */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {r.componente ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: 'var(--idu-blue-lt)', color: 'var(--idu-blue)' }}>
                          {r.componente}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    {/* Asunto */}
                    <td className="px-3 py-2 max-w-[200px] truncate" title={r.asunto}>
                      {r.asunto}
                    </td>

                    {/* Plazo respuesta — red + bold when overdue */}
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {r.plazo_respuesta ? (
                        <span style={{
                          color: vencida ? 'var(--accent-red)' : 'var(--text-primary)',
                          fontWeight: vencida ? 700 : 400,
                        }}>
                          {formatDate(r.plazo_respuesta)}
                          {vencida && <span className="ml-1 text-[10px]">⚠</span>}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-2">
                      <StatusBadge estado={r.estado} />
                    </td>

                    {/* Consecutivo Respuesta */}
                    <td className="px-3 py-2 font-mono">
                      {r.consecutivo_respuesta || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    {/* Fecha Respuesta */}
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {r.fecha_respuesta
                        ? formatDate(r.fecha_respuesta)
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    {/* Link */}
                    <td className="px-3 py-2">
                      {r.link ? (
                        <a href={r.link} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-0.5 text-xs underline underline-offset-2"
                           style={{ color: 'var(--accent-teal)' }}>
                          Ver ↗
                        </a>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    {/* Acciones */}
                    {canEdit && (
                      <td className="px-3 py-2">
                        <Button variant="ghost"
                                onClick={() => setEditando(r)}
                                className="h-6 px-2 text-xs">
                          Editar
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Overdue legend */}
      {nVencidasVisible > 0 && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span style={{
            display: 'inline-block',
            width: '14px', height: '14px',
            background: 'rgba(255,210,0,0.35)',
            border: '1px solid #c8a800',
            borderRadius: '3px',
            flexShrink: 0,
          }} />
          {nVencidasVisible} registro{nVencidasVisible > 1 ? 's' : ''} PENDIENTE{nVencidasVisible > 1 ? 'S' : ''} con plazo de respuesta vencido
        </div>
      )}

      {/* Edit Dialog */}
      {editando && (
        <Dialog open={!!editando} onOpenChange={v => !v && setEditando(null)}>
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
