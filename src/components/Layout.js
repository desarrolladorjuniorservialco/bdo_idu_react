import React, { Suspense } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { NAV_ACCESS, PATH_PAGE } from '../config/nav';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { perfil } = useAuth();
  const location = useLocation();
  const navigation = useNavigation();

  const pageName = PATH_PAGE[location.pathname];
  const allowed  = !pageName || (NAV_ACCESS[pageName] || []).includes(perfil.rol);
  const isLoading = navigation.state === 'loading';

  return (
    <div className="app-shell">
      <Sidebar />
      <main
        className="main-content"
        style={{
          opacity:    isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {!allowed ? (
          <div className="error-wrap">No tienes permiso para acceder a esta sección.</div>
        ) : (
          <Suspense fallback={<div className="loading-wrap"><span>Cargando...</span></div>}>
            <Outlet />
          </Suspense>
        )}
      </main>
    </div>
  );
}
