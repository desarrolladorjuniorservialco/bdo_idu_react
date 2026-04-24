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

const ESTADO_OPTS = ['Todos', 'PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA'];

export default function Correspondencia({ perfil }) {
  const today = new Date();
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded,  setLoaded]  = useState(false);
  const [fi,      setFi]   = useState(fmtInput(subDays(today, 90)));
  const [ff,      setFf]   = useState(fmtInput(today));
  const [estado,  setEstado] = useState('Todos');
  const [bus,     setBus]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [msg,     setMsg]  = useState('');
  const [form, setForm] = useState({
    consecutivo: '', fecha: fmtInput(today), asunto: '', emisor: '', receptor: '',
  });

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    let q = supabase
      .from('correspondencia')
      .select('*')
      .eq('contrato_id', perfil.contrato_id)
      .gte('fecha', fi)
      .lte('fecha', ff)
      .order('fecha', { ascending: false });
    if (estado !== 'Todos') q = q.eq('estado', estado);
    const { data } = await q;
    setRows(data || []);
    setLoading(false);
    setLoaded(true);
  }, [perfil, fi, ff, estado]);

  const filtered = rows.filter(r => {
    if (!bus) return true;
    const txt = [r.consecutivo, r.asunto, r.emisor, r.receptor].join(' ').toLowerCase();
    return txt.includes(bus.toLowerCase());
  });

  async function handleSave(e) {
    e.preventDefault();
    if (!form.consecutivo || !form.fecha) return;
    await supabase.from('correspondencia').insert({ ...form, contrato_id: perfil.contrato_id });
    setMsg('Correspondencia registrada correctamente.');
    setTimeout(() => setMsg(''), 4000);
    setForm({ consecutivo: '', fecha: fmtInput(today), asunto: '', emisor: '', receptor: '' });
    setShowForm(false);
    await loadData();
  }

  return (
    <div>
      <SectionBadge label="Correspondencia" color="teal" />
      <h3>Registro de Correspondencia</h3>

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
            <input type="text" className="form-input" placeholder="Consecutivo / asunto / emisor..."
              value={bus} onChange={e => setBus(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-filter" onClick={loadData}>Aplicar filtros</button>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancelar' : '+ Nueva correspondencia'}
          </button>
        </div>
      </div>

      {msg && <div className="success-wrap">{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-title">Registrar correspondencia</div>
          <form onSubmit={handleSave}>
            <div className="filter-grid filter-grid-3" style={{ marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Consecutivo *</label>
                <input type="text" className="form-input" required value={form.consecutivo}
                  onChange={e => setForm(f => ({ ...f, consecutivo: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input type="date" className="form-input" required value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Asunto *</label>
                <input type="text" className="form-input" required value={form.asunto}
                  onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Emisor *</label>
                <input type="text" className="form-input" required value={form.emisor}
                  onChange={e => setForm(f => ({ ...f, emisor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Receptor *</label>
                <input type="text" className="form-input" required value={form.receptor}
                  onChange={e => setForm(f => ({ ...f, receptor: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </form>
        </div>
      )}

      {!loaded && !loading && <div className="info-wrap">Aplica filtros para ver la correspondencia.</div>}
      {loading && <div className="loading-wrap">Cargando...</div>}

      {loaded && !loading && (
        <>
          <div className="col-grid col-3" style={{ marginBottom: '1rem' }}>
            <KpiCard label="Total documentos" value={String(filtered.length)} />
            <KpiCard label="Pendientes"  value={String(filtered.filter(r => r.estado === 'PENDIENTE').length)}  cardAccent="accent-orange" />
            <KpiCard label="Respondidos" value={String(filtered.filter(r => r.estado === 'RESPONDIDO').length)} cardAccent="accent-green" />
          </div>

          {filtered.length === 0
            ? <div className="info-wrap">No se encontraron documentos.</div>
            : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Consecutivo</th><th>Fecha</th><th>Asunto</th><th>Emisor</th><th>Receptor</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id || i}>
                        <td><code style={{ fontSize: '0.8rem' }}>{r.consecutivo}</code></td>
                        <td>{fmtDate(r.fecha)}</td>
                        <td>{r.asunto || '—'}</td>
                        <td>{r.emisor || '—'}</td>
                        <td>{r.receptor || '—'}</td>
                        <td>
                          <span className={`badge ${r.estado === 'RESPONDIDO' ? 'badge-aprobado' : r.estado === 'NO APLICA RESPUESTA' ? 'badge-revisado' : 'badge-borrador'}`}>
                            {r.estado || 'PENDIENTE'}
                          </span>
                        </td>
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
