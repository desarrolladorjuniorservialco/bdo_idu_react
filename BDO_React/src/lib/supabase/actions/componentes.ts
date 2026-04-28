'use server';
import { createClient } from '@/lib/supabase/server';

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

export async function fetchFotosComponentes(registroIds: string[]) {
  if (!registroIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_componentes')
    .select('registro_id, url, descripcion')
    .in('registro_id', registroIds);
  return data ?? [];
}

export async function fetchFotosComponentesByContrato(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_componentes')
    .select('registro_id, url, descripcion')
    .eq('contrato_id', contratoId);
  return data ?? [];
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
