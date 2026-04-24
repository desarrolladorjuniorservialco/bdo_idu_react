import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';

const TZ_OFFSET = -5;

const COMPANY_COLORS = {
  'CONSORCIO INTERCONSERVACION': '#4194E8',
  'URBACON':                     '#D95134',
  'IDU':                         '#7DCF38',
};

function companyColor(empresa) {
  if (!empresa) return '#888888';
  const up = empresa.toUpperCase();
  for (const [k, v] of Object.entries(COMPANY_COLORS)) {
    if (up.includes(k)) return v;
  }
  return '#888888';
}

function avatarSvg(empresa) {
  const color = companyColor(empresa);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${color}"/><circle cx="20" cy="15" r="7" fill="white" opacity="0.92"/><ellipse cx="20" cy="35" rx="12" ry="9" fill="white" opacity="0.92"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function fmtTs(raw) {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    const offset = d.getTimezoneOffset() / 60;
    d.setHours(d.getHours() + TZ_OFFSET - (-offset));
    return d.toISOString().slice(0, 16).replace('T', ' ');
  } catch { return raw.slice(0, 16).replace('T', ' '); }
}

function subDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() - n); return r;
}

function fmtInputDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function Anotaciones({ perfil }) {
  const today = new Date();
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg]     = useState('');
  const [tramo, setTramo] = useState('');
  const [civ, setCiv]     = useState('');
  const [pk, setPk]       = useState('');
  const [filters, setFilters] = useState({
    fi: fmtInputDate(subDays(today, 30)),
    ff: fmtInputDate(today),
    usuario: '', buscar: '', tramo: '', civ: '',
  });
  const [applied, setApplied] = useState({
    fi: fmtInputDate(subDays(today, 30)),
    ff: fmtInputDate(today),
    usuario: '', buscar: '', tramo: '', civ: '',
  });
  const bottomRef = useRef(null);

  const loadData = useCallback(async () => {
    if (!perfil?.contrato_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('anotaciones_generales')
      .select('id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at')
      .eq('contrato_id', perfil.contrato_id)
      .order('created_at', { ascending: false })
      .limit(300);
    setRows((data || []).reverse());
    setLoading(false);
  }, [perfil]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rows]);

  const filtered = rows.filter(r => {
    const fecha = String(r.fecha || r.created_at || '').slice(0, 10);
    if (applied.fi && fecha < applied.fi) return false;
    if (applied.ff && fecha > applied.ff) return false;
    if (applied.usuario && !String(r.usuario_nombre || '').toLowerCase().includes(applied.usuario.toLowerCase())) return false;
    if (applied.buscar && !String(r.anotacion || '').toLowerCase().includes(applied.buscar.toLowerCase())) return false;
    if (applied.tramo && !String(r.tramo || '').toLowerCase().includes(applied.tramo.toLowerCase())) return false;
    if (applied.civ && !String(r.civ || '').toLowerCase().includes(applied.civ.toLowerCase())) return false;
    return true;
  });

  async function handleSend(e) {
    e.preventDefault();
    if (!msg.trim() || !perfil?.contrato_id) return;
    setSending(true);
    const now = new Date().toISOString().slice(0, 10);
    await supabase.from('anotaciones_generales').insert({
      contrato_id:     perfil.contrato_id,
      usuario_id:      perfil.id,
      fecha:           now,
      tramo:           tramo || null,
      civ:             civ   || null,
      pk:              pk    || null,
      anotacion:       msg.slice(0, 2000),
      usuario_nombre:  perfil.nombre,
      usuario_rol:     perfil.rol,
      usuario_empresa: perfil.empresa || '',
    });
    setMsg(''); setTramo(''); setCiv(''); setPk('');
    setSending(false);
    await loadData();
  }

  return (
    <div>
      <SectionBadge label="Anotaciones Generales" color="purple" />
      <h3>Bitácora General</h3>

      {/* Filtros */}
      <div className="filter-form-wrap">
        <div className="filter-form-title">Filtros</div>
        <div className="filter-grid filter-grid-4" style={{ marginBottom: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">Desde</label>
            <input type="date" className="form-input" value={filters.fi}
              onChange={e => setFilters(f => ({ ...f, fi: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-input" value={filters.ff}
              onChange={e => setFilters(f => ({ ...f, ff: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input type="text" className="form-input" placeholder="Nombre del autor"
              value={filters.usuario} onChange={e => setFilters(f => ({ ...f, usuario: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Buscar en anotación</label>
            <input type="text" className="form-input" placeholder="Texto libre"
              value={filters.buscar} onChange={e => setFilters(f => ({ ...f, buscar: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Tramo</label>
            <input type="text" className="form-input" placeholder="ID de tramo"
              value={filters.tramo} onChange={e => setFilters(f => ({ ...f, tramo: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">CIV</label>
            <input type="text" className="form-input" placeholder="Código CIV"
              value={filters.civ} onChange={e => setFilters(f => ({ ...f, civ: e.target.value }))} />
          </div>
        </div>
        <button className="btn btn-filter" onClick={() => setApplied({ ...filters })}>
          Aplicar filtros
        </button>
      </div>

      {/* Chat */}
      {loading ? (
        <div className="loading-wrap">Cargando anotaciones...</div>
      ) : (
        <div className="chat-container" style={{ maxHeight: '55vh', overflowY: 'auto', padding: '0.5rem' }}>
          {filtered.length === 0 && (
            <div className="info-wrap">No hay anotaciones para los filtros seleccionados.</div>
          )}
          {filtered.map(r => (
            <div className="chat-msg" key={r.id}>
              <img className="chat-avatar" src={avatarSvg(r.usuario_empresa)} alt="avatar" />
              <div className="chat-bubble">
                <div className="chat-bubble-header">
                  <span className="chat-bubble-name">{r.usuario_nombre || '—'}</span>
                  <span className="chat-bubble-meta">
                    {r.usuario_empresa} · {r.usuario_rol} · {fmtTs(r.created_at)}
                  </span>
                </div>
                <div className="chat-bubble-text">{r.anotacion}</div>
                {(r.tramo || r.civ || r.pk) && (
                  <div className="chat-pills">
                    {r.tramo && <span className="info-pill blue">Tramo: {r.tramo}</span>}
                    {r.civ   && <span className="info-pill orange">CIV: {r.civ}</span>}
                    {r.pk    && <span className="info-pill">PK: {r.pk}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Nueva anotación */}
      <form onSubmit={handleSend} style={{ marginTop: '1rem' }}>
        <div className="card">
          <div className="card-title">Nueva anotación</div>
          <div className="filter-grid filter-grid-3" style={{ marginBottom: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Tramo</label>
              <input type="text" className="form-input" placeholder="ID de tramo (opcional)"
                value={tramo} onChange={e => setTramo(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">CIV</label>
              <input type="text" className="form-input" placeholder="Código CIV (opcional)"
                value={civ} onChange={e => setCiv(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">PK</label>
              <input type="text" className="form-input" placeholder="PK (opcional)"
                value={pk} onChange={e => setPk(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Anotación</label>
            <textarea
              className="form-textarea"
              placeholder="Escribe una anotación..."
              maxLength={2000}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={4}
            />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {msg.length}/2000
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending || !msg.trim()}>
            {sending ? 'Enviando...' : 'Enviar anotación'}
          </button>
        </div>
      </form>
    </div>
  );
}
