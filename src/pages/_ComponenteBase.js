import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { APROBACION_CONFIG } from '../config/nav';
import SectionBadge from '../components/SectionBadge';
import Badge from '../components/Badge';
import KpiCard from '../components/KpiCard';

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}
function subDays(d, n) { const r = new Date(d); r.setDate(r.getDate() - n); return r; }
function fmtInput(d) { return d.toISOString().slice(0, 10); }

export default function ComponenteBase({ perfil, titulo, color, componente }) {
  const today = new Date();
  const cfg   = APROBACION_CONFIG[perfil.rol] || {};

  const [rows, setRows]   = useState([]);
  const [fotos, setFotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const [msg, setMsg]         = useState('');

  const [fi,  setFi]  = useState(fmtInput(subDays(today, 30)));
  const [ff,  setFf]  = useState(fmtInput(today));
  const [est, setEst] = useState('Todos');
  const [bus, setBus] = useState('');
  const [obs, setObs] = useState({});

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    let q = supabase
      .from('registros_componentes')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .eq('componente', componente)
      .gte('fecha_creacion', fi)
      .lte('fecha_creacion', ff + 'T23:59:59')
      .order('fecha_creacion', { ascending: false });
    if (est !== 'Todos') q = q.eq('estado', est);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil, fi, ff, est, componente]);

  const filtered = rows.filter(r => {
    if (!bus) return true;
    const txt = [r.folio, r.tramo, r.civ, r.observaciones, r.usuario_qfield].join(' ').toLowerCase();
    return txt.includes(bus.toLowerCase());
  });

  async function loadFotos(folio) {
    if (fotos[folio] !== undefined) return;
    const { data } = await supabase.from('rf_componentes').select('*').eq('folio', folio);
    setFotos(prev => ({ ...prev, [folio]: data || [] }));
  }

  async function handleAprobacion(row, accion) {
    const campos = cfg.campos;
    if (!campos) return;
    const nuevoEstado = accion === 'aprobar' ? cfg.estadoApr : 'DEVUELTO';
    await supabase.from('registros_componentes').update({
      estado:              nuevoEstado,
      [campos.campoEstado]: nuevoEstado,
      [campos.campoApr]:    perfil.id,
      [campos.campoFecha]:  new Date().toISOString(),
      [campos.campoObs]:    obs[row.folio] || '',
    }).eq('folio', row.folio);
    setMsg(`Registro ${row.folio} ${accion === 'aprobar' ? 'aprobado' : 'devuelto'}.`);
    setTimeout(() => setMsg(''), 4000);
    await loadData();
  }

  const total = filtered.length;
  const apr   = filtered.filter(r => r.estado === 'APROBADO').length;

  return (
    <div>
      <SectionBadge label={titulo} color={color} />
      <h3>{titulo}</h3>

      <div className="filter-form-wrap">
        <div className="filter-form-title">Filtros</div>
        <div className="filter-grid filter-grid-4" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Desde</label>
            <input type="date" className="form-input" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-input" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={est} onChange={e => setEst(e.target.value)}>
              {['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Buscar</label>
            <input type="text" className="form-input" placeholder="Folio / tramo / descripción..."
              value={bus} onChange={e => setBus(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-filter" onClick={loadData}>Aplicar filtros</button>
      </div>

      {!loaded && !loading && <div className="info-wrap">Aplica filtros para cargar los registros.</div>}
      {loading && <div className="loading-wrap">Cargando...</div>}
      {msg && <div className="success-wrap">{msg}</div>}

      {loaded && !loading && (
        <>
          <div className="col-grid col-4" style={{ marginBottom: '1rem' }}>
            <KpiCard label="Total registros" value={String(total)} />
            <KpiCard label="Aprobados" value={String(apr)} cardAccent="accent-green" accent="kpi-green" />
            <KpiCard label="Pendientes" value={String(total - apr)} cardAccent="accent-orange" accent="kpi-warn" />
          </div>

          {filtered.length === 0
            ? <div className="info-wrap">No se encontraron registros.</div>
            : filtered.map(row => (
              <details key={row.folio}
                onToggle={e => { if (e.target.open) loadFotos(row.folio); }}
              >
                <summary>
                  <Badge estado={row.estado} />
                  <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{row.folio}</span>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                    {fmtDate(row.fecha_creacion)} · {row.usuario_qfield || ''}
                  </span>
                </summary>
                <div className="details-body">
                  <div className="record-field-grid">
                    {[
                      ['Folio', row.folio], ['Fecha', fmtDate(row.fecha_creacion)],
                      ['Tramo', row.tramo], ['CIV', row.civ],
                      ['Observaciones', row.observaciones], ['Inspector', row.usuario_qfield],
                      ['Estado', row.estado], ['Componente', row.componente],
                      ['Capítulo', row.capitulo_num], ['Ítem de pago', row.item_pago],
                      ['Cantidad', row.cantidad], ['Unidad', row.unidad],
                    ].filter(([, v]) => v != null && String(v).trim() !== '' && String(v) !== 'null')
                     .map(([label, val]) => (
                      <div key={label}>
                        <div className="record-field-label">{label}</div>
                        <div className="record-field-value">{String(val)}</div>
                      </div>
                    ))}
                  </div>

                  {fotos[row.folio]?.length > 0 && (
                    <div className="photo-grid">
                      {fotos[row.folio].map((f, i) => (
                        <div className="photo-thumb" key={i}>
                          <img src={f.foto_url} alt={`Foto ${i + 1}`}
                            onError={e => { e.target.style.display = 'none'; }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {cfg.estadosAccion?.includes(row.estado) && (
                    <div className="approval-panel" style={{ marginTop: '1rem' }}>
                      <div className="approval-panel-title">Panel de Aprobación</div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label">Observaciones</label>
                        <textarea className="form-textarea" maxLength={500} rows={3}
                          value={obs[row.folio] || ''}
                          onChange={e => setObs(p => ({ ...p, [row.folio]: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-approve" onClick={() => handleAprobacion(row, 'aprobar')}>✓ Aprobar</button>
                        <button className="btn btn-return"  onClick={() => handleAprobacion(row, 'devolver')}>✗ Devolver</button>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            ))
          }
        </>
      )}
    </div>
  );
}
