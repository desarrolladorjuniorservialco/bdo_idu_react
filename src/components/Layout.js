import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { NAV_ACCESS } from '../config/nav';
import { useAuth } from '../contexts/AuthContext';

import EstadoActual         from '../pages/EstadoActual';
import Anotaciones          from '../pages/Anotaciones';
import AnotacionesDiario    from '../pages/AnotacionesDiario';
import GenerarInforme       from '../pages/GenerarInforme';
import MapaEjecucion        from '../pages/MapaEjecucion';
import SeguimientoPresupuesto from '../pages/SeguimientoPresupuesto';
import Correspondencia      from '../pages/Correspondencia';
import ReporteCantidades    from '../pages/ReporteCantidades';
import ComponenteAmbiental  from '../pages/ComponenteAmbiental';
import ComponenteSocial     from '../pages/ComponenteSocial';
import ComponentePMT        from '../pages/ComponentePMT';
import SeguimientoPMTs      from '../pages/SeguimientoPMTs';

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
          <PageComponent perfil={perfil} />
        ) : (
          <div className="error-wrap">Página no disponible.</div>
        )}
      </main>
    </div>
  );
}
