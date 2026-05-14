import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InactivityGuard } from './InactivityGuard';

const mockSignOut = vi.fn().mockResolvedValue({});
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
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

describe('InactivityGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    mockSignOut.mockClear();
    mockClearAuth.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders null — no DOM output', () => {
    const { container } = render(<InactivityGuard />);
    expect(container.firstChild).toBeNull();
  });

  it('calls signOut, clearAuth, and router.push("/login") after 30 minutes of inactivity', async () => {
    render(<InactivityGuard />);

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(mockSignOut).toHaveBeenCalledOnce();
    expect(mockClearAuth).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('does NOT call signOut before 30 minutes', async () => {
    render(<InactivityGuard />);

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000 - 1);
    });

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('resets timer on user activity — no signOut after 29 min + activity + 29 min', async () => {
    render(<InactivityGuard />);

    await act(async () => {
      vi.advanceTimersByTime(29 * 60 * 1000);
    });

    window.dispatchEvent(new Event('mousemove'));

    await act(async () => {
      vi.advanceTimersByTime(29 * 60 * 1000);
    });

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('still calls clearAuth and router.push if signOut throws', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('network'));
    render(<InactivityGuard />);

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    expect(mockClearAuth).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
