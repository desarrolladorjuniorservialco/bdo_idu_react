import { fetchCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import CorrespondenciaClient from './CorrespondenciaClient';

export const revalidate = 30;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);

  const registros = await fetchCorrespondencia(perfil!.contrato_id);
  return (
    <CorrespondenciaClient
      registros={registros}
      rol={perfil!.rol}
      contratoId={perfil!.contrato_id}
    />
  );
}
