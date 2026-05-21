'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchPresupuesto(contratoId: string) {
  const supabase = await createClient();
  const [{ data: items }, { data: tramos }] = await Promise.all([
    supabase.from('presupuesto_ejecucion_v').select('*').eq('contrato_id', contratoId),
    supabase
      .from('tramos_ejecucion_v')
      .select(
        'id, id_tramo, tramo_descripcion, contrato_id, infraestructura, meta_fisica, ejecutado, und, cicloruta_km, esp_publico_m2, avance_pct, estado_ejecucion',
      )
      .eq('contrato_id', contratoId),
  ]);
  return { items: items ?? [], tramos: tramos ?? [] };
}
