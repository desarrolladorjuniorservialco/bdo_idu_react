'use client';
import { ROL_LABELS } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNotifStore } from '@/stores/notifStore';
import { useThemeStore } from '@/stores/themeStore';
import type { Perfil } from '@/types/database';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  perfil: Perfil;
}

export function Header({ perfil }: HeaderProps) {
  const { push, refresh } = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearNotifs = useNotifStore((s) => s.clearNotifs);
  const notifs = useNotifStore((s) => s.notifs);
  const unread = notifs.filter((n) => !n.leida).length;
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    clearNotifs();
    push('/login');
    refresh();
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-6"
      style={{
        background: 'linear-gradient(to right, var(--corp-primary), var(--corp-dark))',
        borderBottom: '3px solid var(--corp-gold)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          {perfil.nombre}
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full tracking-wide uppercase font-medium"
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.90)',
            border: '1px solid rgba(255,255,255,0.20)',
          }}
        >
          {ROL_LABELS[perfil.rol]}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {unread > 0 && (
          <div className="relative mr-1">
            <Bell className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.85)' }} />
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-bold"
              style={{ background: 'var(--corp-gold)' }}
            >
              {unread}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-pressed={theme === 'dark'}
          className="flex items-center justify-center h-9 w-9 rounded-md transition-colors duration-150 hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.80)' }}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesiÃ³n"
          className="flex items-center justify-center h-9 w-9 rounded-md transition-colors duration-150 hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.80)' }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
