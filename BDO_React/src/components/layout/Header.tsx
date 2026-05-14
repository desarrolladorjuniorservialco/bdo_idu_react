'use client';
import { NAV_CATEGORIES, ROL_LABELS } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNotifStore } from '@/stores/notifStore';
import { useThemeStore } from '@/stores/themeStore';
import type { Perfil } from '@/types/database';
import { Bell, ChevronRight, LogOut, Moon, Sun } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  perfil: Perfil;
}

const ALL_NAV_PAGES = NAV_CATEGORIES.flatMap((c) => c.pages);

export function Header({ perfil }: HeaderProps) {
  const { push, refresh } = useRouter();
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearNotifs = useNotifStore((s) => s.clearNotifs);
  const notifs = useNotifStore((s) => s.notifs);
  const unread = notifs.filter((n) => !n.leida).length;
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const currentPage = ALL_NAV_PAGES.find(
    (p) => pathname === p.href || pathname.startsWith(`${p.href}/`),
  );

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    clearNotifs();
    push('/login');
    refresh();
  }

  const initials = perfil.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-6"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(6,43,91,0.06)',
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>
          {perfil.nombre}
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase shrink-0"
          style={{
            background: 'var(--idu-green-lt)',
            color: 'var(--idu-green-lt-fg)',
            border: '1px solid color-mix(in oklch, var(--corp-green) 25%, transparent)',
          }}
        >
          {ROL_LABELS[perfil.rol]}
        </span>
        {currentPage && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="font-medium truncate" style={{ color: 'var(--text-muted)' }}>
              {currentPage.label}
            </span>
          </>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-0.5">
        {unread > 0 && (
          <div className="relative mr-1">
            <Bell className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-bold"
              style={{ background: 'var(--corp-green)' }}
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
          className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-150 hover:bg-[var(--muted)]"
          style={{ color: 'var(--text-muted)' }}
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
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-150 hover:bg-[var(--muted)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut className="h-4 w-4" />
        </button>
        <div
          className="ml-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: 'var(--corp-primary)', color: '#fff' }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
