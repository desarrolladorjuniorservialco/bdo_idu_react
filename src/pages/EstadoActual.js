import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';
import TimelineBar from '../components/TimelineBar';

function fmtCOP(val) {
  const v = parseFloat(val);
  if (isNaN(v)) return '—';
  const a = Math.abs(v);
  if (a >= 1e12) return `$${(v / 1e12).toFixed(2)} Billones`;
  if (a >= 1e9)  return `$${(v / 1e9).toFixed(2)} milM`;
  if (a >= 1e6)  return `$${(v / 1e6).toFixed(1)} M`;
  return `$${v.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

function fmtDate(val, fmt = 'dd/mm/yyyy') {
  if (!val) return '—';
  try {
    const d = new Date(String(val).slice(0, 10) + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return String(val).slice(0, 10); }
}

function calcTimeline(fechaIni, fechaFin) {
  if (!fechaIni || !fechaFin) return null;
  const ini   = new Date(String(fechaIni).slice(0, 10));
  const fin   = new Date(String(fechaFin).slice(0, 10));
  const hoy   = new Date();
  const total = Math.max(1, Math.round((fin - ini) / 86400000));
  const trans = Math.max(0, Math.round((hoy - ini) / 86400000));
  const rest  = Math.max(0, total - trans);
  const pct   = Math.min(100, (trans / total) * 100);
  return { pct, diasTrans: trans, diasRest: rest };
}

export default function EstadoActual({ perfil }) {
  const [contrato, setContrato] = useState(null);
  const [prorrogas, setProrrogas] = useState([]);
  const [adiciones, setAdiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!perfil?.contrato_id) return;
    const id = perfil.contrato_id;

    Promise.all([
      supabase.from('contratos').select('*').eq('id', id).single(),
      supabase.from('contratos_prorrogas').select('*').eq('contrato_id', id).order('numero'),
      supabase.from('contratos_adiciones').select('*').eq('contrato_id', id).order('numero'),
    ]).then(([c, p, a]) => {
      if (c.error) { setError('No se pudo cargar el contrato.'); }
      else setContrato(c.data);
      setProrrogas(p.data || []);
      setAdiciones(a.data || []);
      setLoading(false);
    });
  }, [perfil]);

  if (loading) return <div className="loading-wrap">Cargando estado del contrato...</div>;
  if (error)   return <div className="error-wrap">{error}</div>;
  if (!contrato) return <div className="info-wrap">No hay datos de contrato disponibles.</div>;

  const timeline = calcTimeline(contrato.fecha_inicio, contrato.plazo_actual || contrato.fecha_fin);
  const durDias  = timeline ? Math.round(
    (new Date(String(contrato.plazo_actual || contrato.fecha_fin).slice(0,10)) -
     new Date(String(contrato.fecha_inicio).slice(0,10))) / 86400000
  ) : 0;

  const valorAdic = adiciones.reduce((s, a) => s + (parseFloat(a.valor) || 0), 0);

  return (
    <div>
      <SectionBadge label="Estado Actual del Contrato" color="blue" />
      <h3>Ficha del Contrato</h3>

      {/* Header del contrato */}
      <div className="contract-header">
        <div className="contract-id">{contrato.id}</div>
        <div className="contract-name">{contrato.nombre}</div>
        <div className="contract-meta-grid">
          <div>
            <div className="contract-meta-label">Contratista</div>
            <div className="contract-meta-value">{contrato.contratista || '—'}</div>
          </div>
          <div>
            <div className="contract-meta-label">Interventoría</div>
            <div className="contract-meta-value">{contrato.intrventoria || '—'}</div>
          </div>
          <div>
            <div className="contract-meta-label">Supervisor IDU</div>
            <div className="contract-meta-value">{contrato.supervisor_idu || '—'}</div>
          </div>
          <div>
            <div className="contract-meta-label">Fecha Inicio</div>
            <div className="contract-meta-value">{fmtDate(contrato.fecha_inicio)}</div>
          </div>
          <div>
            <div className="contract-meta-label">Plazo Vigente</div>
            <div className="contract-meta-value">{fmtDate(contrato.plazo_actual || contrato.fecha_fin)}</div>
          </div>
          <div>
            <div className="contract-meta-label">Duración</div>
            <div className="contract-meta-value">{durDias} días</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeline && (
        <TimelineBar
          pct={timeline.pct}
          diasTrans={timeline.diasTrans}
          diasRest={timeline.diasRest}
          fechaIni={fmtDate(contrato.fecha_inicio)}
          fechaFin={fmtDate(contrato.plazo_actual || contrato.fecha_fin)}
        />
      )}

      {/* KPIs financieros */}
      <h3 style={{ marginTop: '1.5rem' }}>Indicadores Financieros</h3>
      <div className="col-grid col-4">
        <KpiCard label="Valor Inicial" value={fmtCOP(contrato.valor_contrato)} cardAccent="accent-blue" />
        <KpiCard label="Valor Actual" value={fmtCOP(contrato.valor_actual)} cardAccent="accent-green" />
        <KpiCard label="Adiciones" value={fmtCOP(valorAdic)} cardAccent="accent-orange" />
        <KpiCard label="Prórrogas" value={String(contrato.prorrogas ?? prorrogas.length)} cardAccent="accent-purple" />
      </div>

      {/* Prórrogas */}
      {prorrogas.length > 0 && (
        <>
          <div className="tracking-table-wrap" style={{ marginTop: '1.5rem' }}>
            <div className="tracking-table-header">
              <span className="tracking-table-title">Prórrogas</span>
              <span className="tracking-table-count">{prorrogas.length}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Nueva Fecha Fin</th>
                  <th>Días Adicionales</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {prorrogas.map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{p.numero || i + 1}</td>
                    <td>{fmtDate(p.fecha)}</td>
                    <td>{fmtDate(p.nueva_fecha_fin)}</td>
                    <td>{p.dias_adicionales ?? '—'}</td>
                    <td>{p.descripcion || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Adiciones */}
      {adiciones.length > 0 && (
        <div className="tracking-table-wrap" style={{ marginTop: '1rem' }}>
          <div className="tracking-table-header">
            <span className="tracking-table-title">Adiciones Presupuestales</span>
            <span className="tracking-table-count">{adiciones.length}</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Valor</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {adiciones.map((a, i) => (
                <tr key={a.id || i}>
                  <td>{a.numero || i + 1}</td>
                  <td>{fmtDate(a.fecha)}</td>
                  <td>{fmtCOP(a.valor)}</td>
                  <td>{a.descripcion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
