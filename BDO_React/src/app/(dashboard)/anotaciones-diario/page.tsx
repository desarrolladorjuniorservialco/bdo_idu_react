import {
  fetchReporteDiario,
  fetchSubtablasDiarioByContrato,
} from '@/lib/supabase/actions/reporte-diario';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import AnotacionesDiarioClient from './AnotacionesDiarioClient';

export const revalidate = 30;

export default async function Page() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil!.contrato_id;

  const [registros, subtablas] = await Promise.all([
    fetchReporteDiario(contratoId),
    fetchSubtablasDiarioByContrato(contratoId),
  ]);

  return <AnotacionesDiarioClient registros={registros} subtablas={subtablas} rol={perfil!.rol} />;
}
