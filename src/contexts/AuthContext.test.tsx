import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import {
  createMockSupabaseClient,
  mockAuthSession,
  mockNoAuthSession,
  createSuccessResponse,
  createErrorResponse,
} from '@/test-utils';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

vi.mock('@/utils/authCache', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: vi.fn(),
}));

const { toast } = await import('sonner');
const { getCurrentUser } = await import('@/utils/authCache');

describe('AuthContext', () => {
  let supabaseMock: ReturnType<typeof createMockSupabaseClient>;
  let authStateCallback: (event: string, session: unknown) => void;
  let subscriptionMock: { unsubscribe: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    supabaseMock = createMockSupabaseClient();

    // Mock auth state listener
    subscriptionMock = { unsubscribe: vi.fn() };
    supabaseMock.mocks.getSession.mockResolvedValue(mockNoAuthSession());
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    // Capture the auth state callback
    supabaseMock.mocks.onAuthStateChange.mockImplementation((callback: any) => {
      authStateCallback = callback;
      return { data: { subscription: subscriptionMock } };
    });

    // Replace the mock
    const supabaseModule = await import('@/integrations/supabase/client');
    Object.assign(supabaseModule.supabase, supabaseMock.supabase);
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider'
      );
    });
  });

  describe('AuthProvider initialization', () => {
    it('initializes with no session when user is logged out', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });

    it('initializes with session when user is logged in', async () => {
      const mockSession = mockAuthSession('user-123');
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      supabaseMock.mocks.getSession.mockResolvedValue(mockSession);
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.session).toEqual(mockSession.data.session);
      expect(result.current.user).toEqual(mockUser);
    });

    it('subscribes to auth state changes', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(supabaseMock.mocks.onAuthStateChange).toHaveBeenCalled();
      });
    });

    it('unsubscribes on unmount', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(supabaseMock.mocks.onAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(subscriptionMock.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('sendMagicLink', () => {
    it('sends magic link successfully', async () => {
      supabaseMock.mocks.signInWithOtp.mockResolvedValue(
        createSuccessResponse({})
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.sendMagicLink('test@example.com');
      });

      expect(supabaseMock.mocks.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: expect.stringContaining('/threads'),
        },
      });

      expect(toast).toHaveBeenCalledWith('Check your email!', {
        description: expect.stringContaining('magic link'),
      });
    });

    it('handles magic link error', async () => {
      supabaseMock.mocks.signInWithOtp.mockResolvedValue(
        createErrorResponse('Invalid email')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.sendMagicLink('invalid');
        })
      ).rejects.toThrow();

      expect(toast).toHaveBeenCalledWith('Error sending magic link', {
        description: 'Invalid email',
      });
    });
  });

  describe('signInWithPassword', () => {
    it('signs in with password successfully', async () => {
      supabaseMock.mocks.signIn.mockResolvedValue(createSuccessResponse({}));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithPassword('test@example.com', 'password');
      });

      expect(supabaseMock.mocks.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });

      expect(toast).toHaveBeenCalledWith('Signed in successfully!');
    });

    it('handles sign in error', async () => {
      supabaseMock.mocks.signIn.mockResolvedValue(
        createErrorResponse('Invalid credentials')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signInWithPassword('test@example.com', 'wrong');
        })
      ).rejects.toThrow();

      expect(toast).toHaveBeenCalledWith('Login failed', {
        description: 'Invalid credentials',
      });
    });
  });

  describe('signOut', () => {
    it('signs out successfully when session exists', async () => {
      const mockSession = mockAuthSession();
      supabaseMock.mocks.getSession.mockResolvedValue(mockSession);
      supabaseMock.mocks.signOut.mockResolvedValue(createSuccessResponse({}));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabaseMock.mocks.signOut).toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('Signed out', {
        description: 'You have successfully signed out.',
      });
    });

    it('handles sign out when no session exists', async () => {
      supabaseMock.mocks.getSession.mockResolvedValue(mockNoAuthSession());

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabaseMock.mocks.signOut).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith('Signed out', {
        description: 'You have successfully signed out.',
      });
    });
  });

  describe('auth state changes', () => {
    it('updates session and user when auth state changes', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate auth state change
      const newSession = mockAuthSession('new-user');
      const newUser = { id: 'new-user', email: 'new@example.com' };
      vi.mocked(getCurrentUser).mockResolvedValue(newUser as any);

      await act(async () => {
        authStateCallback('SIGNED_IN', newSession.data.session);
        // Give time for async getCurrentUser to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(newUser);
      });
    });
  });
});
