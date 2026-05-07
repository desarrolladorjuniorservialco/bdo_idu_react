'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';

export function AuthInitializer({
  perfil,
  accessToken,
}: {
  perfil: Perfil;
  accessToken: string;
}) {
  const setPerfil = useAuthStore((s) => s.setPerfil);

  useEffect(() => {
    setPerfil(perfil, accessToken);
  }, [perfil, accessToken, setPerfil]);

  return null;
}
