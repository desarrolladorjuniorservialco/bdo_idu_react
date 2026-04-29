import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import GenerarInformeClient from './GenerarInformeClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const supabase = await createClient();

  const [
    { data: contrato },
    { data: cantidades },
    { data: componentes },
    { data: diario },
    { data: anotaciones },
    { data: clima },
    { data: personal },
    { data: maquinaria },
    { data: sst },
  ] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', contratoId).single(),
    supabase.from('registros_cantidades').select('*').eq('contrato_id', contratoId),
    supabase.from('registros_componentes').select('*').eq('contrato_id', contratoId),
    supabase.from('registros_reporte_diario').select('*').eq('contrato_id', contratoId),
    supabase.from('anotaciones_generales').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_condicion_climatica').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_personal_obra').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_maquinaria_obra').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_sst_ambiental').select('*').eq('contrato_id', contratoId),
  ]);

  return (
    <GenerarInformeClient
      data={{
        contrato,
        cantidades: cantidades ?? [],
        componentes: componentes ?? [],
        diario: diario ?? [],
        anotaciones: anotaciones ?? [],
        clima: clima ?? [],
        personal: personal ?? [],
        maquinaria: maquinaria ?? [],
        sst: sst ?? [],
        generado_en: new Date().toISOString(),
      }}
    />
  );
}
