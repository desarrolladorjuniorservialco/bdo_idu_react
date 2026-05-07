'use client';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { APROBACION_CONFIG } from '@/lib/config';
import { aprobacionSchema, devolucionSchema } from '@/lib/validators/approval.schema';
import type { AprobacionInput, DevolucionInput } from '@/lib/validators/approval.schema';
import { aprobar, devolver } from '@/lib/supabase/actions/approval';
import { ApprovalHistory } from './ApprovalHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Rol, Estado } from '@/types/database';

interface ApprovalPanelProps {
  registro:      any;
  rol:           Rol;
  tabla:         string;
  rutaRevalidar: string;
}

export function ApprovalPanel({ registro, rol, tabla, rutaRevalidar }: ApprovalPanelProps) {
  const [isPending, startTransition] = useTransition();
  const config = APROBACION_CONFIG[rol];

  const puedeAccionar =
    config &&
    (config.estadosAccion as string[]).includes(registro.estado);

  const aprForm = useForm<AprobacionInput>({
    resolver: zodResolver(aprobacionSchema),
    defaultValues: { cantidad_validada: registro.cantidad ?? 0 },
  });
  const devForm = useForm<DevolucionInput>({
    resolver: zodResolver(devolucionSchema),
  });

  function handleAprobar(data: AprobacionInput) {
    startTransition(async () => {
      try {
        await aprobar(registro.id, tabla, rol, data.cantidad_validada, data.observacion, rutaRevalidar);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function handleDevolver(data: DevolucionInput) {
    startTransition(async () => {
      try {
        await devolver(registro.id, tabla, rol, data.observacion, rutaRevalidar);
      } catch (e) {
        console.error(e);
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
              <Label>Cantidad validada</Label>
              <Input
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

          {/* Formulario Devolver */}
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
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? 'Guardando…' : 'Devolver'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
