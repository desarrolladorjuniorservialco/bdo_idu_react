import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}
function subDays(d, n) { const r = new Date(d); r.setDate(r.getDate() - n); return r; }
function fmtInput(d) { return d.toISOString().slice(0, 10); }

export default function ComponentePMT({ perfil }) {
  const today = new Date();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const [fi,  setFi]  = useState(fmtInput(subDays(today, 90)));
  const [ff,  setFf]  = useState(fmtInput(today));
  const [bus, setBus] = useState('');

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('formulario_pmt')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .order('created_at', { ascending: false });
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil]);

  const filtered = rows.filter(r => {
    const fecha = String(r.fecha || r.created_at || '').slice(0, 10);
    if (fi && fecha < fi) return false;
    if (ff && fecha > ff) return false;
    if (bus) {
      const txt = [r.folio, r.tramo, r.civ, r.tipo_pmt, r.creado_por_nombre].join(' ').toLowerCase();
      if (!txt.includes(bus.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <SectionBadge label="Componente PMT" color="purple" />
      <h3>Formularios de Plan de Manejo de Tráfico</h3>

      <div className="filter-form-wrap">
        <div className="filter-form-title">Filtros</div>
        <div className="filter-grid filter-grid-3" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Desde</label>
            <input type="date" className="form-input" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-input" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Buscar</label>
            <input type="text" className="form-input" placeholder="Folio / tramo / tipo PMT..."
              value={bus} onChange={e => setBus(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-filter" onClick={loadData}>Aplicar filtros</button>
      </div>

      {!loaded && !loading && <div className="info-wrap">Aplica filtros para cargar los registros.</div>}
      {loading && <div className="loading-wrap">Cargando PMTs...</div>}

      {loaded && !loading && (
        <>
          <div className="col-grid col-3" style={{ marginBottom: '1rem' }}>
            <KpiCard label="Total PMTs" value={String(filtered.length)} />
          </div>

          {filtered.length === 0
            ? <div className="info-wrap">No se encontraron registros.</div>
            : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Folio</th><th>Fecha</th><th>Tramo</th><th>CIV</th>
                      <th>Tipo PMT</th><th>Inspector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.folio || i}>
                        <td><code style={{ fontSize: '0.8rem' }}>{r.folio}</code></td>
                        <td>{fmtDate(r.fecha || r.created_at)}</td>
                        <td>{r.tramo || '—'}</td>
                        <td>{r.civ   || '—'}</td>
                        <td>{r.tipo_pmt || r.tipo || '—'}</td>
                        <td>{r.creado_por_nombre || '—'}</td>
                      </tr>
                    ))}
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
