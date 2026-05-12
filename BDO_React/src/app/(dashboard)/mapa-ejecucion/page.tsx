import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const revalidate = 30;

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
    { count: totalCantidades },
    { count: totalComponentes },
    { count: totalDiario },
    { count: totalPmt },
  ] = await Promise.all([
    supabase
      .from('tramos_bd')
      .select('id, nombre, estado_ejecucion, avance_pct, geojson')
      .eq('contrato_id', contratoId),
    supabase
      .from('registros_cantidades')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false })
      .range(0, 9999),
    supabase
      .from('registros_componentes')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false })
      .range(0, 9999),
    supabase
      .from('registros_reporte_diario')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha', { ascending: false })
      .range(0, 9999),
    supabase
      .from('formulario_pmt')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('fecha_creacion', { ascending: false })
      .range(0, 9999),
    supabase
      .from('registros_cantidades')
      .select('*', { count: 'exact', head: true })
      .eq('contrato_id', contratoId),
    supabase
      .from('registros_componentes')
      .select('*', { count: 'exact', head: true })
      .eq('contrato_id', contratoId),
    supabase
      .from('registros_reporte_diario')
      .select('*', { count: 'exact', head: true })
      .eq('contrato_id', contratoId),
    supabase
      .from('formulario_pmt')
      .select('*', { count: 'exact', head: true })
      .eq('contrato_id', contratoId),
  ]);

  return (
    <MapaClient
      tramos={tramos ?? []}
      cantidades={cantidades ?? []}
      componentes={componentes ?? []}
      reporteDiario={reporteDiario ?? []}
      formularioPmt={formularioPmt ?? []}
      totalCantidades={totalCantidades ?? cantidades?.length ?? 0}
      totalComponentes={totalComponentes ?? componentes?.length ?? 0}
      totalDiario={totalDiario ?? reporteDiario?.length ?? 0}
      totalPmt={totalPmt ?? formularioPmt?.length ?? 0}
    />
  );
}
