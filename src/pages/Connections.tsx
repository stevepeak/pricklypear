import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2, Search, ListFilter } from 'lucide-react';
import { DialogTrigger, Dialog } from '@/components/ui/dialog';
import React from 'react';
import { toast } from 'sonner';
import {
  SearchBar,
  SearchBarLeft,
  SearchBarRight,
} from '@/components/ui/search-bar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import {
  ConnectionStatus,
  updateConnectionStatus,
  disableConnection,
  InviteResponse,
} from '@/services/users/userService.js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

import PendingConnectionsList from '@/components/connections/PendingConnectionsList';
import OutgoingConnectionsList from '@/components/connections/OutgoingConnectionsList';
import AcceptedConnectionsList from '@/components/connections/AcceptedConnectionsList';
import DisabledConnectionsList from '@/components/connections/DisabledConnectionsList';
import InviteConnectionDialog from '@/components/connections/InviteConnectionDialog';
import { deleteConnection } from '@/services/connections/manageConnections.js';

import { useConnections } from '@/hooks/useConnections';

const Connections = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<ConnectionStatus[]>([]);
  const { user } = useAuth();

  const { connections, acceptedConnections, isLoading, refreshConnections } =
    useConnections();

  // Filter connections by status and relation to current user
  const pendingIncomingConnections = connections.filter(
    (c) => c.status === 'pending' && !c.createdByMe
  );

  const pendingOutgoingConnections = connections.filter(
    (c) => c.status === 'pending' && c.createdByMe
  );

  const disabledConnections = connections.filter(
    (c) => c.status === 'disabled'
  );

  const isFiltering = filterStatuses.length > 0;

  // Filter connections based on search and status filters
  const filteredAcceptedConnections = acceptedConnections.filter(
    (connection) => {
      const matchesSearch =
        connection.name?.toLowerCase().includes(search.toLowerCase()) ||
        connection.invitee_email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatuses.length === 0 || filterStatuses.includes('accepted');
      return matchesSearch && matchesStatus;
    }
  );

  const filteredPendingIncoming = pendingIncomingConnections.filter(
    (connection) => {
      const matchesSearch =
        connection.name?.toLowerCase().includes(search.toLowerCase()) ||
        connection.invitee_email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatuses.length === 0 || filterStatuses.includes('pending');
      return matchesSearch && matchesStatus;
    }
  );

  const filteredPendingOutgoing = pendingOutgoingConnections.filter(
    (connection) => {
      const matchesSearch =
        connection.name?.toLowerCase().includes(search.toLowerCase()) ||
        connection.invitee_email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatuses.length === 0 || filterStatuses.includes('pending');
      return matchesSearch && matchesStatus;
    }
  );

  const filteredDisabled = disabledConnections.filter((connection) => {
    const matchesSearch =
      connection.name?.toLowerCase().includes(search.toLowerCase()) ||
      connection.invitee_email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatuses.length === 0 || filterStatuses.includes('disabled');
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (status: ConnectionStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setFilterStatuses([]);
    setSearch('');
  };

  const handleInvite = async (email: string) => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast('Invalid email', {
        description: 'Please enter a valid email address',
      });
      return;
    }

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'invite-by-email',
        {
          body: { userId: user.id, email },
        }
      );

      if (error) {
        throw error;
      }

      const response = data as InviteResponse;

      if (response.success) {
        setIsDialogOpen(false);
        await refreshConnections();

        toast('Invitation sent');
      } else {
        toast('Error', {
          description: response.message,
        });
      }
    } catch (error) {
      console.error('Error inviting connection:', error);
      toast('Error', {
        description: 'Failed to send invitation',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateStatus = async (
    connectionId: string,
    status: ConnectionStatus
  ) => {
    try {
      await updateConnectionStatus(connectionId, status);
      await refreshConnections();

      toast(
        status === 'accepted' ? 'Connection accepted' : 'Connection declined'
      );
    } catch (error) {
      console.error('Error updating connection:', error);
      toast('Error', {
        description: 'Failed to update connection',
      });
    }
  };

  const handleDisableConnection = async (connectionId: string) => {
    try {
      await disableConnection(connectionId);
      await refreshConnections();

      toast('Connection disabled', {
        description: 'This connection has been disabled',
      });
    } catch (error) {
      console.error('Error disabling connection:', error);
      toast('Error', {
        description: 'Failed to disable connection',
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
      await refreshConnections();
      toast('Request cancelled', {
        description: 'The connection request has been cancelled.',
      });
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast('Error', {
        description: 'Failed to cancel connection request.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchBar>
        <SearchBarLeft>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            className="pl-9 pr-3 h-9 border-none shadow-none focus-visible:ring-0"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            aria-label="Search"
          />
        </SearchBarLeft>
        <SearchBarRight>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="focus-visible:ring-0"
              >
                <div className="relative">
                  <ListFilter />
                  {isFiltering && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuCheckboxItem
                checked={filterStatuses.includes('pending')}
                onCheckedChange={() => toggleStatus('pending')}
                onSelect={(e) => e.preventDefault()}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatuses.includes('accepted')}
                onCheckedChange={() => toggleStatus('accepted')}
                onSelect={(e) => e.preventDefault()}
              >
                Accepted
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatuses.includes('disabled')}
                onCheckedChange={() => toggleStatus('disabled')}
                onSelect={(e) => e.preventDefault()}
              >
                Disabled
              </DropdownMenuCheckboxItem>
              {isFiltering && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-muted-foreground"
                    onSelect={clearFilters}
                  >
                    Clear filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <UserPlus className="h-4 w-4" />
                Add Connection
              </Button>
            </DialogTrigger>
            <InviteConnectionDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onInvite={handleInvite}
              isInviting={isInviting}
            />
          </Dialog>
        </SearchBarRight>
      </SearchBar>

      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Invite Friends & Family
          </h3>
          <p className="text-sm text-blue-800">
            Add friends, family, bonus parents, and kids to join conversations
            for free. They can participate in threads you invite them to and
            stay connected without any cost.
          </p>
        </div>

        <PendingConnectionsList
          connections={filteredPendingIncoming}
          onUpdateStatus={handleUpdateStatus}
        />

        <AcceptedConnectionsList
          connections={filteredAcceptedConnections}
          onDisable={handleDisableConnection}
          onOpenInviteDialog={() => setIsDialogOpen(true)}
        />

        <OutgoingConnectionsList
          connections={filteredPendingOutgoing}
          onDelete={handleDeleteConnection}
        />

        <DisabledConnectionsList
          connections={filteredDisabled}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {isFiltering && (
        <div className="flex justify-center items-center border-t gap-2 text-xs text-muted-foreground">
          <Button
            variant="link"
            className="text-muted-foreground text-xs"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Connections;
