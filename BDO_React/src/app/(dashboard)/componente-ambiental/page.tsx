import ComponentePage from '@/components/pages/ComponentePage';
import {
  fetchComponentes,
  fetchFotosComponentesByContrato,
} from '@/lib/supabase/actions/componentes';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';

export const revalidate = 0;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const [registros, fotos] = await Promise.all([
    fetchComponentes(contratoId, 'ambiental'),
    fetchFotosComponentesByContrato(contratoId),
  ]);

  return (
    <ComponentePage
      title="Componente Ambiental - SST"
      page="componente-ambiental"
      tabla="registros_componentes"
      registros={registros}
      fotos={fotos}
      rol={perfil!.rol}
    />
  );
}
