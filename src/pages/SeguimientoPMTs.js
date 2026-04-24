import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}

const ESTADOS_PMT = ['Todos', 'ACTIVO', 'VENCIDO'];

function computeEstado(r) {
  if (!r.fin_vigencia) return 'ACTIVO';
  const hoy = new Date().toISOString().slice(0, 10);
  return r.fin_vigencia >= hoy ? 'ACTIVO' : 'VENCIDO';
}

export default function SeguimientoPMTs({ perfil }) {
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const [bus,  setBus]  = useState('');
  const [est,  setEst]  = useState('Todos');

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('formulario_pmt')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .order('fecha_creacion', { ascending: false });
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil]);

  const filtered = rows.filter(r => {
    const estadoCalc = computeEstado(r);
    if (est !== 'Todos' && estadoCalc !== est) return false;
    if (bus) {
      const txt = [r.folio, r.civ, r.descripcion, r.usuario].join(' ').toLowerCase();
      if (!txt.includes(bus.toLowerCase())) return false;
    }
    return true;
  });

  const activos  = filtered.filter(r => computeEstado(r) === 'ACTIVO').length;
  const vencidos = filtered.filter(r => computeEstado(r) === 'VENCIDO').length;
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
            <input type="text" className="form-input" placeholder="Folio / CIV / descripción..."
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
            <KpiCard label="Sin vigencia" value={String(total - activos - vencidos)} />
          </div>

          {filtered.length === 0
            ? <div className="info-wrap">No se encontraron PMTs.</div>
            : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio</th><th>Inicio vigencia</th><th>CIV</th>
                      <th>Descripción</th><th>Estado</th><th>Vence</th><th>Inspector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const estadoCalc = computeEstado(r);
                      const estColor = estadoCalc === 'ACTIVO' ? 'var(--accent-green)' : 'var(--accent-red)';
                      return (
                        <tr key={r.folio || i}>
                          <td><code style={{ fontSize: '0.8rem' }}>{r.folio}</code></td>
                          <td>{fmtDate(r.inicio_vigencia || r.fecha_creacion)}</td>
                          <td>{r.civ || '—'}</td>
                          <td>{r.descripcion || '—'}</td>
                          <td><span style={{ color: estColor, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.78rem' }}>{estadoCalc}</span></td>
                          <td>{fmtDate(r.fin_vigencia)}</td>
                          <td>{r.usuario || '—'}</td>
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
