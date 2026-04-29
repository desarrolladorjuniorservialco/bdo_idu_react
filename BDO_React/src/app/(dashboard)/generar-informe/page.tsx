import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import GenerarInformeClient from './GenerarInformeClient';

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);

  return <GenerarInformeClient contratoId={perfil!.contrato_id} />;
}
