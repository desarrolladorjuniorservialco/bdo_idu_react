import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';

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

  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
