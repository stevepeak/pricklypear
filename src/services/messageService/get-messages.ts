import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';
import { Message } from '@/types/message';
import { handleError } from './utils.js';
import type { ConnectedUser } from '@/types/connection';

export const getMessages = async (args: {
  threadId: string;
  connections: ConnectedUser[];
}): Promise<Message[]> => {
  const { threadId, connections } = args;

  const user = await requireCurrentUser();

  try {
    // Fetch messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      handleError(messagesError, 'fetching messages');
      return [];
    }

    // Get unique user IDs from messages that aren't in connections and aren't the current user
    const userIdsNotInConnections = [
      ...new Set(
        (messagesData || [])
          .map((msg) => msg.user_id)
          .filter(
            (userId) =>
              userId !== user.id &&
              !connections.some((conn) => conn.id === userId)
          )
      ),
    ];

    // Fetch profiles for users not in connections (for support threads)
    let profilesMap = new Map<string, { id: string; name: string }>();
    if (userIdsNotInConnections.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIdsNotInConnections);

      if (profilesData) {
        profilesMap = new Map(
          profilesData.map((profile) => [profile.id, profile])
        );
      }
    }

    const messages = (messagesData || []).map((msg) => {
      let sender;
      if (msg.user_id === user.id) {
        sender = { id: user.id, name: 'You' };
      } else {
        // First try to find in connections (for regular threads)
        sender = connections.find((conn) => conn.id === msg.user_id);
        // If not found, use profile data from separate query (for support threads)
        if (!sender) {
          sender = profilesMap.get(msg.user_id);
        }
      }

      return {
        id: msg.id,
        text: (msg.text || '').trim(),
        sender,
        timestamp: new Date(msg.timestamp || ''),
        threadId: msg.thread_id || '',
        isCurrentUser: msg.user_id === user.id,
        type: msg.type,
        details: msg.details as Record<string, unknown>,
      };
    });

    return messages;
  } catch (error) {
    handleError(error, 'fetching messages');
    return [];
  }
};
