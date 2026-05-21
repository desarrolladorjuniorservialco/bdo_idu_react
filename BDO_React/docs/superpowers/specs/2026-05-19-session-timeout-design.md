# Session Timeout Design

## Parameters

| Parameter | Value |
|---|---|
| Inactivity timeout | 30 min (resets on user activity) |
| Max session duration | 30 min (persists across reloads via localStorage) |
| Warning before expiry | 2 min before whichever timer fires first |
| On page reload | Max session timer continues from stored start time |
| On logout | Clear `bdo-session-start` from localStorage |

## Architecture

Four pieces, each with a single responsibility:

### 1. `useSessionManager` hook (`src/hooks/useSessionManager.ts`)

Replaces `useInactivityTimeout`. Manages two internal timers:

- **Inactivity timer**: 30 min, resets on mouse/keyboard/scroll/click/touchstart events and on `extendSession()` call.
- **Max session timer**: 30 min absolute, reads `bdo-session-start` from localStorage on mount; if not found, writes `Date.now()`. Never resets except on logout.

Returns:
```ts
{
  warningVisible: boolean;
  secondsRemaining: number; // from whichever timer expires first
  extendSession: () => void;
  logout: () => void;
}
```

**On mount logic:**
1. Read `bdo-session-start` from localStorage
2. If missing → write `Date.now()`, full 30 min remaining
3. If present → calculate `remaining = 30min - (now - sessionStart)`
4. If `remaining <= 0` → call `logout()` immediately
5. If `remaining <= 2min` → show warning immediately with countdown

**`extendSession()` does:**
- Resets the inactivity timer
- Calls `supabase.auth.refreshSession()` to keep Supabase token alive
- Does NOT touch `bdo-session-start` — the absolute limit keeps running
- Sets `warningVisible = false`

**`logout()` does:**
- Calls `supabase.auth.signOut()`
- Clears `bdo-session-start` from localStorage
- Calls `clearAuth()` from authStore
- Redirects to `/login`

### 2. `SessionWarningDialog` component (`src/components/layout/SessionWarningDialog.tsx`)

Modal dialog that appears when `warningVisible = true`.

Props:
```ts
{
  open: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}
```

UI:
- Title: "Tu sesión está por expirar"
- Body: "Tu sesión se cerrará en `X` segundos por inactividad o por tiempo máximo."
- Button: "Extender sesión" (primary)
- Button: "Cerrar sesión" (secondary/destructive)
- Countdown updates every second

### 3. `InactivityGuard.tsx` → evolved to `SessionGuard` behavior

Rename file to `SessionGuard.tsx`. Consumes `useSessionManager`, renders `SessionWarningDialog`. No other logic.

### 4. `bdo-session-start` in localStorage

- Key: `bdo-session-start`
- Value: Unix timestamp (ms) as string
- Written: on first mount of `SessionGuard` after login
- Deleted: on logout (any path: inactivity, max duration, manual)

## Files Changed

| File | Action |
|---|---|
| `src/hooks/useInactivityTimeout.ts` | Delete (replaced) |
| `src/hooks/useSessionManager.ts` | Create |
| `src/app/(dashboard)/InactivityGuard.tsx` | Rename → `SessionGuard.tsx`, rewrite |
| `src/app/(dashboard)/layout.tsx` | Update import |
| `src/components/layout/SessionWarningDialog.tsx` | Create |

## Testing

- `useSessionManager.test.ts`: unit tests with fake timers for both timer paths, localStorage persistence, warning trigger at 2 min, immediate logout when stored time already expired.
- `SessionWarningDialog.test.tsx`: renders countdown, button interactions.
- Update `InactivityGuard.test.tsx` → `SessionGuard.test.tsx`.
