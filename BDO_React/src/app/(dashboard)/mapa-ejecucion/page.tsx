import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const revalidate = 30;

const PAGE_SIZE = 1000;

async function fetchAllRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  contratoId: string,
  orderField: string,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('contrato_id', contratoId)
      .order(orderField, { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    all.push(...(data as Record<string, unknown>[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;
  const supabase = await createClient();

  const [
    { data: tramos },
    cantidades,
    componentes,
    reporteDiario,
    formularioPmt,
    { count: totalCantidades },
    { count: totalComponentes },
    { count: totalDiario },
    { count: totalPmt },
  ] = await Promise.all([
    supabase
      .from('tramos_bd')
      .select('id, nombre, estado_ejecucion, avance_pct, geojson')
      .eq('contrato_id', contratoId),
    fetchAllRows(supabase, 'registros_cantidades', contratoId, 'fecha_creacion'),
    fetchAllRows(supabase, 'registros_componentes', contratoId, 'fecha_creacion'),
    fetchAllRows(supabase, 'registros_reporte_diario', contratoId, 'fecha'),
    fetchAllRows(supabase, 'formulario_pmt', contratoId, 'fecha_creacion'),
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
      cantidades={cantidades}
      componentes={componentes}
      reporteDiario={reporteDiario}
      formularioPmt={formularioPmt}
      totalCantidades={totalCantidades ?? cantidades.length}
      totalComponentes={totalComponentes ?? componentes.length}
      totalDiario={totalDiario ?? reporteDiario.length}
      totalPmt={totalPmt ?? formularioPmt.length}
    />
  );
}
