import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

vi.mock('sonner', () => ({ toast: vi.fn() }));
vi.mock('@/components/account/personal-info', () => ({
  PersonalInfoForm: ({ form }: any) => (
    <form onSubmit={form.handleSubmit(() => {})}>
      <input data-testid="name" {...form.register('name')} />
      <input data-testid="email" {...form.register('email')} />
    </form>
  ),
}));
vi.mock('@/components/account/notifications', () => ({
  NotificationPreferences: ({ onNotificationChange }: any) => (
    <button
      data-testid="notify"
      onClick={() => onNotificationChange('newMessages', 'browser', true)}
    >
      Toggle
    </button>
  ),
}));
vi.mock('@/components/account/notifications/update', () => ({
  update: vi.fn(),
}));
vi.mock('@/utils/authCache', () => ({
  requireCurrentUser: vi.fn(),
  getUserProfile: vi.fn(),
}));
vi.mock('@/services/messageService/utils', () => ({ handleError: vi.fn() }));

const { toast } = await import('sonner');
const { requireCurrentUser, getUserProfile } =
  await import('@/utils/authCache');
const { update } = await import('@/components/account/notifications/update');
const { handleError } = await import('@/services/messageService/utils');
const Account = (await import('./Account')).default;

describe('Account page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads profile info and populates form', async () => {
    (requireCurrentUser as any).mockResolvedValue({
      id: 'u1',
      email: 'alice@example.com',
    });
    (getUserProfile as any).mockResolvedValue({
      name: 'Alice',
      notifications: {},
    });

    render(<Account />, { wrapper: MemoryRouter });

    await waitFor(() =>
      expect((screen.getByTestId('name') as HTMLInputElement).value).toBe(
        'Alice'
      )
    );
    expect((screen.getByTestId('email') as HTMLInputElement).value).toBe(
      'alice@example.com'
    );
  });

  it('shows error toast on profile load failure', async () => {
    (requireCurrentUser as any).mockRejectedValue(new Error('fail'));
    (getUserProfile as any).mockResolvedValue({});

    render(<Account />, { wrapper: MemoryRouter });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        'Error loading profile',
        expect.any(Object)
      )
    );
  });

  it('updates notifications and shows success toast', async () => {
    (requireCurrentUser as any).mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
    });
    (getUserProfile as any).mockResolvedValue({
      name: 'User',
      notifications: {},
    });
    (update as any).mockResolvedValue(undefined);

    render(<Account />, { wrapper: MemoryRouter });

    await waitFor(() => screen.getAllByTestId('notify')[0]);
    fireEvent.click(screen.getAllByTestId('notify')[0]);
    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith(
      'Notification preferences updated',
      expect.any(Object)
    );
  });

  it('shows failure toast when notification update fails', async () => {
    (requireCurrentUser as any).mockResolvedValue({
      id: 'u1',
      email: 'user@example.com',
    });
    (getUserProfile as any).mockResolvedValue({
      name: 'User',
      notifications: {},
    });
    (update as any).mockRejectedValue(new Error('fail'));

    render(<Account />, { wrapper: MemoryRouter });

    await waitFor(() => screen.getAllByTestId('notify')[0]);
    fireEvent.click(screen.getAllByTestId('notify')[0]);
    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(handleError).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Update failed', expect.any(Object));
  });
});
