'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchPresupuesto(contratoId: string) {
  const supabase = await createClient();
  const [{ data: items }, { data: tramos }] = await Promise.all([
    supabase.from('presupuesto_bd').select('*').eq('contrato_id', contratoId),
    supabase.from('tramos_bd').select('*').eq('contrato_id', contratoId),
  ]);
  return { items: items ?? [], tramos: tramos ?? [] };
}
