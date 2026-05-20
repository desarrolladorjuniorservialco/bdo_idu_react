# Session Timeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing single-timer `InactivityGuard` with a `SessionGuard` that enforces both a 30-minute inactivity limit and a 30-minute absolute session limit, with a 2-minute countdown warning dialog before either limit fires.

**Architecture:** A new `useSessionManager` hook centralises both timers and warning state; a stateless `SessionWarningDialog` renders the countdown modal; `SessionGuard` wires them together with Supabase signOut/refreshSession and router logic. Session start time persists in `localStorage` under `bdo-session-start` so the absolute limit survives page reloads.

**Tech Stack:** Next.js 15 App Router, React 19, Supabase SSR, Zustand, Radix UI Dialog, Vitest + @testing-library/react

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `src/hooks/useSessionManager.ts` | Both timers + warning state logic |
| **Create** | `src/hooks/useSessionManager.test.ts` | Unit tests for the hook |
| **Create** | `src/components/layout/SessionWarningDialog.tsx` | Countdown modal, no internal state |
| **Create** | `src/app/(dashboard)/SessionGuard.tsx` | Supabase + router side-effects, renders dialog |
| **Create** | `src/app/(dashboard)/SessionGuard.test.tsx` | Integration tests for the guard |
| **Modify** | `src/app/(dashboard)/layout.tsx` | Swap `InactivityGuard` → `SessionGuard` |
| **Delete** | `src/hooks/useInactivityTimeout.ts` | Replaced by `useSessionManager` |
| **Delete** | `src/hooks/useInactivityTimeout.test.ts` | Replaced |
| **Delete** | `src/app/(dashboard)/InactivityGuard.tsx` | Replaced by `SessionGuard` |
| **Delete** | `src/app/(dashboard)/InactivityGuard.test.tsx` | Replaced |

---

## Task 1: Create `useSessionManager` hook (TDD)

**Files:**
- Create: `src/hooks/useSessionManager.ts`
- Create: `src/hooks/useSessionManager.test.ts`

---

- [ ] **Step 1.1: Write the failing tests**

Create `src/hooks/useSessionManager.test.ts`:

```ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionManager } from './useSessionManager';

const KEY = 'bdo-session-start';

describe('useSessionManager', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  const opts = {
    inactivityMs: 10_000,
    sessionMaxMs: 10_000,
    warningBeforeMs: 2_000,
    onLogout: vi.fn(),
  };

  it('writes bdo-session-start to localStorage on first mount', () => {
    renderHook(() => useSessionManager(opts));
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  it('uses existing bdo-session-start when present', () => {
    const start = Date.now() - 5_000;
    localStorage.setItem(KEY, String(start));
    const { result } = renderHook(() => useSessionManager(opts));
    expect(result.current.secondsRemaining).toBeLessThanOrEqual(5);
  });

  it('calls onLogout immediately when stored session is already expired', () => {
    const onLogout = vi.fn();
    localStorage.setItem(KEY, String(Date.now() - 11_000));
    renderHook(() => useSessionManager({ ...opts, onLogout }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('shows warning immediately when stored session is within warningBeforeMs on mount', () => {
    localStorage.setItem(KEY, String(Date.now() - 8_500));
    const { result } = renderHook(() => useSessionManager(opts));
    expect(result.current.warningVisible).toBe(true);
  });

  it('shows warning when inactivity reaches warningBeforeMs', () => {
    const { result } = renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 10_000,
      sessionMaxMs: 60_000,
    }));
    act(() => { vi.advanceTimersByTime(8_000); });
    expect(result.current.warningVisible).toBe(true);
  });

  it('calls onLogout after inactivity expires', () => {
    const onLogout = vi.fn();
    renderHook(() => useSessionManager({ ...opts, inactivityMs: 10_000, sessionMaxMs: 60_000, onLogout }));
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('calls onLogout after sessionMax expires', () => {
    const onLogout = vi.fn();
    renderHook(() => useSessionManager({ ...opts, inactivityMs: 60_000, sessionMaxMs: 10_000, onLogout }));
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('resets inactivity timer on user activity', () => {
    const onLogout = vi.fn();
    renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 10_000,
      sessionMaxMs: 60_000,
      onLogout,
    }));
    act(() => { vi.advanceTimersByTime(9_000); });
    window.dispatchEvent(new Event('mousemove'));
    act(() => { vi.advanceTimersByTime(9_000); });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('extendSession hides warning and resets inactivity', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 10_000,
      sessionMaxMs: 60_000,
      onLogout,
    }));
    act(() => { vi.advanceTimersByTime(9_000); });
    expect(result.current.warningVisible).toBe(true);
    act(() => { result.current.extendSession(); });
    expect(result.current.warningVisible).toBe(false);
    act(() => { vi.advanceTimersByTime(9_000); });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('logout removes bdo-session-start and calls onLogout', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useSessionManager({ ...opts, onLogout }));
    act(() => { result.current.logout(); });
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('logout is idempotent — onLogout called only once', () => {
    const onLogout = vi.fn();
    const { result } = renderHook(() => useSessionManager({ ...opts, onLogout }));
    act(() => {
      result.current.logout();
      result.current.logout();
    });
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('does not fire after unmount', () => {
    const onLogout = vi.fn();
    const { unmount } = renderHook(() =>
      useSessionManager({ ...opts, inactivityMs: 10_000, sessionMaxMs: 60_000, onLogout })
    );
    unmount();
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('secondsRemaining counts down every second', () => {
    const { result } = renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 60_000,
      sessionMaxMs: 60_000,
    }));
    const initial = result.current.secondsRemaining;
    act(() => { vi.advanceTimersByTime(3_000); });
    expect(result.current.secondsRemaining).toBe(initial - 3);
  });
});
```

