import {
  fetchReporteDiario,
  fetchSubtablasDiarioByContrato,
} from '@/lib/supabase/actions/reporte-diario';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import AnotacionesDiarioClient from './AnotacionesDiarioClient';

export const revalidate = 30;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;
  const supabase = await createClient();

  const [registros, subtablas, countRes] = await Promise.all([
    fetchReporteDiario(contratoId),
    fetchSubtablasDiarioByContrato(contratoId),
    supabase
      .from('registros_reporte_diario')
      .select('*', { count: 'exact', head: true })
      .eq('contrato_id', contratoId),
  ]);

  const totalRegistros = countRes.count ?? registros.length;

  return (
    <AnotacionesDiarioClient
      registros={registros}
      subtablas={subtablas}
      rol={perfil!.rol}
      totalRegistros={totalRegistros}
    />
  );
}
