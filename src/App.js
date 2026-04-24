import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';

const EstadoActual           = lazy(() => import('./pages/EstadoActual'));
const Anotaciones            = lazy(() => import('./pages/Anotaciones'));
const AnotacionesDiario      = lazy(() => import('./pages/AnotacionesDiario'));
const GenerarInforme         = lazy(() => import('./pages/GenerarInforme'));
const MapaEjecucion          = lazy(() => import('./pages/MapaEjecucion'));
const SeguimientoPresupuesto = lazy(() => import('./pages/SeguimientoPresupuesto'));
const Correspondencia        = lazy(() => import('./pages/Correspondencia'));
const ReporteCantidades      = lazy(() => import('./pages/ReporteCantidades'));
const ComponenteAmbiental    = lazy(() => import('./pages/ComponenteAmbiental'));
const ComponenteSocial       = lazy(() => import('./pages/ComponenteSocial'));
const ComponentePMT          = lazy(() => import('./pages/ComponentePMT'));
const SeguimientoPMTs        = lazy(() => import('./pages/SeguimientoPMTs'));

function AppContent() {
  const { user, perfil, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-wrap" style={{ minHeight: '100vh' }}>
        <span>Iniciando sesión...</span>
      </div>
    );
  }

  if (!user || !perfil) {
    return <Login />;
  }

  const p = { perfil };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/estado-actual" replace />} />
        <Route path="estado-actual"           element={<EstadoActual {...p} />} />
        <Route path="anotaciones"             element={<Anotaciones {...p} />} />
        <Route path="anotaciones-diario"      element={<AnotacionesDiario {...p} />} />
        <Route path="generar-informe"         element={<GenerarInforme {...p} />} />
        <Route path="mapa-ejecucion"          element={<MapaEjecucion {...p} />} />
        <Route path="seguimiento-presupuesto" element={<SeguimientoPresupuesto {...p} />} />
        <Route path="correspondencia"         element={<Correspondencia {...p} />} />
        <Route path="reporte-cantidades"      element={<ReporteCantidades {...p} />} />
        <Route path="componente-ambiental"    element={<ComponenteAmbiental {...p} />} />
        <Route path="componente-social"       element={<ComponenteSocial {...p} />} />
        <Route path="componente-pmt"          element={<ComponentePMT {...p} />} />
        <Route path="seguimiento-pmts"        element={<SeguimientoPMTs {...p} />} />
      </Route>
      <Route path="*" element={<Navigate to="/estado-actual" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
