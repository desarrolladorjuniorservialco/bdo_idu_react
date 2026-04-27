import { create } from 'zustand';
import type { Notificacion } from '@/types/database';

interface NotifState {
  notifs:       Notificacion[];
  setNotifs:    (notifs: Notificacion[]) => void;
  marcarLeida:  (id: string) => void;
  clearNotifs:  () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifs:      [],
  setNotifs:   (notifs) => set({ notifs }),
  marcarLeida: (id) =>
    set((state) => ({
      notifs: state.notifs.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
    })),
  clearNotifs: () => set({ notifs: [] }),
}));
