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
  const warningVisibleRef = useRef(false);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  const logout = useCallback(() => {
    if (didLogoutRef.current) return;
    didLogoutRef.current = true;
    try {
      localStorage.removeItem(SESSION_START_KEY);
    } catch {
      // ignore
    }
    onLogoutRef.current();
  }, []);

  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningVisibleRef.current = false;
    setWarningVisible(false);
  }, []);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    let sessionStart: number;
    try {
      const stored = localStorage.getItem(SESSION_START_KEY);
      const parsed = stored ? Number(stored) : Number.NaN;
      if (!Number.isNaN(parsed)) {
        sessionStart = parsed;
      } else {
        sessionStart = Date.now();
        localStorage.setItem(SESSION_START_KEY, String(sessionStart));
      }
    } catch {
      sessionStart = Date.now();
    }

    // Immediate expiry check
    const initialSessionRemaining = sessionMaxMs - (Date.now() - sessionStart);
    if (initialSessionRemaining <= 0) {
      logout();
      return;
    }

    // Set accurate initial display values
    const inactivityRemaining = inactivityMs - (Date.now() - lastActivityRef.current);
    const initialMin = Math.min(initialSessionRemaining, inactivityRemaining);
    setSecondsRemaining(Math.ceil(initialMin / TICK_MS));

    function showWarning() {
      if (!warningVisibleRef.current) {
        warningVisibleRef.current = true;
        setWarningVisible(true);
      }
    }

    if (initialMin <= warningBeforeMs) {
      showWarning();
    }

    // visibilitychange is intentionally omitted: the setInterval ticks while
    // the tab is hidden (at reduced frequency), and Date.now() in the tick
    // correctly measures elapsed wall-clock time for both timers.
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
        showWarning();
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetActivity);
      }
    };
    // logout is stable (useCallback with empty deps) — safe to omit from deps array
  }, [inactivityMs, sessionMaxMs, warningBeforeMs]);

  return { warningVisible, secondsRemaining, extendSession, logout };
}
