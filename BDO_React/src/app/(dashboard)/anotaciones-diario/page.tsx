import { createClient } from '@/lib/supabase/server';
import { fetchReporteDiario, fetchSubtablasDiario } from '@/lib/supabase/actions/reporte-diario';
import AnotacionesDiarioClient from './AnotacionesDiarioClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchReporteDiario(perfil!.contrato_id);
  const ids = registros.map((r: any) => r.id);
  const subtablas = await fetchSubtablasDiario(ids);

  return <AnotacionesDiarioClient registros={registros} subtablas={subtablas} rol={perfil!.rol} />;
}
