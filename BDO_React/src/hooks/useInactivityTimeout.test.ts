import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInactivityTimeout } from './useInactivityTimeout';

describe('useInactivityTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true,
    });
  });

  it('fires onTimeout after the specified delay', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(999);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on mousemove event', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(800);
    window.dispatchEvent(new Event('mousemove'));

    vi.advanceTimersByTime(800);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on keydown event', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(800);
    window.dispatchEvent(new KeyboardEvent('keydown'));

    vi.advanceTimersByTime(800);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on click event', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(800);
    window.dispatchEvent(new MouseEvent('click'));

    vi.advanceTimersByTime(800);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on scroll event', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(800);
    window.dispatchEvent(new Event('scroll'));

    vi.advanceTimersByTime(800);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resets timer on touchstart event', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    vi.advanceTimersByTime(800);
    window.dispatchEvent(new TouchEvent('touchstart'));

    vi.advanceTimersByTime(800);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('does not fire after unmount', () => {
    const onTimeout = vi.fn();
    const { unmount } = renderHook(() => useInactivityTimeout(1000, onTimeout));

    unmount();
    vi.advanceTimersByTime(2000);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('fires immediately when page becomes visible after hiding longer than timeout', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    // Hide the page
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'hidden',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Advance 1500ms while hidden (exceeds the 1000ms timeout)
    vi.advanceTimersByTime(1500);

    // Come back visible — onTimeout should fire immediately
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(onTimeout).toHaveBeenCalledOnce();
  });

  it('resumes remaining time when page becomes visible before timeout', () => {
    const onTimeout = vi.fn();
    renderHook(() => useInactivityTimeout(1000, onTimeout));

    // Hide at t=0
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'hidden',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Advance 400ms while hidden
    vi.advanceTimersByTime(400);

    // Come back visible — 600ms remaining
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Should not timeout after 599ms
    vi.advanceTimersByTime(599);
    expect(onTimeout).not.toHaveBeenCalled();

    // Should timeout after 1ms more
    vi.advanceTimersByTime(1);
    expect(onTimeout).toHaveBeenCalledOnce();
  });
});
