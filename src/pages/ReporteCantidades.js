import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { APROBACION_CONFIG } from '../config/nav';
import SectionBadge from '../components/SectionBadge';
import Badge from '../components/Badge';

function fmtCOP(val) {
  const v = parseFloat(val);
  if (isNaN(v)) return '—';
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)} B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)} M`;
  return `$${v.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}

function subDays(d, n) { const r = new Date(d); r.setDate(r.getDate() - n); return r; }
function fmtInput(d) { return d.toISOString().slice(0, 10); }

const ESTADO_OPTS = ['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO'];

export default function ReporteCantidades({ perfil }) {
  const today = new Date();
  const cfg   = APROBACION_CONFIG[perfil.rol] || {};

  const [rows, setRows]   = useState([]);
  const [fotos, setFotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const [aprMsg, setAprMsg]   = useState('');

  const [fi,     setFi]     = useState(fmtInput(subDays(today, 30)));
  const [ff,     setFf]     = useState(fmtInput(today));
  const [estado, setEstado] = useState('Todos');
  const [buscar, setBuscar] = useState('');
  const [tramo,  setTramo]  = useState('');
  const [civ,    setCiv]    = useState('');
  const [item,   setItem]   = useState('');
  const [comp,   setComp]   = useState('');
  const [user,   setUser]   = useState('');

  const [expandido, setExpandido] = useState(null);
  const [obsPanel,  setObsPanel]  = useState({});

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    let q = supabase
      .from('registros_cantidades')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .gte('fecha_creacion', fi)
      .lte('fecha_creacion', ff + 'T23:59:59')
      .order('fecha_creacion', { ascending: false });
    if (estado !== 'Todos') q = q.eq('estado', estado);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil, fi, ff, estado]);

  const filtered = rows.filter(r => {
    const txt = [r.folio, r.civ, r.actividad, r.tramo, r.item_pago, r.componente, r.creado_por_nombre].join(' ').toLowerCase();
    if (buscar && !txt.includes(buscar.toLowerCase())) return false;
    if (tramo && !String(r.tramo || '').toLowerCase().includes(tramo.toLowerCase())) return false;
    if (civ   && !String(r.civ   || '').toLowerCase().includes(civ.toLowerCase())) return false;
    if (item  && !String(r.item_pago || '').toLowerCase().includes(item.toLowerCase())) return false;
    if (comp  && !String(r.componente || '').toLowerCase().includes(comp.toLowerCase())) return false;
    if (user  && !String(r.creado_por_nombre || '').toLowerCase().includes(user.toLowerCase())) return false;
    return true;
  });

  const total   = filtered.length;
  const apr     = filtered.filter(r => r.estado === 'APROBADO').length;
  const sumaCant= filtered.reduce((s, r) => s + (parseFloat(r.cantidad) || 0), 0);
  const valorEst= filtered.reduce((s, r) => s + (parseFloat(r.valor_estimado) || 0), 0);

  async function loadFotos(folio) {
    if (fotos[folio] !== undefined) return;
    const { data } = await supabase.from('rf_cantidades').select('*').eq('folio', folio);
    setFotos(prev => ({ ...prev, [folio]: data || [] }));
  }

  async function handleAprobacion(row, accion) {
    const campos = cfg.campos;
    if (!campos) return;
    const ahora = new Date().toISOString();
    const nuevoEstado = accion === 'aprobar' ? cfg.estadoApr : 'DEVUELTO';
    const obs = obsPanel[row.folio] || '';
    await supabase.from('registros_cantidades').update({
      estado:            nuevoEstado,
      [campos.campoEstado]: nuevoEstado,
      [campos.campoApr]:    true,
      [campos.campoFecha]:  ahora,
      [campos.campoObs]:    obs,
    }).eq('folio', row.folio);
    setAprMsg(`Registro ${row.folio} ${accion === 'aprobar' ? 'aprobado' : 'devuelto'} correctamente.`);
    setTimeout(() => setAprMsg(''), 4000);
    await loadData();
  }

  return (
    <div>
      <SectionBadge label="Reporte de Cantidades de Obra" color="blue" />
      <h3>Medición y Validación de Cantidades</h3>

      {/* Filtros */}
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
            <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
              {ESTADO_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Buscar</label>
            <input type="text" className="form-input" placeholder="Folio / CIV / actividad..."
              value={buscar} onChange={e => setBuscar(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tramo</label>
            <input type="text" className="form-input" value={tramo} onChange={e => setTramo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">CIV</label>
            <input type="text" className="form-input" value={civ} onChange={e => setCiv(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Ítem de pago</label>
            <input type="text" className="form-input" value={item} onChange={e => setItem(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Componente / Cap.</label>
            <input type="text" className="form-input" value={comp} onChange={e => setComp(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Inspector / Usuario</label>
            <input type="text" className="form-input" value={user} onChange={e => setUser(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-filter" onClick={loadData}>Aplicar filtros</button>
      </div>

      {!loaded && !loading && (
        <div className="info-wrap">Define los filtros y presiona <strong>Aplicar filtros</strong> para cargar.</div>
      )}

      {loading && <div className="loading-wrap">Cargando registros...</div>}

      {aprMsg && <div className="success-wrap">{aprMsg}</div>}

      {loaded && !loading && (
        <>
          {/* Indicadores acumulados */}
          <div className="acum-panel">
            <div className="acum-panel-title">Indicadores acumulados (filtro activo)</div>
            <div className="acum-item">
              <div className="acum-item-label">Total registros</div>
              <div className="acum-item-value">{total}</div>
            </div>
            <div className="acum-item">
              <div className="acum-item-label">Aprobados</div>
              <div className="acum-item-value" style={{ color: 'var(--accent-green)' }}>{apr}</div>
            </div>
            <div className="acum-item">
              <div className="acum-item-label">Suma cantidades</div>
              <div className="acum-item-value">{sumaCant.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="acum-item">
              <div className="acum-item-label">Valor estimado</div>
              <div className="acum-item-value">{fmtCOP(valorEst)}</div>
            </div>
          </div>

          {/* Exportar CSV */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => {
              if (!filtered.length) return;
              const cols = Object.keys(filtered[0]);
              const csv  = [cols.join(','), ...filtered.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
              a.download = 'cantidades.csv'; a.click();
            }}>Exportar CSV</button>
          </div>

          {/* Lista de registros */}
          {filtered.length === 0 ? (
            <div className="info-wrap">No se encontraron registros con los filtros aplicados.</div>
          ) : filtered.map(row => (
            <details key={row.folio}
              open={expandido === row.folio}
              onToggle={e => {
                if (e.target.open) { setExpandido(row.folio); loadFotos(row.folio); }
                else if (expandido === row.folio) setExpandido(null);
              }}
            >
              <summary>
                <Badge estado={row.estado} />
                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>{row.folio}</span>
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                  {row.actividad || row.descripcion || ''} · {fmtDate(row.fecha_creacion)}
                </span>
              </summary>
              <div className="details-body">
                <div className="record-field-grid">
                  {[
                    ['Folio', row.folio], ['Fecha', fmtDate(row.fecha_creacion)],
                    ['CIV', row.civ], ['Tramo', row.tramo], ['PK', row.pk],
                    ['Ítem de pago', row.item_pago], ['Componente', row.componente],
                    ['Actividad', row.actividad], ['Unidad', row.unidad],
                    ['Cantidad', row.cantidad], ['Precio unitario', fmtCOP(row.precio_unitario)],
                    ['Valor estimado', fmtCOP(row.valor_estimado)],
                    ['Inspector', row.creado_por_nombre], ['Estado', row.estado],
                  ].map(([label, val]) => val != null && String(val).trim() !== '' && String(val) !== 'null' ? (
                    <div key={label}>
                      <div className="record-field-label">{label}</div>
                      <div className="record-field-value">{String(val)}</div>
                    </div>
                  ) : null)}
                </div>

                {/* Fotos */}
                {fotos[row.folio] && fotos[row.folio].length > 0 && (
                  <div className="photo-grid">
                    {fotos[row.folio].map((f, i) => (
                      <div className="photo-thumb" key={i}>
                        <img src={f.url || f.foto_url} alt={`Foto ${i + 1}`}
                          onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Panel de aprobación */}
                {cfg.estadosAccion && cfg.estadosAccion.includes(row.estado) && (
                  <div className="approval-panel" style={{ marginTop: '1rem' }}>
                    <div className="approval-panel-title">Panel de Aprobación</div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Observaciones</label>
                      <textarea
                        className="form-textarea"
                        maxLength={500}
                        placeholder="Observaciones (opcional)"
                        value={obsPanel[row.folio] || ''}
                        onChange={e => setObsPanel(prev => ({ ...prev, [row.folio]: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-approve" onClick={() => handleAprobacion(row, 'aprobar')}>
                        ✓ Aprobar
                      </button>
                      <button className="btn btn-return" onClick={() => handleAprobacion(row, 'devolver')}>
                        ✗ Devolver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </details>
          ))}
        </>
      )}
    </div>
  );
}
