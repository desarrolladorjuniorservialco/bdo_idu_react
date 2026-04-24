import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';

function fmtDate(v) {
  if (!v) return '—';
  try { return new Date(String(v).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(v).slice(0, 10); }
}
function fmtInput(d) { return d.toISOString().slice(0, 10); }
function subDays(d, n) { const r = new Date(d); r.setDate(r.getDate() - n); return r; }

export default function GenerarInforme({ perfil }) {
  const today = new Date();
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');
  const [fi,  setFi]  = useState(fmtInput(subDays(today, 30)));
  const [ff,  setFf]  = useState(fmtInput(today));
  const [incluir, setIncluir] = useState({
    estado_actual:   true,
    cantidades:      true,
    reporte_diario:  true,
    ambiental:       true,
    social:          false,
    pmt:             false,
    correspondencia: false,
  });

  useEffect(() => {
    if (!perfil?.contrato_id) return;
    supabase.from('contratos').select('*').eq('id', perfil.contrato_id).single()
      .then(({ data }) => { setContrato(data); setLoading(false); });
  }, [perfil]);

  async function handleGenerar() {
    setGenerating(true);
    setMsg('');
    // Recopila datos básicos del contrato y genera un informe simple en texto/HTML
    const secciones = Object.entries(incluir).filter(([, v]) => v).map(([k]) => k);

    // En producción aquí se llamaría a una función Edge de Supabase o una API
    // que genere el PDF con todos los datos del período seleccionado.
    // Por ahora generamos un HTML básico del informe.
    await new Promise(r => setTimeout(r, 1200));

    const titulo = contrato?.nombre || 'BDO IDU-1556-2025';
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe BDO - ${fmtDate(fi)} al ${fmtDate(ff)}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1C2129; }
    h1 { color: #002D57; border-bottom: 3px solid #6D8E2D; padding-bottom: 8px; }
    h2 { color: #002D57; margin-top: 24px; }
    .meta { background: #F3F5F7; border-radius: 8px; padding: 16px; margin: 16px 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .meta-label { font-size: 0.72rem; text-transform: uppercase; color: #8B949E; margin-bottom: 4px; }
    .meta-value { font-weight: 700; }
    .periodo { background: #002D57; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 16px; font-size: 0.85rem; }
    .secciones { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .seccion-tag { background: #e2e8d5; color: #2a3d11; padding: 4px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .footer { margin-top: 40px; border-top: 1px solid #ADB5BD; padding-top: 16px; font-size: 0.75rem; color: #8B949E; }
  </style>
</head>
<body>
  <h1>Bitácora Digital de Obra</h1>
  <h2>${titulo}</h2>
  <div class="periodo">Período: ${fmtDate(fi)} — ${fmtDate(ff)}</div>
  <div class="meta">
    <div><div class="meta-label">Contrato</div><div class="meta-value">${contrato?.id || '—'}</div></div>
    <div><div class="meta-label">Contratista</div><div class="meta-value">${contrato?.contratista || '—'}</div></div>
    <div><div class="meta-label">Generado por</div><div class="meta-value">${perfil.nombre}</div></div>
    <div><div class="meta-label">Rol</div><div class="meta-value">${perfil.rol}</div></div>
    <div><div class="meta-label">Fecha de generación</div><div class="meta-value">${fmtDate(today.toISOString())}</div></div>
  </div>
  <h2>Secciones incluidas</h2>
  <div class="secciones">
    ${secciones.map(s => `<span class="seccion-tag">${s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>`).join('')}
  </div>
  <p style="color:#5D6A7F; font-size:0.9rem; margin-top:24px;">
    Este informe fue generado automáticamente por el Sistema BDO · IDU-1556-2025.<br>
    Para un informe completo con tablas de datos, integrar con una función de generación de PDF en el servidor.
  </p>
  <div class="footer">
    BDO · IDU-1556-2025 · Sistema de Bitácora Digital de Obra · ${new Date().toISOString()}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Informe_BDO_${fi}_${ff}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(false);
    setMsg('Informe generado y descargado correctamente.');
    setTimeout(() => setMsg(''), 5000);
  }

  if (loading) return <div className="loading-wrap">Cargando...</div>;

  return (
    <div>
      <SectionBadge label="Generar Informe" color="teal" />
      <h3>Generación de Informe de Gestión</h3>

      {msg && <div className="success-wrap">{msg}</div>}

      <div className="card">
        <div className="card-title">Configuración del informe</div>
        <div className="filter-grid filter-grid-2" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Fecha desde</label>
            <input type="date" className="form-input" value={fi} onChange={e => setFi(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha hasta</label>
            <input type="date" className="form-input" value={ff} onChange={e => setFf(e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <div className="form-label" style={{ marginBottom: '0.5rem' }}>Secciones a incluir</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {Object.entries(incluir).map(([key, val]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={val}
                  onChange={e => setIncluir(prev => ({ ...prev, [key]: e.target.checked }))} />
                {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleGenerar} disabled={generating}>
          {generating ? 'Generando informe...' : '📄 Generar y descargar informe'}
        </button>
      </div>

      {contrato && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-title">Vista previa del encabezado</div>
          <div className="record-field-grid">
            <div><div className="record-field-label">Contrato</div><div className="record-field-value">{contrato.id}</div></div>
            <div><div className="record-field-label">Nombre</div><div className="record-field-value">{contrato.nombre}</div></div>
            <div><div className="record-field-label">Contratista</div><div className="record-field-value">{contrato.contratista || '—'}</div></div>
            <div><div className="record-field-label">Generado por</div><div className="record-field-value">{perfil.nombre} ({perfil.rol})</div></div>
            <div><div className="record-field-label">Período</div><div className="record-field-value">{fmtDate(fi)} – {fmtDate(ff)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
