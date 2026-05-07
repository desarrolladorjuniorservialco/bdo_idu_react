'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchCantidades(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_cantidades')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function fetchFotosCantidades(registroIds: string[]) {
  if (!registroIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_cantidades')
    .select('registro_id, url, descripcion')
    .in('registro_id', registroIds);
  return data ?? [];
}

export async function fetchFotosCantidadesByContrato(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_cantidades')
    .select('registro_id, url, descripcion')
    .eq('contrato_id', contratoId);
  return data ?? [];
}
