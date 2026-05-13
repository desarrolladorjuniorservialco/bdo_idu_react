import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;

export function useInactivityTimeout(timeoutMs: number, onTimeout: () => void): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    lastActivityRef.current = Date.now();

    function startTimer(delay: number): void {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, delay);
    }

    function resetTimer(): void {
      lastActivityRef.current = Date.now();
      startTimer(timeoutMs);
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
      } else {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= timeoutMs) {
          onTimeoutRef.current();
        } else {
          startTimer(timeoutMs - elapsed);
        }
      }
    }

    startTimer(timeoutMs);

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeoutMs]);
}
