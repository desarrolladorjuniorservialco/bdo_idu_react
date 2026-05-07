import { fetchCantidades, fetchFotosCantidadesByContrato } from '@/lib/supabase/actions/cantidades';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import ReporteCantidadesClient from './ReporteCantidadesClient';

export const revalidate = 0;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const [registros, fotos] = await Promise.all([
    fetchCantidades(contratoId),
    fetchFotosCantidadesByContrato(contratoId),
  ]);

  return <ReporteCantidadesClient registros={registros} fotos={fotos} rol={perfil!.rol} />;
}
