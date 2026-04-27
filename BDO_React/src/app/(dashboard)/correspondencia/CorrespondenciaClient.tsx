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

const PUEDE_EDITAR: Rol[] = ['obra', 'admin'];

export default function CorrespondenciaClient({
  registros, rol, contratoId,
}: { registros: any[]; rol: Rol; contratoId: string }) {
  const [openNueva, setOpenNueva] = useState(false);
  const [editando,  setEditando]  = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const canEdit = PUEDE_EDITAR.includes(rol);

  const kpis = useMemo(() => ({
    total:       registros.length,
    pendientes:  registros.filter(r => r.estado === 'PENDIENTE').length,
    respondidos: registros.filter(r => r.estado === 'RESPONDIDO').length,
  }), [registros]);

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
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total"       value={kpis.total}       accent="blue" />
        <KpiCard label="Pendientes"  value={kpis.pendientes}  accent="red" />
        <KpiCard label="Respondidos" value={kpis.respondidos} accent="green" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <ExportCsvButton data={registros} filename="correspondencia" />
        {canEdit && (
          <Dialog open={openNueva} onOpenChange={setOpenNueva}>
            <DialogTrigger asChild>
              <Button size="sm">+ Nueva correspondencia</Button>
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

      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-xs min-w-[700px]">
          <thead style={{ background: 'var(--muted)' }}>
            <tr>
              {['Consecutivo','Fecha','Emisor','Receptor','Asunto','Estado','Acciones'].map(h => (
                <th key={h} className="p-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  Sin registros de correspondencia.
                </td>
              </tr>
            )}
            {registros.map(r => (
              <tr key={r.id} className="border-t hover:bg-[var(--muted)]/30"
                  style={{ borderColor: 'var(--border)' }}>
                <td className="p-2 font-mono">{r.consecutivo}</td>
                <td className="p-2 whitespace-nowrap">{r.fecha}</td>
                <td className="p-2">{r.emisor}</td>
                <td className="p-2">{r.receptor}</td>
                <td className="p-2 max-w-[180px] truncate" title={r.asunto}>{r.asunto}</td>
                <td className="p-2"><StatusBadge estado={r.estado} /></td>
                <td className="p-2 flex items-center gap-1">
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => setEditando(r)}>Editar</Button>
                  )}
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                       className="underline" style={{ color: 'var(--idu-blue)' }}>Ver</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <Dialog open={!!editando} onOpenChange={v => !v && setEditando(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar correspondencia</DialogTitle>
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
