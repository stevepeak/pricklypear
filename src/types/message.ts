import type { ThreadTopic } from "./thread";
import type { Database } from "@/integrations/supabase/types";
/**
 * Represents a message in a thread
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {string} text - The content of the message
 * @property {{id: string, name: string}|null} sender - Sender information (null if sent by the current user)
 * @property {Date} timestamp - When the message was sent
 * @property {string} threadId - ID of the thread this message belongs to
 * @property {boolean} [isCurrentUser] - Flag to identify if the message was sent by the current user
 * @property {boolean} [isRead] - Whether the message has been read
 * @property {Date|null} [readAt] - When the message was read, if applicable
 * @property {Database["public"]["Enums"]["message_type"]} type - Type of message (e.g., 'user_message', 'request_close')
 * @property {Object} details - Additional message metadata
 * @property {string[]|null} [details.assets] - Array of asset names for any assets attached to the message
 *
 */
export type Message = {
  id: string;
  text: string;
  sender: { id: string; name: string };
  timestamp: Date;
  threadId: string;
  isCurrentUser?: boolean;
  isRead?: boolean;
  readAt?: Date | null;
  type: Database["public"]["Enums"]["message_type"];
  details: {
    assets?: string[] | null;
  };
};

export type ListMessage = {
  threadId: string;
  threadTitle: string;
  threadTopic: ThreadTopic;
  threadType: Database["public"]["Enums"]["thread_type"];
  id: string;
  text: string;
  sender: { id: string; name: string };
  timestamp: Date;
  type: Message["type"];
  readAt: Date | null;
};
