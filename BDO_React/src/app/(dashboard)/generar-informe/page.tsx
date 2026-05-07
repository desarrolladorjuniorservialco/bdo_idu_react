import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import GenerarInformeClient from './GenerarInformeClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const supabase = await createClient();

  const [{ data: contrato }, { data: cantidades }, { data: correspondencia }] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', contratoId).single(),
    supabase
      .from('registros_cantidades')
      .select('id, estado, cantidad, precio_unitario')
      .eq('contrato_id', contratoId),
    supabase.from('correspondencia').select('id, estado').eq('contrato_id', contratoId),
  ]);

  return (
    <GenerarInformeClient
      data={{
        contrato,
        cantidades: cantidades ?? [],
        correspondencia: correspondencia ?? [],
        generado_en: new Date().toISOString(),
      }}
    />
  );
}
