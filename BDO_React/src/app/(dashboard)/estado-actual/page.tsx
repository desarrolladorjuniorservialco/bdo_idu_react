import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import { formatCOP, formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function EstadoActualPage() {
  const user = await getCachedUser();
  const perfil = await getCachedPerfil(user!.id);
  const contratoId = perfil?.contrato_id;

  const supabase = await createClient();
  const [contratoRes, prorrogasRes, adicionesRes] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', contratoId).single(),
    supabase.from('contratos_prorrogas').select('*').eq('contrato_id', contratoId).order('numero'),
    supabase.from('contratos_adiciones').select('*').eq('contrato_id', contratoId).order('numero'),
  ]);

  const contrato = contratoRes.data;
  const prorrogas = prorrogasRes.data ?? [];
  const adiciones = adicionesRes.data ?? [];

  const valorActual =
    (contrato?.valor_inicial ?? 0) + adiciones.reduce((a: number, ad) => a + (ad.valor ?? 0), 0);

  const today = new Date();
  const inicio = contrato?.fecha_inicio ? new Date(contrato.fecha_inicio) : null;
  const fin = contrato?.fecha_fin ? new Date(contrato.fecha_fin) : null;
  const total = inicio && fin ? fin.getTime() - inicio.getTime() : 1;
  const elapsed = inicio ? Math.min(today.getTime() - inicio.getTime(), total) : 0;
  const pctTime = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;

  return (
    <div className="space-y-6">
      <SectionBadge label="Estado Actual del Contrato" page="estado-actual" />

      {/* Encabezado del contrato */}
      {contrato ? (
        <div
          className="rounded-xl p-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-0.5">
                {contrato.numero}
              </p>
              <h2 className="text-base font-semibold text-[var(--text-primary)] max-w-2xl">
                {contrato.objeto}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">{contrato.contratista}</p>
            </div>
            <StatusBadge estado={contrato.estado ?? 'ACTIVO'} />
          </div>

          {/* Barra de tiempo */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>Inicio: {formatDate(contrato.fecha_inicio)}</span>
              <span className="font-semibold">{pctTime.toFixed(1)}% del plazo</span>
              <span>Fin: {formatDate(contrato.fecha_fin)}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--muted)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${pctTime}%`, background: 'var(--idu-blue)' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">Sin datos de contrato.</p>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Valor inicial" value={formatCOP(contrato?.valor_inicial)} accent="blue" />
        <KpiCard
          label="Adiciones"
          value={formatCOP(adiciones.reduce((a: number, ad) => a + (ad.valor ?? 0), 0))}
          accent="orange"
        />
        <KpiCard label="Valor actual" value={formatCOP(valorActual)} accent="green" />
        <KpiCard
          label="Plazo (meses)"
          value={contrato?.plazo_meses ?? '—'}
          accent="purple"
          sublabel={`${prorrogas.length} prórroga(s)`}
        />
      </div>

      {/* Prórrogas */}
      {prorrogas.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3 text-[var(--text-primary)]">Prórrogas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-2 font-medium">No.</th>
                  <th className="pb-2 font-medium">Plazo (meses)</th>
                  <th className="pb-2 font-medium">Inicio</th>
                  <th className="pb-2 font-medium">Fin</th>
                  <th className="pb-2 font-medium">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {prorrogas.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2">{p.numero}</td>
                    <td className="py-2 font-mono">{p.plazo_meses}</td>
                    <td className="py-2">{formatDate(p.fecha_inicio)}</td>
                    <td className="py-2">{formatDate(p.fecha_fin)}</td>
                    <td className="py-2 text-[var(--text-muted)]">{p.observacion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adiciones */}
      {adiciones.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold mb-3 text-[var(--text-primary)]">
            Adiciones Presupuestales
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-2 font-medium">No.</th>
                  <th className="pb-2 font-medium">Valor</th>
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {adiciones.map((ad) => (
                  <tr key={ad.id}>
                    <td className="py-2">{ad.numero}</td>
                    <td className="py-2 font-mono tabular-nums">{formatCOP(ad.valor)}</td>
                    <td className="py-2">{formatDate(ad.fecha)}</td>
                    <td className="py-2 text-[var(--text-muted)]">{ad.observacion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
