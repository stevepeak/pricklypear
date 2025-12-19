import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ConnectedUser } from '@/types/connection';

vi.mock('sonner', () => ({ toast: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1' } }),
}));

let refreshConnections = vi.fn();
const supabaseInvoke = vi.fn();

vi.mock('@/hooks/useConnections', () => ({
  useConnections: () => ({
    connections: [
      {
        id: 'c1',
        status: 'pending',
        user_id: 'user2',
        connected_user_id: 'user1',
        name: 'John',
        otherUserId: 'user2',
        updated_at: new Date().toISOString(),
      },
    ],
    acceptedConnections: [] as ConnectedUser[],
    isLoading: false,
    refreshConnections,
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: (...args: any[]) => supabaseInvoke(...args) },
  },
}));

vi.mock('@/services/users/userService.js', () => ({
  updateConnectionStatus: vi.fn().mockResolvedValue(true),
  disableConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/services/connections/manageConnections.js', () => ({
  deleteConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/components/connections/InviteConnectionDialog', () => ({
  default: ({ open, onInvite }: any) =>
    open ? (
      <button
        data-testid="send-invite"
        onClick={() => onInvite('friend@example.com')}
      >
        Send
      </button>
    ) : null,
}));
vi.mock('@/components/connections/PendingConnectionsList', () => ({
  default: ({ onUpdateStatus }: any) => (
    <button
      data-testid="accept"
      onClick={() => onUpdateStatus('c1', 'accepted')}
    >
      Accept
    </button>
  ),
}));
vi.mock('@/components/connections/OutgoingConnectionsList', () => ({
  default: ({ onDelete }: any) => (
    <button data-testid="delete" onClick={() => onDelete('c1')}>
      Delete
    </button>
  ),
}));
vi.mock('@/components/connections/AcceptedConnectionsList', () => ({
  default: ({ onDisable }: any) => (
    <button data-testid="disable" onClick={() => onDisable('c1')}>
      Disable
    </button>
  ),
}));
vi.mock('@/components/connections/DisabledConnectionsList', () => ({
  default: ({ onUpdateStatus }: any) => (
    <button
      data-testid="enable"
      onClick={() => onUpdateStatus('c1', 'accepted')}
    >
      Enable
    </button>
  ),
}));
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) =>
    asChild ? children : <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <button
      data-testid={`checkbox-${children}`}
      onClick={() => onCheckedChange(!checked)}
    >
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onSelect }: any) => (
    <button data-testid="menu-item" onClick={onSelect}>
      {children}
    </button>
  ),
}));
vi.mock('@/components/ui/dialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- Required for vi.mock
  const React = require('react');
  const DialogContext = React.createContext({});

  return {
    Dialog: ({ children, open, onOpenChange }: any) => {
      const trigger = React.Children.toArray(children).find(
        (child: any) =>
          React.isValidElement(child) &&
          (child.type?.displayName === 'DialogTrigger' ||
            child.type?.name?.includes('Trigger'))
      );
      const content = React.Children.toArray(children).filter(
        (child: any) =>
          !(
            React.isValidElement(child) &&
            (child.type?.displayName === 'DialogTrigger' ||
              child.type?.name?.includes('Trigger'))
          )
      );
      return (
        <DialogContext.Provider value={{ onOpenChange }}>
          {trigger}
          {open ? content : null}
        </DialogContext.Provider>
      );
    },
    DialogTrigger: ({ children, asChild }: any) => {
      const { onOpenChange } = React.useContext(DialogContext);
      const handleClick = () => {
        onOpenChange?.(true);
      };
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onClick: (e: any) => {
            children.props.onClick?.(e);
            handleClick();
          },
        });
      }
      return <div onClick={handleClick}>{children}</div>;
    },
    DialogContent: ({ children }: any) => (
      <div data-testid="dialog">{children}</div>
    ),
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <h2>{children}</h2>,
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    DialogClose: ({ children, asChild }: any) =>
      asChild ? children : <button>{children}</button>,
  };
});

const { toast } = await import('sonner');
const { updateConnectionStatus, disableConnection } =
  await import('@/services/users/userService.js');
const { deleteConnection } =
  await import('@/services/connections/manageConnections.js');
const Connections = (await import('./Connections')).default;

describe('Connections page', () => {
  beforeEach(() => {
    refreshConnections = vi.fn();
    supabaseInvoke.mockReset();
    vi.clearAllMocks();
  });

  it('opens invite dialog and sends invite', async () => {
    supabaseInvoke.mockResolvedValue({
      data: { success: true, message: '' },
      error: null,
    });
    render(<Connections />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getAllByText('Add Connection')[0]);
    fireEvent.click(await screen.findByTestId('send-invite'));
    await waitFor(() => expect(supabaseInvoke).toHaveBeenCalled());
    expect(refreshConnections).toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Invitation sent');
  });

  it('shows error toast when invite fails', async () => {
    supabaseInvoke.mockResolvedValue({
      data: { success: false, message: 'No' },
      error: null,
    });
    render(<Connections />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getAllByText('Add Connection')[0]);
    fireEvent.click(await screen.findByTestId('send-invite'));
    await waitFor(() => expect(supabaseInvoke).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith('Error', expect.any(Object));
  });

  it('updates and disables connections', async () => {
    render(<Connections />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getAllByTestId('accept')[0]);
    await waitFor(() => expect(updateConnectionStatus).toHaveBeenCalled());
    fireEvent.click(screen.getAllByTestId('disable')[0]);
    await waitFor(() => expect(disableConnection).toHaveBeenCalled());
    fireEvent.click(screen.getAllByTestId('delete')[0]);
    await waitFor(() => expect(deleteConnection).toHaveBeenCalled());
  });
});
