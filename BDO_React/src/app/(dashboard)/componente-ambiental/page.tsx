import { createClient } from '@/lib/supabase/server';
import { fetchComponentes, fetchFotosComponentes } from '@/lib/supabase/actions/componentes';
import ComponentePage from '@/components/pages/ComponentePage';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchComponentes(perfil!.contrato_id, 'ambiental');
  const fotos = await fetchFotosComponentes(registros.map((r: any) => r.id));

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
