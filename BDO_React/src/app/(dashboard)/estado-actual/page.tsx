import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getCachedPerfil, getCachedUser } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import { formatCOP, formatDateDMY } from '@/lib/utils';
import type { Adicion, Contrato, Prorroga } from '@/types/database';
import { redirect } from 'next/navigation';

export const revalidate = 60;

function parseDateUTC(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function TimelineBar({
  pct,
  diasTrans,
  diasRest,
  fechaIni,
  fechaFin,
}: {
  pct: number;
  diasTrans: number;
  diasRest: number;
  fechaIni: string;
  fechaFin: string;
}) {
  const color =
    pct > 85 ? 'var(--accent-red)' : pct > 60 ? 'var(--accent-orange)' : '#198754';
  const barText = pct >= 20 ? `${pct.toFixed(1)}% transcurrido` : `${pct.toFixed(1)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>Ejecución del plazo vigente</span>
        <span className="font-bold" style={{ color }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
        <div
          className="h-5 rounded-full flex items-center px-2 transition-all"
          style={{ width: `${Math.max(pct, 3)}%`, background: color }}
        >
          <span className="text-white text-[10px] font-semibold whitespace-nowrap">{barText}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>Inicio: {fechaIni}</span>
        <span className="font-semibold" style={{ color }}>
          {diasTrans} días transcurridos · {diasRest} restantes
        </span>
        <span>Fin vigente: {fechaFin}</span>
      </div>
    </div>
  );
}

export default async function EstadoActualPage() {
  const user = await getCachedUser();
  if (!user) redirect('/login');
  const perfil = await getCachedPerfil(user.id);
  const contratoId = perfil?.contrato_id;
  if (!contratoId) {
    return (
      <div className="space-y-4">
        <SectionBadge label="Estado Actual del Contrato" page="estado-actual" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sin datos de contrato. Verifica la sincronización.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [contratoRes, prorrogasRes, adicionesRes] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', contratoId).single(),
    supabase
      .from('contratos_prorrogas')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('numero'),
    supabase
      .from('contratos_adiciones')
      .select('*')
      .eq('contrato_id', contratoId)
      .order('numero'),
  ]);

  const contrato = contratoRes.data as Contrato | null;
  const prorrogas = (prorrogasRes.data ?? []) as Prorroga[];
  const adiciones = (adicionesRes.data ?? []) as Adicion[];

  if (!contrato) {
    return (
      <div className="space-y-4">
        <SectionBadge label="Estado Actual del Contrato" page="estado-actual" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Sin datos de contrato. Verifica la sincronización.
        </p>
      </div>
    );
  }

  // ── Cálculos de tiempo ──────────────────────────────────
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const fechaInicio = parseDateUTC(contrato.fecha_inicio);
  const fechaFinOrig = parseDateUTC(contrato.fecha_fin);
  const fechaFinVig = parseDateUTC(contrato.plazo_actual ?? contrato.fecha_fin);

  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  const diasTranscurridos = Math.max(
    Math.floor((today.getTime() - fechaInicio.getTime()) / MS_POR_DIA),
    0,
  );
  const plazoOriginal = Math.floor((fechaFinOrig.getTime() - fechaInicio.getTime()) / MS_POR_DIA);
  const plazoTotal = Math.max(
    Math.floor((fechaFinVig.getTime() - fechaInicio.getTime()) / MS_POR_DIA),
    1,
  );
  const diasRestantes = Math.max(
    Math.floor((fechaFinVig.getTime() - today.getTime()) / MS_POR_DIA),
    0,
  );
  const pctTiempo = Math.min((diasTranscurridos / plazoTotal) * 100, 100);
  const diasExtension = Math.floor(
    (fechaFinVig.getTime() - fechaFinOrig.getTime()) / MS_POR_DIA,
  );

  const totalDiasAdicionados = prorrogas.reduce((a, p) => a + (p.plazo_dias ?? 0), 0);
  const totalAdicionado = adiciones.reduce((a, ad) => a + (ad.adicion ?? 0), 0);

  const kpiAccent =
    pctTiempo > 85 ? ('red' as const) : pctTiempo > 60 ? ('orange' as const) : ('blue' as const);

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
  } as const;

  return (
    <div className="space-y-6">
      <SectionBadge label="Estado Actual del Contrato" page="estado-actual" />

      {/* ── Frame 1: Identificación del contrato ── */}
      <div className="rounded-xl p-5 relative overflow-hidden" style={cardStyle}>
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: 'var(--corp-primary)' }} />

        <div className="flex items-start justify-between gap-4 flex-wrap pl-3">
          <div>
            <p
              className="text-[10px] font-mono uppercase tracking-widest mb-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Contrato de Obra
            </p>
            <h2
              className="text-base font-semibold max-w-2xl"
              style={{ color: 'var(--text-primary)' }}
            >
              {contrato.nombre}
            </h2>
          </div>
          <StatusBadge estado={contrato.estado ?? 'ACTIVO'} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mt-5 pl-3">
          {[
            { label: 'N.° Contrato', value: contrato.id },
            { label: 'Contratista', value: contrato.contratista },
            { label: 'Interventoría', value: contrato.intrventoria },
            { label: 'Supervisor IDU', value: contrato.supervisor_idu },
            { label: 'Fecha Inicio', value: formatDateDMY(contrato.fecha_inicio) },
            { label: 'Fecha Fin Original', value: formatDateDMY(contrato.fecha_fin) },
            { label: 'Fecha Fin Vigente', value: formatDateDMY(contrato.plazo_actual) },
            { label: 'Valor Contrato', value: formatCOP(contrato.valor_contrato) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Frame 2: Plazo vigente ── */}
      <div className="rounded-xl p-5 space-y-5" style={cardStyle}>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Plazo Vigente
        </p>

        <TimelineBar
          pct={pctTiempo}
          diasTrans={diasTranscurridos}
          diasRest={diasRestantes}
          fechaIni={formatDateDMY(contrato.fecha_inicio)}
          fechaFin={formatDateDMY(contrato.plazo_actual ?? contrato.fecha_fin)}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Días Transcurridos"
            value={diasTranscurridos}
            accent={kpiAccent}
            sublabel={`${pctTiempo.toFixed(1)}% del plazo vigente`}
          />
          <KpiCard
            label="Días Restantes"
            value={diasRestantes}
            accent="blue"
            sublabel={`Fin: ${formatDateDMY(contrato.plazo_actual ?? contrato.fecha_fin)}`}
          />
          <KpiCard
            label="Plazo Original"
            value={`${plazoOriginal} días`}
            accent="blue"
            sublabel={`Hasta ${formatDateDMY(contrato.fecha_fin)}`}
          />
          <KpiCard
            label="Prórrogas Aplicadas"
            value={contrato.prorrogas}
            accent={contrato.prorrogas > 0 ? 'orange' : 'blue'}
            sublabel={
              contrato.prorrogas > 0
                ? `+${diasExtension} días totales`
                : 'Sin prórrogas'
            }
          />
        </div>
      </div>

      {/* ── Tabla de prórrogas ── */}
      <div>
        <SectionBadge label="Seguimiento de Prórrogas" page="estado-actual" />
        <div className="rounded-xl p-4 mt-3" style={cardStyle}>
          {prorrogas.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sin prórrogas registradas para este contrato.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                      <th className="pb-2 font-medium">No.</th>
                      <th className="pb-2 font-medium">Días adicionados</th>
                      <th className="pb-2 font-medium">Nueva fecha fin</th>
                      <th className="pb-2 font-medium">Fecha firma</th>
                      <th className="pb-2 font-medium">Acta</th>
                      <th className="pb-2 font-medium">Objeto</th>
                      <th className="pb-2 font-medium">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {prorrogas.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2">{p.numero}</td>
                        <td className="py-2 font-mono tabular-nums">{p.plazo_dias}</td>
                        <td className="py-2">{formatDateDMY(p.fecha_fin)}</td>
                        <td className="py-2">{formatDateDMY(p.fecha_firma)}</td>
                        <td className="py-2">{p.acta ?? '—'}</td>
                        <td className="py-2 max-w-xs truncate">{p.objeto ?? '—'}</td>
                        <td className="py-2 text-[var(--text-muted)]">{p.observaciones ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Total días adicionados por prórrogas:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{totalDiasAdicionados} días</strong>
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Tabla de adiciones ── */}
      <div>
        <SectionBadge label="Seguimiento de Adiciones Presupuestales" page="estado-actual" />
        <div className="rounded-xl p-4 mt-3" style={cardStyle}>
          {adiciones.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sin adiciones presupuestales registradas para este contrato.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                      <th className="pb-2 font-medium">No.</th>
                      <th className="pb-2 font-medium">Adición</th>
                      <th className="pb-2 font-medium">Valor acumulado</th>
                      <th className="pb-2 font-medium">Fecha firma</th>
                      <th className="pb-2 font-medium">Acta</th>
                      <th className="pb-2 font-medium">Objeto</th>
                      <th className="pb-2 font-medium">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {adiciones.map((ad) => (
                      <tr key={ad.id}>
                        <td className="py-2">{ad.numero}</td>
                        <td className="py-2 font-mono tabular-nums">{formatCOP(ad.adicion)}</td>
                        <td className="py-2 font-mono tabular-nums">{formatCOP(ad.valor_actual)}</td>
                        <td className="py-2">{formatDateDMY(ad.fecha_firma)}</td>
                        <td className="py-2">{ad.acta ?? '—'}</td>
                        <td className="py-2 max-w-xs truncate">{ad.objeto ?? '—'}</td>
                        <td className="py-2 text-[var(--text-muted)]">{ad.observaciones ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                Total adicionado:{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{formatCOP(totalAdicionado)}</strong>
                {' '}· Inicial {formatCOP(contrato.valor_contrato)} → Actual{' '}
                {formatCOP(contrato.valor_actual)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
