import React, { lazy, Suspense, useState, useTransition, useEffect } from 'react';
import Sidebar from './Sidebar';
import { NAV_ACCESS, PAGE_PATH, PATH_PAGE } from '../config/nav';
import { useAuth } from '../contexts/AuthContext';

const PAGE_COMPONENTS = {
  'Estado Actual':              lazy(() => import('../pages/EstadoActual')),
  'Mapa Ejecución':             lazy(() => import('../pages/MapaEjecucion')),
  'Seguimiento Presupuesto':    lazy(() => import('../pages/SeguimientoPresupuesto')),
  'Correspondencia':            lazy(() => import('../pages/Correspondencia')),
  'Anotaciones':                lazy(() => import('../pages/Anotaciones')),
  'Anotaciones Diario':         lazy(() => import('../pages/AnotacionesDiario')),
  'Reporte Cantidades':         lazy(() => import('../pages/ReporteCantidades')),
  'Componente Ambiental - SST': lazy(() => import('../pages/ComponenteAmbiental')),
  'Componente Social':          lazy(() => import('../pages/ComponenteSocial')),
  'Componente PMT':             lazy(() => import('../pages/ComponentePMT')),
  'Seguimiento PMTs':           lazy(() => import('../pages/SeguimientoPMTs')),
  'Generar Informe':            lazy(() => import('../pages/GenerarInforme')),
};

function getPageFromHash() {
  const hash = window.location.hash;
  const path = hash.startsWith('#') ? hash.slice(1) : '';
  return PATH_PAGE[path] || 'Estado Actual';
}

export default function Layout() {
  const { perfil } = useAuth();
  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const path = PAGE_PATH[currentPage] || '/estado-actual';
    window.history.pushState(null, '', `#${path}`);
  }, [currentPage]);

  useEffect(() => {
    function onPopState() {
      setCurrentPage(getPageFromHash());
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function handlePageChange(page) {
    if (!(NAV_ACCESS[page] || []).includes(perfil.rol)) return;
    startTransition(() => setCurrentPage(page));
  }

  const allowed = (NAV_ACCESS[currentPage] || []).includes(perfil.rol);
  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="main-content">
        {!allowed ? (
          <div className="error-wrap">No tienes permiso para acceder a esta sección.</div>
        ) : (
          <Suspense fallback={<div className="loading-wrap"><span>Cargando...</span></div>}>
            {PageComponent && <PageComponent />}
          </Suspense>
        )}
      </main>
    </div>
  );
}
