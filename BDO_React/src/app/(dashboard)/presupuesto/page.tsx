import { createClient } from '@/lib/supabase/server';
import { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import PresupuestoClient from './PresupuestoClient';

export const revalidate = 120;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const { items } = await fetchPresupuesto(perfil!.contrato_id);
  return <PresupuestoClient items={items} rol={perfil!.rol} />;
}
