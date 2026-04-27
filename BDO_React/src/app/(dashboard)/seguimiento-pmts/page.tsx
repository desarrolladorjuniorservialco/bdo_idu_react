import { fetchFormularioPmt } from '@/lib/supabase/actions/componentes';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import SeguimientoPmtsClient from './SeguimientoPmtsClient';

export const revalidate = 120;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);

  const pmts = await fetchFormularioPmt(perfil!.contrato_id);
  return <SeguimientoPmtsClient pmts={pmts} rol={perfil!.rol} />;
}
