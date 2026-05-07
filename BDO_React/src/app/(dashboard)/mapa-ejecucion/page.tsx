import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;
  const supabase = await createClient();

  const [
    { data: tramos },
    { data: cantidades },
    { data: componentes },
    { data: reporteDiario },
    { data: formularioPmt },
  ] = await Promise.all([
    supabase
      .from('tramos_bd')
      .select('id, nombre, estado_ejecucion, avance_pct, geojson')
      .eq('contrato_id', contratoId),
    supabase
      .from('registros_cantidades')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false }),
    supabase
      .from('registros_componentes')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false }),
    supabase
      .from('registros_reporte_diario')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha', { ascending: false }),
    supabase
      .from('formulario_pmt')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false }),
  ]);

  return (
    <MapaClient
      tramos={tramos ?? []}
      cantidades={cantidades ?? []}
      componentes={componentes ?? []}
      reporteDiario={reporteDiario ?? []}
      formularioPmt={formularioPmt ?? []}
    />
  );
}
