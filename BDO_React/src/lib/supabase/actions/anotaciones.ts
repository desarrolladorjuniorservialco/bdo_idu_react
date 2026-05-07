'use server';
import { ROL_LABELS } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { anotacionSchema } from '@/lib/validators/anotacion.schema';
import type { Rol } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function insertarAnotacion(contratoId: string, input: unknown) {
  const parsed = anotacionSchema.parse(input);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol, empresa')
    .eq('id', user.id)
    .single();

  const { data, error } = await supabase
    .from('anotaciones_generales')
    .insert({
      contrato_id: contratoId,
      fecha: parsed.fecha,
      tramo: parsed.tramo || null,
      civ: parsed.civ || null,
      pk: parsed.pk || null,
      anotacion: parsed.anotacion,
      usuario_id: user.id,
      usuario_nombre: perfil?.nombre ?? user.email ?? '',
      usuario_rol: perfil?.rol ?? 'operativo',
      usuario_empresa: perfil?.empresa ?? '',
    })
    .select(
      'id,contrato_id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at',
    )
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/anotaciones');
  return { ok: true, anotacion: data };
}
