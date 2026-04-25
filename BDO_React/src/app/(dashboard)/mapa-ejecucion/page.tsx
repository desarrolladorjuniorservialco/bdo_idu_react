import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('contrato_id').eq('id', user!.id).single();

  const { data: tramos } = await supabase
    .from('tramos_bd')
    .select('id, nombre, estado_ejecucion, avance_pct, geojson')
    .eq('contrato_id', perfil!.contrato_id);

  return <MapaClient tramos={tramos ?? []} />;
}
