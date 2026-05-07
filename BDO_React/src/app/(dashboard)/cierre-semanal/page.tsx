import { fetchCantidades } from '@/lib/supabase/actions/cantidades';
import { fetchComponentes } from '@/lib/supabase/actions/componentes';
import { fetchCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import { fetchReporteDiario } from '@/lib/supabase/actions/reporte-diario';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import CierreSemanalClient from './CierreSemanalClient';

export const revalidate = 30;

export default async function CierreSemanalPage() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const supabase = await createClient();

  const [
    { data: anotaciones },
    diario,
    cantidades,
    correspondencia,
    componentesAmbiental,
    componentesSocial,
    componentesPmt,
    { items: presupuestoItems, tramos },
  ] = await Promise.all([
    supabase
      .from('anotaciones_generales')
      .select(
        'id,contrato_id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at',
      )
      .eq('contrato_id', contratoId)
      .order('fecha', { ascending: false })
      .limit(500),
    fetchReporteDiario(contratoId),
    fetchCantidades(contratoId),
    fetchCorrespondencia(contratoId),
    fetchComponentes(contratoId, 'ambiental'),
    fetchComponentes(contratoId, 'social'),
    fetchComponentes(contratoId, 'pmt'),
    fetchPresupuesto(contratoId),
  ]);

  const componentes = [
    ...componentesAmbiental.map((r) => ({ ...r, componente: 'ambiental' })),
    ...componentesSocial.map((r) => ({ ...r, componente: 'social' })),
    ...componentesPmt.map((r) => ({ ...r, componente: 'pmt' })),
  ];

  return (
    <CierreSemanalClient
      anotaciones={anotaciones ?? []}
      diario={diario}
      cantidades={cantidades}
      correspondencia={correspondencia}
      componentes={componentes}
      presupuestoItems={presupuestoItems}
      tramos={tramos}
    />
  );
}
