import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import {
  ConnectionsProvider,
  useConnectionsContext,
} from './ConnectionsContext';
import { createMockConnectedUsers, createMockUser } from '@/test-utils';

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/users/userService.js', () => ({
  getConnections: vi.fn(),
}));

const { useAuth } = await import('@/contexts/AuthContext');
const { getConnections } = await import('@/services/users/userService.js');

describe('ConnectionsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useConnectionsContext hook', () => {
    it('throws error when used outside ConnectionsProvider', () => {
      expect(() => renderHook(() => useConnectionsContext())).toThrow(
        'useConnectionsContext must be used within a ConnectionsProvider'
      );
    });
  });

  describe('ConnectionsProvider', () => {
    it('initializes with empty connections when no user', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      expect(result.current.connections).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('loads connections when user is logged in', async () => {
      const mockUser = createMockUser();
      const mockConnections = createMockConnectedUsers(3);

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getConnections).mockResolvedValue(mockConnections);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.connections).toEqual(mockConnections);
      expect(getConnections).toHaveBeenCalledTimes(1);
    });

    it('handles getConnections errors gracefully', async () => {
      const mockUser = createMockUser();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getConnections).mockRejectedValue(
        new Error('Failed to fetch connections')
      );

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading connections:',
        expect.any(Error)
      );
      expect(result.current.connections).toEqual([]);

      consoleErrorSpy.mockRestore();
    });

    it('refreshConnections reloads connections', async () => {
      const mockUser = createMockUser();
      const initialConnections = createMockConnectedUsers(2);
      const updatedConnections = createMockConnectedUsers(4);

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getConnections).mockResolvedValue(initialConnections);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.connections).toHaveLength(2);

      // Update mock to return new data
      vi.mocked(getConnections).mockResolvedValue(updatedConnections);

      await act(async () => {
        await result.current.refreshConnections();
      });

      expect(result.current.connections).toHaveLength(4);
      expect(getConnections).toHaveBeenCalledTimes(2);
    });

    it('does not fetch connections after user logs out', async () => {
      const mockUser = createMockUser();

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getConnections).mockResolvedValue([]);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result, unmount } = renderHook(() => useConnectionsContext(), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getConnections).toHaveBeenCalledTimes(1);

      unmount();

      // Change to no user
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      // Remount with no user
      const { result: result2 } = renderHook(() => useConnectionsContext(), {
        wrapper,
      });

      // Should not fetch when no user
      expect(result2.current.connections).toEqual([]);
      expect(getConnections).toHaveBeenCalledTimes(1); // Still just the one call
    });

    it('sets loading state correctly during refresh', async () => {
      const mockUser = createMockUser();
      const mockConnections = createMockConnectedUsers(1);

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      let resolveGetConnections: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolveGetConnections = resolve;
      });
      vi.mocked(getConnections).mockReturnValue(promise as any);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);

      // Resolve the connections
      await act(async () => {
        resolveGetConnections!(mockConnections);
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('does not load connections when user is null', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      renderHook(() => useConnectionsContext(), { wrapper });

      expect(getConnections).not.toHaveBeenCalled();
    });

    it('refreshConnections can be called manually', async () => {
      const mockUser = createMockUser();
      const initialConnections = createMockConnectedUsers(2);
      const refreshedConnections = createMockConnectedUsers(3);

      vi.mocked(useAuth).mockReturnValue({
        user: mockUser as any,
        session: null,
        loading: false,
        sendMagicLink: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      });

      vi.mocked(getConnections)
        .mockResolvedValueOnce(initialConnections)
        .mockResolvedValueOnce(refreshedConnections);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ConnectionsProvider>{children}</ConnectionsProvider>
      );

      const { result } = renderHook(() => useConnectionsContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.connections).toHaveLength(2);
      });

      await act(async () => {
        await result.current.refreshConnections();
      });

      await waitFor(() => {
        expect(result.current.connections).toHaveLength(3);
      });

      expect(getConnections).toHaveBeenCalledTimes(2);
    });
  });
});
