import { createClient } from '@/lib/supabase/server';
import { fetchCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import CorrespondenciaClient from './CorrespondenciaClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchCorrespondencia(perfil!.contrato_id);
  return <CorrespondenciaClient registros={registros} rol={perfil!.rol} contratoId={perfil!.contrato_id} />;
}
