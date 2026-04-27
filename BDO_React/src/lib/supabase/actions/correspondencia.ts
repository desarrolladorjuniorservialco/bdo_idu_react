'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { correspondenciaSchema } from '@/lib/validators/correspondencia.schema';

export async function fetchCorrespondencia(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('correspondencia')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha', { ascending: false });
  return data ?? [];
}

export async function insertarCorrespondencia(contratoId: string, input: unknown) {
  const parsed = correspondenciaSchema.parse(input);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('correspondencia').insert({
    ...parsed,
    contrato_id:           contratoId,
    creado_por:            user!.id,
    link:                  parsed.link || null,
    componente:            parsed.componente || null,
    plazo_respuesta:       parsed.plazo_respuesta || null,
    consecutivo_respuesta: parsed.consecutivo_respuesta || null,
    fecha_respuesta:       parsed.fecha_respuesta || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/correspondencia');
  return { ok: true };
}

export async function actualizarCorrespondencia(id: string, contratoId: string, input: unknown) {
  const parsed = correspondenciaSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from('correspondencia')
    .update({
      ...parsed,
      link:                  parsed.link || null,
      componente:            parsed.componente || null,
      plazo_respuesta:       parsed.plazo_respuesta || null,
      consecutivo_respuesta: parsed.consecutivo_respuesta || null,
      fecha_respuesta:       parsed.fecha_respuesta || null,
    })
    .eq('id', id)
    .eq('contrato_id', contratoId);
  if (error) throw new Error(error.message);
  revalidatePath('/correspondencia');
  return { ok: true };
}
