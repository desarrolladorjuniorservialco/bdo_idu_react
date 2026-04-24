import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';

function fmtCOP(val) {
  const v = parseFloat(val);
  if (isNaN(v)) return '—';
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)} B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)} M`;
  return `$${v.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

function pct(ejecutado, presupuesto) {
  const e = parseFloat(ejecutado) || 0;
  const p = parseFloat(presupuesto) || 0;
  return p > 0 ? Math.min(100, (e / p) * 100) : 0;
}

export default function SeguimientoPresupuesto({ perfil }) {
  const [items, setItems]   = useState([]);
  const [tramos, setTramos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('presupuesto');
  const [bus, setBus]       = useState('');

  useEffect(() => {
    if (!perfil?.contrato_id) return;
    const id = perfil.contrato_id;
    Promise.all([
      supabase.from('presupuesto_bd').select('*').eq('contrato_id', id),
      supabase.from('tramos_bd').select('*').eq('contrato_id', id),
    ]).then(([p, t]) => {
      setItems(p.data || []);
      setTramos(t.data || []);
      setLoading(false);
    });
  }, [perfil]);

  const filteredItems = items.filter(r => {
    if (!bus) return true;
    return [r.codigo_idu, r.descripcion, r.capitulo, r.tipo_actividad].join(' ').toLowerCase().includes(bus.toLowerCase());
  });

  const totalPresup = items.reduce((s, r) => s + (parseFloat(r.valor_presupuesto) || 0), 0);
  const totalEjec   = items.reduce((s, r) => s + (parseFloat(r.valor_ejecutado)   || 0), 0);
  const pctEjec     = totalPresup > 0 ? (totalEjec / totalPresup) * 100 : 0;

  if (loading) return <div className="loading-wrap">Cargando presupuesto...</div>;

  return (
    <div>
      <SectionBadge label="Seguimiento Presupuesto" color="orange" />
      <h3>Ejecución Presupuestal</h3>

      <div className="col-grid col-4" style={{ marginBottom: '1rem' }}>
        <KpiCard label="Presupuesto Total"  value={fmtCOP(totalPresup)} cardAccent="accent-blue" />
        <KpiCard label="Ejecutado"          value={fmtCOP(totalEjec)}   cardAccent="accent-green" accent="kpi-green" />
        <KpiCard label="Saldo"              value={fmtCOP(totalPresup - totalEjec)} cardAccent="accent-orange" accent="kpi-warn" />
        <KpiCard label="% Ejecución"        value={`${pctEjec.toFixed(1)}%`} cardAccent={pctEjec > 85 ? 'accent-red' : 'accent-green'} accent={pctEjec > 85 ? 'kpi-danger' : 'kpi-green'} />
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button className={`tab-btn${tab === 'presupuesto' ? ' active' : ''}`} onClick={() => setTab('presupuesto')}>Ítems presupuestales</button>
        <button className={`tab-btn${tab === 'tramos' ? ' active' : ''}`}      onClick={() => setTab('tramos')}>Tramos de obra</button>
      </div>

      {tab === 'presupuesto' && (
        <>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <input type="text" className="form-input" placeholder="Buscar por código, descripción, capítulo..."
              value={bus} onChange={e => setBus(e.target.value)} />
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Código</th><th>Descripción</th><th>Capítulo</th><th>Unidad</th><th>Cant.</th><th>Presupuesto</th><th>Ejecutado</th><th>%</th></tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr><td colSpan={8} className="data-table-empty">No se encontraron ítems.</td></tr>
                ) : filteredItems.map((r, i) => {
                  const p = pct(r.valor_ejecutado, r.valor_presupuesto || r.cantidad_ppto);
                  const barColor = p > 100 ? 'danger' : p > 80 ? 'warn' : '';
                  return (
                    <tr key={r.id || i}>
                      <td><code style={{ fontSize: '0.78rem' }}>{r.codigo_idu}</code></td>
                      <td>{r.descripcion}</td>
                      <td>{r.capitulo || '—'}</td>
                      <td>{r.unidad || '—'}</td>
                      <td>{r.cantidad_ppto || '—'}</td>
                      <td>{fmtCOP(r.valor_presupuesto)}</td>
                      <td>{fmtCOP(r.valor_ejecutado)}</td>
                      <td style={{ minWidth: 90 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div className="presup-bar-wrap" style={{ flex: 1 }}>
                            <div className={`presup-bar-fill${barColor ? ` ${barColor}` : ''}`}
                              style={{ width: `${Math.min(100, p).toFixed(1)}%` }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'tramos' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>ID Tramo</th><th>Descripción</th><th>Localidad</th><th>Meta física</th><th>Ejecutado</th><th>%</th></tr>
            </thead>
            <tbody>
              {tramos.length === 0 ? (
                <tr><td colSpan={6} className="data-table-empty">No hay tramos registrados.</td></tr>
              ) : tramos.map((r, i) => {
                const p = pct(r.ejecutado, r.meta_fisica);
                return (
                  <tr key={r.id_tramo || i}>
                    <td><code style={{ fontSize: '0.78rem' }}>{r.id_tramo}</code></td>
                    <td>{r.tramo_descripcion || '—'}</td>
                    <td>{r.localidad || '—'}</td>
                    <td>{r.meta_fisica ?? '—'}</td>
                    <td>{r.ejecutado ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div className="presup-bar-wrap" style={{ flex: 1 }}>
                          <div className="presup-bar-fill" style={{ width: `${Math.min(100, p).toFixed(1)}%` }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