- [ ] **Step 1.2: Run tests — verify they fail**

```bash
cd BDO_React && npx vitest run src/hooks/useSessionManager.test.ts
```

Expected: `Cannot find module './useSessionManager'`

- [ ] **Step 1.3: Implement `useSessionManager`**

Create `src/hooks/useSessionManager.ts`:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_START_KEY = 'bdo-session-start';
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
const TICK_MS = 1_000;

interface UseSessionManagerOptions {
  inactivityMs: number;
  sessionMaxMs: number;
  warningBeforeMs: number;
  onLogout: () => void;
}

interface SessionManagerResult {
  warningVisible: boolean;
  secondsRemaining: number;
  extendSession: () => void;
  logout: () => void;
}

export function useSessionManager({
  inactivityMs,
  sessionMaxMs,
  warningBeforeMs,
  onLogout,
}: UseSessionManagerOptions): SessionManagerResult {
  const [warningVisible, setWarningVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(Math.min(inactivityMs, sessionMaxMs) / TICK_MS),
  );

  const lastActivityRef = useRef<number>(Date.now());
  const onLogoutRef = useRef(onLogout);
  const didLogoutRef = useRef(false);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  const logout = useCallback(() => {
    if (didLogoutRef.current) return;
    didLogoutRef.current = true;
    localStorage.removeItem(SESSION_START_KEY);
    onLogoutRef.current();
  }, []);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setWarningVisible(false);
  }, []);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    const stored = localStorage.getItem(SESSION_START_KEY);
    let sessionStart = stored ? Number(stored) : Number.NaN;
    if (Number.isNaN(sessionStart)) {
      sessionStart = Date.now();
      localStorage.setItem(SESSION_START_KEY, String(sessionStart));
    }

    // Immediate expiry check
    const initialSessionRemaining = sessionMaxMs - (Date.now() - sessionStart);
    if (initialSessionRemaining <= 0) {
      logout();
      return;
    }

    // Set accurate initial display values
    const initialMin = Math.min(initialSessionRemaining, inactivityMs);
    setSecondsRemaining(Math.ceil(initialMin / TICK_MS));
    if (initialMin <= warningBeforeMs) {
      setWarningVisible(true);
    }

    function resetActivity() {
      lastActivityRef.current = Date.now();
    }
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetActivity, { passive: true });
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const sessionRemaining = sessionMaxMs - (now - sessionStart);
      const inactivityRemaining = inactivityMs - (now - lastActivityRef.current);
      const minRemaining = Math.min(sessionRemaining, inactivityRemaining);

      if (minRemaining <= 0) {
        clearInterval(interval);
        logout();
        return;
      }

      setSecondsRemaining(Math.ceil(minRemaining / TICK_MS));
      if (minRemaining <= warningBeforeMs) {
        setWarningVisible(true);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetActivity);
      }
    };
  }, [inactivityMs, sessionMaxMs, warningBeforeMs, logout]);

  return { warningVisible, secondsRemaining, extendSession, logout };
}
```

- [ ] **Step 1.4: Run tests — verify they pass**

```bash
npx vitest run src/hooks/useSessionManager.test.ts
```

Expected: all 13 tests PASS

- [ ] **Step 1.5: Commit**

```bash
git -C .. add BDO_React/src/hooks/useSessionManager.ts BDO_React/src/hooks/useSessionManager.test.ts
git -C .. commit -m "feat(session): add useSessionManager hook with inactivity + absolute session limit"
```

---

## Task 2: Create `SessionWarningDialog` component

**Files:**
- Create: `src/components/layout/SessionWarningDialog.tsx`

---

- [ ] **Step 2.1: Create the component**

Create `src/components/layout/SessionWarningDialog.tsx`:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface SessionWarningDialogProps {
  open: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarningDialog({
  open,
  secondsRemaining,
  onExtend,
  onLogout,
}: SessionWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Tu sesión está por expirar</DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Tu sesión se cerrará en{' '}
            <span className="font-semibold tabular-nums">{secondsRemaining}</span>{' '}
            segundo{secondsRemaining !== 1 ? 's' : ''}.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onLogout}>
              Cerrar sesión
            </Button>
            <Button onClick={onExtend}>Extender sesión</Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
```

