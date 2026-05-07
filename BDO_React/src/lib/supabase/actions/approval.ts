'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { APROBACION_CONFIG } from '@/lib/config';
import { aprobacionSchema, devolucionSchema } from '@/lib/validators/approval.schema';
import type { Rol } from '@/types/database';

export async function aprobar(
  registroId:       string,
  tabla:            string,
  rol:              Rol,
  cantidadValidada: number,
  observacion:      string | undefined,
  rutaRevalidar:    string,
) {
  const parsed = aprobacionSchema.parse({ cantidad_validada: cantidadValidada, observacion });
  const config = APROBACION_CONFIG[rol];
  if (!config) throw new Error(`Rol ${rol} no puede aprobar`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload: Record<string, unknown> = {
    estado:                    config.estadoResultante,
    [config.campos.campo_cant]:   parsed.cantidad_validada,
    [config.campos.campo_obs]:    parsed.observacion ?? null,
    [config.campos.campo_apr]:    user?.email ?? user?.id,
    [config.campos.campo_estado]: config.estadoResultante,
    [config.campos.campo_fecha]:  new Date().toISOString().slice(0, 10),
  };

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) throw new Error(error.message);

  revalidatePath(rutaRevalidar);
  return { ok: true };
}

export async function devolver(
  registroId:    string,
  tabla:         string,
  rol:           Rol,
  observacion:   string,
  rutaRevalidar: string,
) {
  const parsed = devolucionSchema.parse({ observacion });
  const config = APROBACION_CONFIG[rol];
  if (!config) throw new Error(`Rol ${rol} no puede devolver`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload: Record<string, unknown> = {
    estado:                    'DEVUELTO',
    [config.campos.campo_obs]:    parsed.observacion,
    [config.campos.campo_apr]:    user?.email ?? user?.id,
    [config.campos.campo_estado]: 'DEVUELTO',
    [config.campos.campo_fecha]:  new Date().toISOString().slice(0, 10),
  };

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) throw new Error(error.message);

  revalidatePath(rutaRevalidar);
  return { ok: true };
}
