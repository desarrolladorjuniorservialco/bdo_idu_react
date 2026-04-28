'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchReporteDiario(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_reporte_diario')
    .select(`
      *,
      residente:perfiles!aprobado_residente(nombre),
      interventor:perfiles!aprobado_interventor(nombre)
    `)
    .eq('contrato_id', contratoId)
    .order('fecha', { ascending: false });
  return data ?? [];
}

export async function fetchSubtablasDiario(registroIds: string[]) {
  if (!registroIds.length) {
    return { personal: [], clima: [], maquinaria: [], sst: [], fotos: [] };
  }
  const supabase = await createClient();
  const [personal, clima, maquinaria, sst, fotos] = await Promise.all([
    supabase.from('bd_personal_obra').select('*').in('registro_id', registroIds),
    supabase.from('bd_condicion_climatica').select('*').in('registro_id', registroIds),
    supabase.from('bd_maquinaria_obra').select('*').in('registro_id', registroIds),
    supabase.from('bd_sst_ambiental').select('*').in('registro_id', registroIds),
    supabase
      .from('rf_reporte_diario')
      .select('registro_id, url, descripcion')
      .in('registro_id', registroIds),
  ]);
  return {
    personal: personal.data ?? [],
    clima: clima.data ?? [],
    maquinaria: maquinaria.data ?? [],
    sst: sst.data ?? [],
    fotos: fotos.data ?? [],
  };
}

export async function fetchSubtablasDiarioByContrato(contratoId: string) {
  const supabase = await createClient();
  const [personal, clima, maquinaria, sst, fotos] = await Promise.all([
    supabase.from('bd_personal_obra').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_condicion_climatica').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_maquinaria_obra').select('*').eq('contrato_id', contratoId),
    supabase.from('bd_sst_ambiental').select('*').eq('contrato_id', contratoId),
    supabase
      .from('rf_reporte_diario')
      .select('registro_id, url, descripcion')
      .eq('contrato_id', contratoId),
  ]);
  return {
    personal: personal.data ?? [],
    clima: clima.data ?? [],
    maquinaria: maquinaria.data ?? [],
    sst: sst.data ?? [],
    fotos: fotos.data ?? [],
  };
}
