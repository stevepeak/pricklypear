import { Database } from "@/integrations/supabase/types";

export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;

  threadId?: string;

  // Flag to identify current user's messages
  isCurrentUser?: boolean;

  // Read status information
  isRead?: boolean;
  readAt?: Date | null;

  // Message type (e.g., 'user_message', 'request_close', etc)
  type: Database["public"]["Enums"]["message_type"];
};
