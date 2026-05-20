sin dataimport { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import PresupuestoClient from './PresupuestoClient';

export const revalidate = 120;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;
  const supabase = await createClient();

  const [presupuestoData, contratoRes, cantAprobRes] = await Promise.all([
    fetchPresupuesto(contratoId),
    supabase.from('contratos').select('valor_contrato').eq('id', contratoId).single(),
    supabase
      .from('registros_cantidades')
      .select('cantidad, precio_unitario, item_pago')
      .eq('contrato_id', contratoId)
      .eq('estado', 'APROBADO'),
  ]);

  const valorContrato = Number(contratoRes.data?.valor_contrato ?? 0);
  const cantAprobadas = cantAprobRes.data ?? [];
  const valorEjecutado = cantAprobadas.reduce(
    (sum, r) => sum + (Number(r.cantidad) || 0) * (Number(r.precio_unitario) || 0),
    0,
  );
  const itemsConEjecucion = new Set(cantAprobadas.map((r) => r.item_pago).filter(Boolean)).size;

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
