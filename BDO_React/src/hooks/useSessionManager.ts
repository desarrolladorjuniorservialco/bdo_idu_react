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
    const inactivityRemaining = inactivityMs - (Date.now() - lastActivityRef.current);
    const initialMin = Math.min(initialSessionRemaining, inactivityRemaining);
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
