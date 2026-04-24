import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROL_LABELS, NAV_ACCESS, NAV_CATEGORIES } from '../config/nav';
import { supabase } from '../lib/supabase';

function StatChips({ contratoId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!contratoId) return;
    supabase
      .from('registros_cantidades')
      .select('estado')
      .eq('contrato_id', contratoId)
      .then(({ data }) => {
        if (!data) return;
        const total = data.length;
        const apr   = data.filter(r => r.estado === 'APROBADO').length;
        const rev   = data.filter(r => r.estado === 'REVISADO').length;
        const dev   = data.filter(r => r.estado === 'DEVUELTO').length;
        setStats({ total, apr, rev, dev });
      });
  }, [contratoId]);

  if (!stats) return null;

  return (
    <div className="stat-row">
      <span className="stat-chip" style={{ background: 'rgba(109,109,110,0.3)', color: '#6d6d6e' }}>
        {stats.total} total
      </span>
      <span className="stat-chip" style={{ background: '#0d2818', color: '#3fb950' }}>
        {stats.apr} apr.
      </span>
      <span className="stat-chip" style={{ background: '#0d3050', color: '#58a6ff' }}>
        {stats.rev} rev.
      </span>
      <span className="stat-chip" style={{ background: '#3d1010', color: '#f85149' }}>
        {stats.dev} dev.
      </span>
    </div>
  );
}

export default function Sidebar({ currentPage, onPageChange }) {
  const { perfil, logout } = useAuth();
  if (!perfil) return null;

  const rol = perfil.rol;

  const opciones = [];
  for (const cat of NAV_CATEGORIES) {
    for (const page of cat.pages) {
      if ((NAV_ACCESS[page] || []).includes(rol) && !opciones.includes(page)) {
        opciones.push(page);
      }
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-user-header">
        <div className="sidebar-rol-label">{ROL_LABELS[rol] || rol}</div>
        <div className="sidebar-nombre">{perfil.nombre}</div>
        {perfil.empresa && <div className="sidebar-empresa">{perfil.empresa}</div>}
      </div>

      <StatChips contratoId={perfil.contrato_id} />

      {NAV_CATEGORIES.map(cat => {
        const accesibles = cat.pages.filter(p => (NAV_ACCESS[p] || []).includes(rol));
        if (!accesibles.length) return null;
        return (
          <React.Fragment key={cat.label}>
            <div className={cat.highlight ? 'nav-cat-hi' : 'nav-cat'}>{cat.label}</div>
            {accesibles.map(page => (
              currentPage === page
                ? <div key={page} className="nav-item-active">{page}</div>
                : (
                  <button
                    key={page}
                    className="nav-item-btn"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                )
            ))}
          </React.Fragment>
        );
      })}

      <hr className="sidebar-divider" style={{ marginTop: '0.75rem' }} />
      <button className="sidebar-logout-btn" onClick={logout}>Cerrar sesión</button>
    </aside>
  );
}
