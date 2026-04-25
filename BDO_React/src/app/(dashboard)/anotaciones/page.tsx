import { createClient } from '@/lib/supabase/server';
import AnotacionesClient from './AnotacionesClient';

export const revalidate = 0;

export default async function AnotacionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('contrato_id')
    .eq('id', user!.id)
    .single();

  const contratoId = perfil!.contrato_id;

  const { data } = await supabase
    .from('anotaciones_generales')
    .select('id,contrato_id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false })
    .limit(300);

  // Revertir para mostrar más antigua arriba (estilo chat)
  const anotaciones = ([...(data ?? [])]).reverse();

  return <AnotacionesClient anotaciones={anotaciones} contratoId={contratoId} />;
}
