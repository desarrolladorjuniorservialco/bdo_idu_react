import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);

  const supabase = await createClient();
  const { data: tramos } = await supabase
    .from('tramos_bd')
    .select('id, nombre, estado_ejecucion, avance_pct, geojson')
    .eq('contrato_id', perfil!.contrato_id);

  return <MapaClient tramos={tramos ?? []} />;
}
