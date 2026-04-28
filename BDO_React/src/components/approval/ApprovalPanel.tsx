'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { APROBACION_CONFIG } from '@/lib/config';
import { aprobar, devolver } from '@/lib/supabase/actions/approval';
import { aprobacionSchema, devolucionSchema } from '@/lib/validators/approval.schema';
import type { AprobacionInput, DevolucionInput } from '@/lib/validators/approval.schema';
import type { Rol } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { ApprovalHistory } from './ApprovalHistory';

interface ApprovalPanelProps {
  // biome-ignore lint/suspicious/noExplicitAny: registro puede ser cualquier tabla de aprobación
  registro: any;
  rol: Rol;
  tabla: string;
  rutaRevalidar: string;
}

export function ApprovalPanel({ registro, rol, tabla, rutaRevalidar }: ApprovalPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const config = APROBACION_CONFIG[rol];

  const puedeAccionar = config && (config.estadosAccion as string[]).includes(registro.estado);

  const cantidadDefault =
    (config ? (registro[config.campos.campo_cant] ?? null) : null) ?? registro.cantidad ?? 0;

  const aprForm = useForm<AprobacionInput>({
    resolver: zodResolver(aprobacionSchema),
    defaultValues: { cantidad_validada: Number(cantidadDefault) },
  });
  const devForm = useForm<DevolucionInput>({
    resolver: zodResolver(devolucionSchema),
  });

  function handleAprobar(data: AprobacionInput) {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      try {
        await aprobar(
          registro.id,
          tabla,
          rol,
          data.cantidad_validada,
          data.observacion,
          rutaRevalidar,
        );
        setFeedbackSuccess('Registro aprobado correctamente.');
      } catch (e) {
        setFeedbackError(e instanceof Error ? e.message : 'No fue posible aprobar el registro.');
      }
    });
  }

  function handleDevolver(data: DevolucionInput) {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      try {
        await devolver(registro.id, tabla, rol, data.observacion, rutaRevalidar);
        setFeedbackSuccess('Registro devuelto.');
      } catch (e) {
        setFeedbackError(e instanceof Error ? e.message : 'No fue posible devolver el registro.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <ApprovalHistory registro={registro} />

      {puedeAccionar && (
        <div className="space-y-4">
          <p
            className="text-[10px] font-mono tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Panel de aprobación
          </p>

          {/* Formulario Aprobar */}
          <form
            onSubmit={aprForm.handleSubmit(handleAprobar)}
            className="rounded-md p-3 space-y-3"
            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#166534' }}>
              Aprobar registro
            </p>
            <div>
              <Label htmlFor={`cant-${registro.id}`}>Cantidad validada</Label>
              <Input
                id={`cant-${registro.id}`}
                type="number"
                step="any"
                {...aprForm.register('cantidad_validada')}
              />
              {aprForm.formState.errors.cantidad_validada && (
                <p className="text-xs text-red-600 mt-0.5">
                  {aprForm.formState.errors.cantidad_validada.message}
                </p>
              )}
            </div>
            <div>
              <Label>Observación (opcional)</Label>
              <Textarea rows={2} {...aprForm.register('observacion')} />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              style={{ background: 'var(--accent-green)', color: 'white' }}
            >
              {isPending ? 'Guardando…' : 'Aprobar'}
            </Button>
          </form>

          {/* Formulario Devolver — solo para roles con puedeDevolver */}
          {config?.puedeDevolver && (
            <form
              onSubmit={devForm.handleSubmit(handleDevolver)}
              className="rounded-md p-3 space-y-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#991B1B' }}>
                Devolver registro
              </p>
              <div>
                <Label>Observación de devolución *</Label>
                <Textarea rows={2} {...devForm.register('observacion')} />
                {devForm.formState.errors.observacion && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {devForm.formState.errors.observacion.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
                {isPending ? 'Guardando…' : 'Devolver'}
              </Button>
            </form>
          )}

          {/* Feedback inline */}
          {feedbackError && (
            <p
              className="text-xs rounded-md px-3 py-2"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
            >
              {feedbackError}
            </p>
          )}
          {feedbackSuccess && (
            <p
              className="text-xs rounded-md px-3 py-2"
              style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
            >
              {feedbackSuccess}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
