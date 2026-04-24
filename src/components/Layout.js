import React, { useState, lazy, Suspense } from 'react';
import Sidebar from './Sidebar';
import { NAV_ACCESS } from '../config/nav';
import { useAuth } from '../contexts/AuthContext';

const EstadoActual         = lazy(() => import('../pages/EstadoActual'));
const Anotaciones          = lazy(() => import('../pages/Anotaciones'));
const AnotacionesDiario    = lazy(() => import('../pages/AnotacionesDiario'));
const GenerarInforme       = lazy(() => import('../pages/GenerarInforme'));
const MapaEjecucion        = lazy(() => import('../pages/MapaEjecucion'));
const SeguimientoPresupuesto = lazy(() => import('../pages/SeguimientoPresupuesto'));
const Correspondencia      = lazy(() => import('../pages/Correspondencia'));
const ReporteCantidades    = lazy(() => import('../pages/ReporteCantidades'));
const ComponenteAmbiental  = lazy(() => import('../pages/ComponenteAmbiental'));
const ComponenteSocial     = lazy(() => import('../pages/ComponenteSocial'));
const ComponentePMT        = lazy(() => import('../pages/ComponentePMT'));
const SeguimientoPMTs      = lazy(() => import('../pages/SeguimientoPMTs'));

const PAGE_COMPONENTS = {
  'Estado Actual':              EstadoActual,
  'Anotaciones':                Anotaciones,
  'Anotaciones Diario':         AnotacionesDiario,
  'Generar Informe':            GenerarInforme,
  'Mapa Ejecución':             MapaEjecucion,
  'Seguimiento Presupuesto':    SeguimientoPresupuesto,
  'Correspondencia':            Correspondencia,
  'Reporte Cantidades':         ReporteCantidades,
  'Componente Ambiental - SST': ComponenteAmbiental,
  'Componente Social':          ComponenteSocial,
  'Componente PMT':             ComponentePMT,
  'Seguimiento PMTs':           SeguimientoPMTs,
};

function PageLoader() {
  return (
    <div className="loading-wrap">
      <span>Cargando...</span>
    </div>
  );
}

export default function Layout() {
  const { perfil } = useAuth();
  const [currentPage, setCurrentPage] = useState('Estado Actual');

  function handlePageChange(page) {
    const allowed = NAV_ACCESS[page] || [];
    if (!allowed.includes(perfil.rol)) return;
    setCurrentPage(page);
  }

  const PageComponent = PAGE_COMPONENTS[currentPage];
  const allowed = (NAV_ACCESS[currentPage] || []).includes(perfil.rol);

  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <main className="main-content">
        {!allowed ? (
          <div className="error-wrap">No tienes permiso para acceder a esta sección.</div>
        ) : PageComponent ? (
          <Suspense fallback={<PageLoader />}>
            <PageComponent perfil={perfil} />
          </Suspense>
        ) : (
          <div className="error-wrap">Página no disponible.</div>
        )}
      </main>
    </div>
  );
}
