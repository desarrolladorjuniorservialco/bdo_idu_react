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
