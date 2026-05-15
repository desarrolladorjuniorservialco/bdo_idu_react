'use server';
import { driveUrlToProxyUrl } from '@/lib/drive';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchComponentes(contratoId: string, componente: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_componentes')
    .select(`
      *,
      residente:perfiles!aprobado_residente(nombre),
      interventor:perfiles!aprobado_interventor(nombre)
    `)
    .eq('contrato_id', contratoId)
    .eq('componente', componente)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function fetchFotosComponentesByContrato(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_componentes')
    .select('registro_id, url, descripcion')
    .eq('contrato_id', contratoId);
  return (data ?? []).map((f) => ({ ...f, url: driveUrlToProxyUrl(f.url) }));
}

export async function fetchFormularioPmt(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('formulario_pmt')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function eliminarRegistroComponente(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('registros_componentes').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/componente-ambiental');
  revalidatePath('/componente-social');
  revalidatePath('/componente-pmt');
}
