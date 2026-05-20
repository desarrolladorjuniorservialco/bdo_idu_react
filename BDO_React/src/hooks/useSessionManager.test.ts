import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionManager } from './useSessionManager';

const KEY = 'bdo-session-start';

describe('useSessionManager', () => {
  const opts = {
    inactivityMs: 10_000,
    sessionMaxMs: 10_000,
    warningBeforeMs: 2_000,
    onLogout: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    localStorage.clear();
    opts.onLogout.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

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
    act(() => {
      vi.advanceTimersByTime(9_000);
      window.dispatchEvent(new Event('mousemove'));
    });
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

  it('extendSession does not re-show warning on the next tick', () => {
    const { result } = renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 10_000,
      sessionMaxMs: 60_000,
    }));
    // Advance to warning zone
    act(() => { vi.advanceTimersByTime(9_000); });
    expect(result.current.warningVisible).toBe(true);
    // Extend — hides warning
    act(() => { result.current.extendSession(); });
    expect(result.current.warningVisible).toBe(false);
    // Next tick — warning should NOT reappear (inactivity was reset)
    act(() => { vi.advanceTimersByTime(1_000); });
    expect(result.current.warningVisible).toBe(false);
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

  it('extendSession does not modify bdo-session-start in localStorage', () => {
    const { result } = renderHook(() => useSessionManager({
      ...opts,
      inactivityMs: 10_000,
      sessionMaxMs: 60_000,
    }));
    const before = localStorage.getItem(KEY);
    act(() => { result.current.extendSession(); });
    expect(localStorage.getItem(KEY)).toBe(before);
  });
});
