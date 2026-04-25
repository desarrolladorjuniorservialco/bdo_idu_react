import { createClient } from '@/lib/supabase/server';
import { fetchFormularioPmt } from '@/lib/supabase/actions/componentes';
import SeguimientoPmtsClient from './SeguimientoPmtsClient';

export const revalidate = 120;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const pmts = await fetchFormularioPmt(perfil!.contrato_id);
  return <SeguimientoPmtsClient pmts={pmts} rol={perfil!.rol} />;
}
