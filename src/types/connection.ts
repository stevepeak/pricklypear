import { Database } from "@/integrations/supabase/types";

export type ConnectionStatus = Database["public"]["Enums"]["connection_status"];

export interface InviteResponse {
  error?: Error;
  success: boolean;
  message: string;
}

export type Connection = Database["public"]["Tables"]["connections"]["Row"] & {
  /** The name of the connected user */
  name: string | null;
  /** The ID of the connected user */
  otherUserId: string;
};
