import type { ThreadTopic } from "./thread";
import type { Database } from "@/integrations/supabase/types";
/**
 * Represents a message in a thread
 * @typedef {Object} Message
 * @property {string} id - Unique identifier for the message
 * @property {string} text - The content of the message
 * @property {string} senderName - Name of the person who sent the message
 * @property {Date} timestamp - When the message was sent
 * @property {string} threadId - ID of the thread this message belongs to
 * @property {boolean} [isCurrentUser] - Flag to identify if the message was sent by the current user
 * @property {boolean} [isRead] - Whether the message has been read
 * @property {Date|null} [readAt] - When the message was read, if applicable
 * @property {Database["public"]["Enums"]["message_type"]} type - Type of message (e.g., 'user_message', 'request_close')
 * @property {Record<string, unknown>|null} details - Additional message metadata
 */
export type Message = {
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
  threadId: string;
  isCurrentUser?: boolean;
  isRead?: boolean;
  readAt?: Date | null;
  type: Database["public"]["Enums"]["message_type"];
  details: Record<string, unknown> | null;
};

export type ListMessage = {
  threadId: string;
  threadTitle: string;
  threadTopic: ThreadTopic;
  threadType: Database["public"]["Enums"]["thread_type"];
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
  type: Message["type"];
  readAt: Date | null;
};
