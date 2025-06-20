import { supabase } from "@/integrations/supabase/client";
import { ConnectedUser } from "@/types/connection";
import { requireCurrentUser } from "@/utils/authCache";
import { handleError } from "@/services/messageService/utils";

// Get all connections for the current user (both as sender and receiver)
export const getConnections = async (): Promise<ConnectedUser[]> => {
  try {
    const user = await requireCurrentUser();

    const userId = user.id;

    // Get my connections
    const { data: connections, error: connectionError } = await supabase
      .from("connections")
      .select(
        `
        *,
        connected_profile:profiles!connected_user_id ( name ),
        user_profile:profiles!user_id ( name )
      `,
      )
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

    if (connectionError)
      return handleError(connectionError, "fetching connections") ? [] : [];

    if (!connections.length) return [];

    const result = connections.map((c) => {
      const otherUserId =
        c.user_id === userId ? c.connected_user_id : c.user_id;
      const name =
        c.user_id === userId ? c.connected_profile?.name : c.user_profile?.name;
      return {
        id: otherUserId,
        createdByMe: c.user_id === userId,
        name,
        status: c.status,
        connection_id: c.id,
        created_at: c.created_at,
        updated_at: c.updated_at,
        invitee_email: c.invitee_email,
      };
    });

    return result;
  } catch (error) {
    return handleError(error, "fetching connections") ? [] : [];
  }
};