- [ ] **Step 2.2: Commit**

```bash
git -C .. add BDO_React/src/components/layout/SessionWarningDialog.tsx
git -C .. commit -m "feat(session): add SessionWarningDialog countdown modal"
```

---

## Task 3: Create `SessionGuard` component (TDD)

**Files:**
- Create: `src/app/(dashboard)/SessionGuard.tsx`
- Create: `src/app/(dashboard)/SessionGuard.test.tsx`

---

- [ ] **Step 3.1: Write the failing tests**

Create `src/app/(dashboard)/SessionGuard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from './SessionGuard';

const mockSignOut = vi.fn().mockResolvedValue({});
const mockRefreshSession = vi.fn().mockResolvedValue({});
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut, refreshSession: mockRefreshSession },
  }),
}));

const mockClearAuth = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: { clearAuth: () => void }) => unknown) =>
    selector({ clearAuth: mockClearAuth }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockExtendSession = vi.fn();
const mockLogout = vi.fn();

vi.mock('@/hooks/useSessionManager', () => ({
  useSessionManager: vi.fn(() => ({
    warningVisible: false,
    secondsRemaining: 120,
    extendSession: mockExtendSession,
    logout: mockLogout,
  })),
}));

import { useSessionManager } from '@/hooks/useSessionManager';

describe('SessionGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not show the warning dialog when warningVisible is false', () => {
    render(<SessionGuard />);
    expect(screen.queryByText('Tu sesión está por expirar')).not.toBeInTheDocument();
  });

  it('shows the warning dialog with countdown when warningVisible is true', () => {
    vi.mocked(useSessionManager).mockReturnValue({
      warningVisible: true,
      secondsRemaining: 90,
      extendSession: mockExtendSession,
      logout: mockLogout,
    });
    render(<SessionGuard />);
    expect(screen.getByText('Tu sesión está por expirar')).toBeInTheDocument();
    expect(screen.getByText(/90/)).toBeInTheDocument();
  });

  it('"Extender sesión" calls refreshSession then extendSession', async () => {
    vi.mocked(useSessionManager).mockReturnValue({
      warningVisible: true,
      secondsRemaining: 90,
      extendSession: mockExtendSession,
      logout: mockLogout,
    });
    render(<SessionGuard />);
    await userEvent.click(screen.getByRole('button', { name: 'Extender sesión' }));
    expect(mockRefreshSession).toHaveBeenCalledOnce();
    expect(mockExtendSession).toHaveBeenCalledOnce();
  });

  it('"Cerrar sesión" calls hook logout', async () => {
    vi.mocked(useSessionManager).mockReturnValue({
      warningVisible: true,
      secondsRemaining: 90,
      extendSession: mockExtendSession,
      logout: mockLogout,
    });
    render(<SessionGuard />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('onLogout callback calls signOut, clearAuth, and router.push("/login")', async () => {
    // Capture the onLogout prop passed to useSessionManager
    let capturedOnLogout!: () => Promise<void>;
    vi.mocked(useSessionManager).mockImplementation(({ onLogout }) => {
      capturedOnLogout = onLogout as () => Promise<void>;
      return {
        warningVisible: false,
        secondsRemaining: 120,
        extendSession: mockExtendSession,
        logout: mockLogout,
      };
    });
    render(<SessionGuard />);
    await capturedOnLogout();
    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockClearAuth).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('onLogout still calls clearAuth and router.push even if signOut throws', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('network'));
    let capturedOnLogout!: () => Promise<void>;
    vi.mocked(useSessionManager).mockImplementation(({ onLogout }) => {
      capturedOnLogout = onLogout as () => Promise<void>;
      return {
        warningVisible: false,
        secondsRemaining: 120,
        extendSession: mockExtendSession,
        logout: mockLogout,
      };
    });
    render(<SessionGuard />);
    await capturedOnLogout();
    expect(mockClearAuth).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
```

