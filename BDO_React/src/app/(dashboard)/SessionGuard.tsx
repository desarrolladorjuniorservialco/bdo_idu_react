'use client';

import { useSessionManager } from '@/hooks/useSessionManager';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { SessionWarningDialog } from '@/components/layout/SessionWarningDialog';
import { useRouter } from 'next/navigation';

const INACTIVITY_MS = 30 * 60 * 1000;
const SESSION_MAX_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;

export function SessionGuard(): JSX.Element {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleLogout(): Promise<void> {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failed (network error or session already gone) — redirect anyway
    }
    clearAuth();
    router.push('/login');
  }

  const { warningVisible, secondsRemaining, extendSession, logout } = useSessionManager({
    inactivityMs: INACTIVITY_MS,
    sessionMaxMs: SESSION_MAX_MS,
    warningBeforeMs: WARNING_BEFORE_MS,
    onLogout: handleLogout,
  });

  async function handleExtend(): Promise<void> {
    const supabase = createClient();
    try {
      await supabase.auth.refreshSession();
    } catch {
      // refresh failed — inactivity timer was already reset, session continues
    }
    extendSession();
  }

  return (
    <SessionWarningDialog
      open={warningVisible}
      secondsRemaining={secondsRemaining}
      onExtend={handleExtend}
      onLogout={logout}
    />
  );
}
