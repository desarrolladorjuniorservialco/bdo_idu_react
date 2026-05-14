'use client';

import { createClient } from '@/lib/supabase/client';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function InactivityGuard(): null {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleTimeout(): Promise<void> {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failed (network error or session already gone) — redirect anyway
    }
    clearAuth();
    router.push('/login');
  }

  useInactivityTimeout(INACTIVITY_TIMEOUT_MS, handleTimeout);

  return null;
}
