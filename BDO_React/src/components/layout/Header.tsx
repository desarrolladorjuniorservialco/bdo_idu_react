'use client';
import { Button } from '@/components/ui/button';
import { ROL_LABELS } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNotifStore } from '@/stores/notifStore';
import type { Perfil } from '@/types/database';
import { Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  perfil: Perfil;
}

export function Header({ perfil }: HeaderProps) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearNotifs = useNotifStore((s) => s.clearNotifs);
  const notifs = useNotifStore((s) => s.notifs);
  const unread = notifs.filter((n) => !n.leida).length;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    clearNotifs();
    router.push('/login');
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-6 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {perfil.nombre}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'var(--muted)', color: 'var(--text-muted)' }}
        >
          {ROL_LABELS[perfil.rol]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {unread > 0 && (
          <div className="relative">
            <Bell className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--idu-red)] text-white text-[9px] font-bold">
              {unread}
            </span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
