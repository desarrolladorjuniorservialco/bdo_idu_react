import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SectionBadge from '../components/SectionBadge';
import KpiCard from '../components/KpiCard';

export default function MapaEjecucion({ perfil }) {
  const [tramos, setTramos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bus, setBus]   = useState('');

  useEffect(() => {
    if (!perfil?.contrato_id) return;
    supabase.from('tramos_bd').select('*').eq('contrato_id', perfil.contrato_id).then(({ data }) => {
      setTramos(data || []);
      setLoading(false);
    });
  }, [perfil]);

  const filtered = tramos.filter(r => {
    if (!bus) return true;
    return [r.id_tramo, r.tramo_descripcion, r.localidad].join(' ').toLowerCase().includes(bus.toLowerCase());
  });

  const completados = filtered.filter(r => {
    const p = parseFloat(r.ejecutado) / (parseFloat(r.meta_fisica) || 1) * 100;
    return p >= 100;
  }).length;
  const enProgreso = filtered.filter(r => {
    const p = parseFloat(r.ejecutado) / (parseFloat(r.meta_fisica) || 1) * 100;
    return p > 0 && p < 100;
  }).length;

  function getColor(r) {
    const p = parseFloat(r.ejecutado) / (parseFloat(r.meta_fisica) || 1) * 100;
    if (p >= 100) return 'var(--exec-completado)';
    if (p > 0)    return 'var(--exec-progreso)';
    return 'var(--exec-planeacion)';
  }

  if (loading) return <div className="loading-wrap">Cargando tramos...</div>;

  return (
    <div>
      <SectionBadge label="Mapa de Ejecución" color="teal" />
      <h3>Avance por Tramo de Obra</h3>

      <div className="col-grid col-4" style={{ marginBottom: '1rem' }}>
        <KpiCard label="Total tramos" value={String(filtered.length)} />
        <KpiCard label="Completados"  value={String(completados)}  cardAccent="accent-green" accent="kpi-green" />
        <KpiCard label="En progreso"  value={String(enProgreso)}   cardAccent="accent-orange" accent="kpi-warn" />
        <KpiCard label="Sin iniciar"  value={String(filtered.length - completados - enProgreso)} />
      </div>

      <div className="map-placeholder" style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>🗺️</span>
        <span>Visualización geográfica de tramos</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Integrar con Leaflet o Mapbox para mapa interactivo
        </span>
      </div>

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <input type="text" className="form-input"
          placeholder="Buscar tramo por ID, descripción, CIV, localidad..."
          value={bus} onChange={e => setBus(e.target.value)} />
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>ID Tramo</th><th>Descripción</th><th>Localidad</th><th>Infraestructura</th><th>Meta física</th><th>Ejecutado</th><th>Avance</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="data-table-empty">No hay tramos registrados.</td></tr>
            ) : filtered.map((r, i) => {
              const meta = parseFloat(r.meta_fisica) || 0;
              const ejec = parseFloat(r.ejecutado) || 0;
              const p    = meta > 0 ? Math.min(100, (ejec / meta) * 100) : 0;
              return (
                <tr key={r.id_tramo || i}>
                  <td><code style={{ fontSize: '0.78rem' }}>{r.id_tramo}</code></td>
                  <td>{r.tramo_descripcion || '—'}</td>
                  <td>{r.localidad        || '—'}</td>
                  <td>{r.infraestructura  || '—'}</td>
                  <td>{meta.toLocaleString('es-CO', { maximumFractionDigits: 1 })}</td>
                  <td>{ejec.toLocaleString('es-CO', { maximumFractionDigits: 1 })}</td>
                  <td style={{ minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div className="presup-bar-wrap" style={{ flex: 1 }}>
                        <div className="presup-bar-fill" style={{ width: `${p.toFixed(1)}%`, background: getColor(r) }} />
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
    </div>
  );
}
