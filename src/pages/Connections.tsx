import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { DialogTrigger, Dialog } from "@/components/ui/dialog";
import React from "react";
import { toast } from "sonner";

import {
  ConnectionStatus,
  updateConnectionStatus,
  disableConnection,
  InviteResponse,
} from "@/services/users/userService.js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import PendingConnectionsList from "@/components/connections/PendingConnectionsList";
import OutgoingConnectionsList from "@/components/connections/OutgoingConnectionsList";
import AcceptedConnectionsList from "@/components/connections/AcceptedConnectionsList";
import DisabledConnectionsList from "@/components/connections/DisabledConnectionsList";
import InviteConnectionDialog from "@/components/connections/InviteConnectionDialog";
import { deleteConnection } from "@/services/connections/manageConnections.js";

import { useConnections } from "@/hooks/useConnections";

const Connections = () => {
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const { connections, acceptedConnections, isLoading, refreshConnections } =
    useConnections();

  // Filter connections by status and relation to current user
  const pendingIncomingConnections = connections.filter(
    (c) => c.status === "pending" && c.id !== user.id,
  );

  const pendingOutgoingConnections = connections.filter(
    (c) => c.status === "pending" && c.id === user.id,
  );

  const disabledConnections = connections.filter(
    (c) => c.status === "disabled",
  );

  const handleInvite = async (email: string) => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Invalid email", {
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "invite-by-email",
        {
          body: { userId: user.id, email },
        },
      );

      if (error) {
        throw error;
      }

      const response = data as InviteResponse;

      if (response.success) {
        setIsDialogOpen(false);
        await refreshConnections();

        toast("Invitation sent", {
          description: `You've sent a connection invitation to ${email}`,
        });
      } else {
        toast("Error", {
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error inviting connection:", error);
      toast("Error", {
        description: "Failed to send invitation",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateStatus = async (
    connectionId: string,
    status: ConnectionStatus,
  ) => {
    try {
      await updateConnectionStatus(connectionId, status);
      await refreshConnections();

      toast(
        status === "accepted" ? "Connection accepted" : "Connection declined",
      );
    } catch (error) {
      console.error("Error updating connection:", error);
      toast("Error", {
        description: "Failed to update connection",
      });
    }
  };

  const handleDisableConnection = async (connectionId: string) => {
    try {
      await disableConnection(connectionId);
      await refreshConnections();

      toast("Connection disabled", {
        description: "This connection has been disabled",
      });
    } catch (error) {
      console.error("Error disabling connection:", error);
      toast("Error", {
        description: "Failed to disable connection",
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      await deleteConnection(connectionId);
      await refreshConnections();
      toast("Request cancelled", {
        description: "The connection request has been cancelled.",
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
      toast("Error", {
        description: "Failed to cancel connection request.",
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
    <div className="p-6">
      <div className="flex justify-end mb-8">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
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
      </div>

      <PendingConnectionsList
        connections={pendingIncomingConnections}
        onUpdateStatus={handleUpdateStatus}
      />

      <AcceptedConnectionsList
        connections={acceptedConnections}
        onDisable={handleDisableConnection}
        onOpenInviteDialog={() => setIsDialogOpen(true)}
      />

      <OutgoingConnectionsList
        connections={pendingOutgoingConnections}
        onDelete={handleDeleteConnection}
      />

      <DisabledConnectionsList
        connections={disabledConnections}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Connections;
