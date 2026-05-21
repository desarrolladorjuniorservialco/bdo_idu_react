import { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import PresupuestoClient from './PresupuestoClient';

export const revalidate = 120;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;
  const supabase = await createClient();

  const [presupuestoData, contratoRes] = await Promise.all([
    fetchPresupuesto(contratoId),
    supabase.from('contratos').select('valor_contrato').eq('id', contratoId).single(),
  ]);

  const valorContrato = Number(contratoRes.data?.valor_contrato ?? 0);

  // Derivar KPIs desde la vista (ya incluye ejecución acumulada por item)
  const valorEjecutado = presupuestoData.items.reduce(
    (sum, item) => sum + (Number((item as Record<string, unknown>).valor_ejecutado) || 0),
    0,
  );
  const itemsConEjecucion = presupuestoData.items.filter(
    (item) => Number((item as Record<string, unknown>).cantidad_ejecutada) > 0,
  ).length;

  return (
    <PresupuestoClient
      items={presupuestoData.items}
      tramos={presupuestoData.tramos}
      rol={perfil!.rol}
      valorContrato={valorContrato}
      valorEjecutado={valorEjecutado}
      itemsConEjecucion={itemsConEjecucion}
    />
  );
}
