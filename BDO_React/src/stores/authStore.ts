import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Perfil } from '@/types/database';

interface AuthState {
  perfil:      Perfil | null;
  accessToken: string | null;
  setPerfil:   (perfil: Perfil, accessToken: string) => void;
  clearAuth:   () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      perfil:      null,
      accessToken: null,
      setPerfil: (perfil, accessToken) => set({ perfil, accessToken }),
      clearAuth: () => set({ perfil: null, accessToken: null }),
    }),
    { name: 'bdo-auth' }
  )
);
