import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/types/connection";
import { requireCurrentUser } from "@/utils/authCache";
import { handleError } from "@/services/messageService/utils";

// Get all connections for the current user (both as sender and receiver)
export const getConnections = async (): Promise<Connection[]> => {
  try {
    const user = await requireCurrentUser();

    const userId = user.id;

    // Get my connections
    const { data: connections, error: sentError } = await supabase
      .from("connections")
      .select(
        `
        *,
        connected_profile:connected_user_id ( name ),
        user_profile:user_id ( name )
      `,
      )
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);

    if (sentError)
      return handleError(sentError, "fetching connections") ? [] : [];

    if (!connections) return [];

    const result = connections.map((c) => {
      const otherUserId = c.user_id === userId ? c.connected_user_id : c.user_id;
      const name =
        c.user_id === userId
          ? (c.connected_profile as { name: string | null } | null)?.name
          : (c.user_profile as { name: string | null } | null)?.name;
      return {
        name: name ?? null,
        otherUserId,
        ...c,
      };
    });

    return result;
  } catch (error) {
    return handleError(error, "fetching connections") ? [] : [];
  }
};
