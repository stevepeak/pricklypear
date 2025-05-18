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
};
