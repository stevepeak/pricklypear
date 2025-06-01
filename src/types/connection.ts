import { Database } from "@/integrations/supabase/types";

export type ConnectionStatus = Database["public"]["Enums"]["connection_status"];

export interface InviteResponse {
  error?: Error;
  success: boolean;
  message: string;
}

/**
 * Represents a connected user in the system.
 * This type extends the database connection row type, excluding the user ID fields,
 * and adds additional metadata about the connection.
 *
 * @typedef {Object} ConnectedUser
 * @property {string} id - The unique identifier for the connected user
 * @property {string} connection_id - The unique identifier for the connection
 * @property {string|null} name - The display name of the connected user
 * @property {string|null} invitee_email - The email address of the invited user
 * @property {ConnectionStatus} status - The current status of the connection (e.g. pending, accepted, disabled)
 *
 */
export type ConnectedUser = Omit<
  Database["public"]["Tables"]["connections"]["Row"],
  "connected_user_id" | "user_id"
> & {
  /** The ID of the connection */
  connection_id: string;
  /** The name of the connected user */
  name: string | null;
};
