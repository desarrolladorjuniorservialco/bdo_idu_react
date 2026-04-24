import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ROLES_VALIDOS } from '../config/nav';

const AuthContext = createContext(null);

const MAX_INTENTOS = 3;
const BLOQUEO_MS   = 15 * 60 * 1000;

// Rate limiting en localStorage (por email, client-side)
function getAttempts(email) {
  try {
    const raw = localStorage.getItem(`bdo_rl_${btoa(email)}`);
    return raw ? JSON.parse(raw) : { count: 0, until: null };
  } catch { return { count: 0, until: null }; }
}

function saveAttempts(email, data) {
  try { localStorage.setItem(`bdo_rl_${btoa(email)}`, JSON.stringify(data)); } catch {}
}

function clearAttempts(email) {
  try { localStorage.removeItem(`bdo_rl_${btoa(email)}`); } catch {}
}

function isBlocked(email) {
  const { count, until } = getAttempts(email);
  if (until && Date.now() < until) return { blocked: true, count, until };
  if (until && Date.now() >= until) { clearAttempts(email); }
  return { blocked: false, count, until: null };
}

function registerFailure(email) {
  const { count } = getAttempts(email);
  const newCount = count + 1;
  const until = newCount >= MAX_INTENTOS ? Date.now() + BLOQUEO_MS : null;
  saveAttempts(email, { count: newCount, until });
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPerfil = useCallback(async (authUser) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, empresa, contrato_id')
      .eq('id', authUser.id)
      .single();
    if (error || !data) return null;
    if (!ROLES_VALIDOS.has(data.rol)) return null;
    return data;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const p = await loadPerfil(session.user);
          if (p) { setUser(session.user); setPerfil(p); }
        }
      } finally {
        setLoading(false);
      }
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const p = await loadPerfil(session.user);
        if (p) { setUser(session.user); setPerfil(p); }
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadPerfil]);

  const login = useCallback(async (email, password) => {
    const blockInfo = isBlocked(email);
    if (blockInfo.blocked) {
      const restMs  = blockInfo.until - Date.now();
      const mins    = Math.floor(restMs / 60000);
      const secs    = Math.floor((restMs % 60000) / 1000);
      return { error: `Demasiados intentos fallidos. Espera ${mins}m ${secs}s.` };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      registerFailure(email);
      return { error: 'Correo o contraseña incorrectos.' };
    }

    const p = await loadPerfil(data.user);
    if (!p) {
      registerFailure(email);
      await supabase.auth.signOut();
      return { error: 'Cuenta sin perfil válido. Contacta al administrador.' };
    }

    clearAttempts(email);
    setUser(data.user);
    setPerfil(p);
    return { error: null };
  }, [loadPerfil]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, perfil, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
