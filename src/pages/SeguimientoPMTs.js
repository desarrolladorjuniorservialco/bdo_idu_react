import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}

const ESTADOS_PMT = ['Todos', 'ACTIVO', 'VENCIDO', 'CANCELADO', 'PENDIENTE'];

export default function SeguimientoPMTs({ perfil }) {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const [bus,  setBus]  = useState('');
  const [est,  setEst]  = useState('Todos');

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    let q = supabase
      .from('formulario_pmt')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .order('created_at', { ascending: false });
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil]);

  const filtered = rows.filter(r => {
    if (est !== 'Todos' && (r.estado || '').toUpperCase() !== est) return false;
    if (bus) {
      const txt = [r.folio, r.tramo, r.civ, r.tipo_pmt, r.creado_por_nombre, r.estado].join(' ').toLowerCase();
      if (!txt.includes(bus.toLowerCase())) return false;
    }
    return true;
  });

  const activos  = filtered.filter(r => (r.estado || '').toUpperCase() === 'ACTIVO').length;
  const vencidos = filtered.filter(r => (r.estado || '').toUpperCase() === 'VENCIDO').length;
  const total    = filtered.length;

  return (
    <div>
      <SectionBadge label="Seguimiento de PMTs" color="red" />
      <h3>Estado y Seguimiento de Planes de Manejo de Tráfico</h3>

      <div className="filter-form-wrap">
        <div className="filter-form-title">Filtros</div>
        <div className="filter-grid filter-grid-2" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Estado PMT</label>
            <select className="form-select" value={est} onChange={e => setEst(e.target.value)}>
              {ESTADOS_PMT.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Buscar</label>
            <input type="text" className="form-input" placeholder="Folio / tramo / tipo..."
              value={bus} onChange={e => setBus(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-filter" onClick={loadData}>Cargar PMTs</button>
      </div>

      {!loaded && !loading && <div className="info-wrap">Presiona <strong>Cargar PMTs</strong> para ver el seguimiento.</div>}
      {loading && <div className="loading-wrap">Cargando...</div>}

      {loaded && !loading && (
        <>
          <div className="col-grid col-4" style={{ marginBottom: '1rem' }}>
            <KpiCard label="Total PMTs" value={String(total)} />
            <KpiCard label="Activos" value={String(activos)} cardAccent="accent-green" accent="kpi-green" />
            <KpiCard label="Vencidos" value={String(vencidos)} cardAccent="accent-red" accent="kpi-danger" />
            <KpiCard label="Otros" value={String(total - activos - vencidos)} />
          </div>

          {filtered.length === 0
            ? <div className="info-wrap">No se encontraron PMTs.</div>
            : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio</th><th>Fecha</th><th>Tramo</th><th>CIV</th>
                      <th>Tipo</th><th>Estado</th><th>Vence</th><th>Inspector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const estUpper = (r.estado || '').toUpperCase();
                      const estColor = estUpper === 'ACTIVO' ? 'var(--accent-green)' : estUpper === 'VENCIDO' ? 'var(--accent-red)' : 'var(--text-muted)';
                      return (
                        <tr key={r.folio || i}>
                          <td><code style={{ fontSize: '0.8rem' }}>{r.folio}</code></td>
                          <td>{fmtDate(r.fecha || r.created_at)}</td>
                          <td>{r.tramo || '—'}</td>
                          <td>{r.civ   || '—'}</td>
                          <td>{r.tipo_pmt || r.tipo || '—'}</td>
                          <td><span style={{ color: estColor, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.78rem' }}>{r.estado || '—'}</span></td>
                          <td>{fmtDate(r.fecha_vencimiento)}</td>
                          <td>{r.creado_por_nombre || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}
    </div>
  );
}
