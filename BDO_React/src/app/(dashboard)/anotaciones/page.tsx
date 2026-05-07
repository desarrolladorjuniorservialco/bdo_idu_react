import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import AnotacionesClient from './AnotacionesClient';

export const revalidate = 0;

export default async function AnotacionesPage() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const supabase = await createClient();
  const { data } = await supabase
    .from('anotaciones_generales')
    .select(
      'id,contrato_id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at',
    )
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false })
    .limit(300);

  const anotaciones = [...(data ?? [])].reverse();

  return <AnotacionesClient anotaciones={anotaciones} contratoId={contratoId} />;
}
