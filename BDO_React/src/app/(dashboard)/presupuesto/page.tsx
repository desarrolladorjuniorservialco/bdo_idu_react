import { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import PresupuestoClient from './PresupuestoClient';

export const revalidate = 120;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);

  const { items, tramos } = await fetchPresupuesto(perfil!.contrato_id);
  return <PresupuestoClient items={items} tramos={tramos} rol={perfil!.rol} />;
}