- [ ] **Step 3.2: Run tests — verify they fail**

```bash
npx vitest run "src/app/\(dashboard\)/SessionGuard.test.tsx"
```

Expected: `Cannot find module './SessionGuard'`

- [ ] **Step 3.3: Implement `SessionGuard`**

Create `src/app/(dashboard)/SessionGuard.tsx`:

```tsx
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
```

- [ ] **Step 3.4: Run tests — verify they pass**

```bash
npx vitest run "src/app/\(dashboard\)/SessionGuard.test.tsx"
```

Expected: all 6 tests PASS

- [ ] **Step 3.5: Commit**

```bash
git -C .. add "BDO_React/src/app/(dashboard)/SessionGuard.tsx" "BDO_React/src/app/(dashboard)/SessionGuard.test.tsx" BDO_React/src/components/layout/SessionWarningDialog.tsx
git -C .. commit -m "feat(session): add SessionGuard with warning dialog, replacing InactivityGuard"
```

---

## Task 4: Wire `SessionGuard` into the dashboard layout

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

---

- [ ] **Step 4.1: Update the import in `layout.tsx`**

In `src/app/(dashboard)/layout.tsx`, replace line 9:

```tsx
// Before
import { InactivityGuard } from './InactivityGuard';

// After
import { SessionGuard } from './SessionGuard';
```

And replace line 26:

```tsx
// Before
<InactivityGuard />

// After
<SessionGuard />
```

The full file should look like:

```tsx
import { Header } from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeApplier } from '@/components/layout/ThemeApplier';
import { getCachedPerfil, getCachedSession, getCachedUser } from '@/lib/supabase/cached-queries';
import type { Perfil } from '@/types/database';
import { redirect } from 'next/navigation';
import { AuthInitializer } from './AuthInitializer';
import { SessionGuard } from './SessionGuard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser();

  if (!user) redirect('/login');

  const [perfil, session] = await Promise.all([getCachedPerfil(user.id), getCachedSession()]);

  if (!perfil) redirect('/login');

  const accessToken = session?.access_token ?? '';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <ThemeApplier />
      <AuthInitializer perfil={perfil as Perfil} accessToken={accessToken} />
      <SessionGuard />
      <Sidebar perfil={perfil as Perfil} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header perfil={perfil as Perfil} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4.2: Run full test suite**

```bash
npx vitest run
```

Expected: all tests PASS (including pre-existing tests)

- [ ] **Step 4.3: Commit**

```bash
git -C .. add "BDO_React/src/app/(dashboard)/layout.tsx"
git -C .. commit -m "chore(session): wire SessionGuard into dashboard layout"
```

---

## Task 5: Delete old files

**Files:**
- Delete: `src/hooks/useInactivityTimeout.ts`
- Delete: `src/hooks/useInactivityTimeout.test.ts`
- Delete: `src/app/(dashboard)/InactivityGuard.tsx`
- Delete: `src/app/(dashboard)/InactivityGuard.test.tsx`

---

- [ ] **Step 5.1: Delete replaced files**

```bash
git -C .. rm \
  BDO_React/src/hooks/useInactivityTimeout.ts \
  BDO_React/src/hooks/useInactivityTimeout.test.ts \
  "BDO_React/src/app/(dashboard)/InactivityGuard.tsx" \
  "BDO_React/src/app/(dashboard)/InactivityGuard.test.tsx"
```

- [ ] **Step 5.2: Run full test suite again — verify nothing breaks**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 5.3: Final commit**

```bash
git -C .. commit -m "chore(session): remove InactivityGuard and useInactivityTimeout (replaced by SessionGuard)"
```

---

## Self-Review Checklist (completed)

- [x] **Spec coverage:** localStorage persistence ✓, inactivity timer ✓, absolute session timer ✓, warning at 2 min ✓, extendSession ✓, logout clears localStorage ✓, immediate logout if expired on mount ✓.
- [x] **No placeholders:** all steps have complete code.
- [x] **Type consistency:** `SessionManagerResult` interface defined in Task 1 and consumed exactly in Task 3. `SessionWarningDialogProps` defined in Task 2 and passed exactly in Task 3.
