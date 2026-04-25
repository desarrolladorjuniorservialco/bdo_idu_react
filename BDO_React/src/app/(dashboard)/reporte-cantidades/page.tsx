import { createClient } from '@/lib/supabase/server';
import { fetchCantidades, fetchFotosCantidades } from '@/lib/supabase/actions/cantidades';
import ReporteCantidadesClient from './ReporteCantidadesClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchCantidades(perfil!.contrato_id);
  const fotos = await fetchFotosCantidades(registros.map((r: any) => r.id));

  return <ReporteCantidadesClient registros={registros} fotos={fotos} rol={perfil!.rol} />;
}
