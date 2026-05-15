'use server';
import { driveUrlToProxyUrl } from '@/lib/drive';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchCantidades(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_cantidades')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function fetchFotosCantidadesByContrato(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_cantidades')
    .select('registro_id, url, descripcion')
    .eq('contrato_id', contratoId);
  return (data ?? []).map((f) => ({ ...f, url: driveUrlToProxyUrl(f.url) }));
}

export async function eliminarRegistroCantidad(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('registros_cantidades').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/reporte-cantidades');
}
