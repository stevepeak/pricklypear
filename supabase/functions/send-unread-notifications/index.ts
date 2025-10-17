import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseServiceClient } from '../utils/supabase.ts';
import sendEmail from '../utils/send-email.ts';
import { renderEmail } from '../utils/email-render.ts';
import { PricklyPearUnreadMessagesEmail } from '../templates/unread-messages.tsx';
import { handleError } from '../utils/handle-error.ts';
import { res } from '../utils/response.ts';

type UserWithUnread = {
  id: string;
  name: string;
  email: string;
};

type ThreadUnreadInfo = {
  id: string;
  title: string;
  unreadCount: number;
  lastMessageAt: string;
  participants: string[];
};

/**
 * Fetches users who are inactive and have unread messages
 */
async function getInactiveUsersWithUnread() {
  const supabase = getSupabaseServiceClient();

  // Query for users who:
  // 1. Haven't been active in the last 15 minutes
  // 2. Haven't received a notification in the last hour
  // 3. Have email notifications enabled for new messages
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, name, email, notifications')
    .lt('last_activity_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .or(
      `last_notification_sent_at.is.null,last_notification_sent_at.lt.${new Date(Date.now() - 60 * 60 * 1000).toISOString()}`
    )
    .not('email', 'is', null);

  if (error) {
    console.error('Error fetching inactive users:', error);
    return [];
  }

  // Filter users who have email notifications enabled
  const eligibleUsers = (users || []).filter((user) => {
    const notifications = user.notifications as Record<
      string,
      Record<string, boolean>
    > | null;
    return notifications?.newMessages?.email === true;
  });

  return eligibleUsers as UserWithUnread[];
}

/**
 * Fetches unread messages for a user, grouped by thread
 */
async function getUnreadThreadsForUser(args: { userId: string }) {
  const { userId } = args;
  const supabase = getSupabaseServiceClient();

  // Get all messages that don't have a read receipt for this user
  const { data: unreadMessages, error: messagesError } = await supabase
    .from('messages')
    .select(
      `
      id,
      text,
      timestamp,
      thread_id,
      user_id,
      thread:threads!inner(
        id,
        title
      )
    `
    )
    .neq('user_id', userId) // Don't include user's own messages
    .order('timestamp', { ascending: false });

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
    return [];
  }

  // Filter out messages that have read receipts
  const { data: readReceipts, error: receiptsError } = await supabase
    .from('message_read_receipts')
    .select('message_id')
    .eq('user_id', userId)
    .not('read_at', 'is', null);

  if (receiptsError) {
    console.error('Error fetching read receipts:', receiptsError);
    return [];
  }

  const readMessageIds = new Set(readReceipts?.map((r) => r.message_id) || []);
  const unread = (unreadMessages || []).filter(
    (msg) => !readMessageIds.has(msg.id)
  );

  // Check if user is a participant in each thread
  const { data: participations, error: participationError } = await supabase
    .from('thread_participants')
    .select('thread_id')
    .eq('user_id', userId);

  if (participationError) {
    console.error('Error fetching thread participations:', participationError);
    return [];
  }

  const participantThreadIds = new Set(
    participations?.map((p) => p.thread_id) || []
  );

  // Filter to only threads where user is a participant
  const userUnreadMessages = unread.filter((msg) =>
    participantThreadIds.has(msg.thread_id)
  );

  if (userUnreadMessages.length === 0) {
    return [];
  }

  // Group by thread
  const threadMap = new Map<string, typeof userUnreadMessages>();
  for (const msg of userUnreadMessages) {
    const existing = threadMap.get(msg.thread_id) || [];
    threadMap.set(msg.thread_id, [...existing, msg]);
  }

  // Get participant names for each thread
  const threadInfoPromises = Array.from(threadMap.entries()).map(
    async ([threadId, messages]) => {
      // Get all participants in this thread
      const { data: threadParticipants } = await supabase
        .from('thread_participants')
        .select(
          `
        user:profiles!inner(
          id,
          name
        )
      `
        )
        .eq('thread_id', threadId)
        .neq('user_id', userId); // Exclude the current user

      const participantNames =
        threadParticipants?.map(
          (tp: { user: { id: string; name: string }[] }) => {
            const user = Array.isArray(tp.user) ? tp.user[0] : tp.user;
            return user.name;
          }
        ) || [];

      const lastMessage = messages[0]; // Already sorted by timestamp descending
      const timeDiff = Date.now() - new Date(lastMessage.timestamp).getTime();
      const lastMessageAt = formatTimeAgo(timeDiff);

      const thread = Array.isArray(lastMessage.thread)
        ? lastMessage.thread[0]
        : lastMessage.thread;

      return {
        id: threadId,
        title: thread.title,
        unreadCount: messages.length,
        lastMessageAt,
        participants: participantNames,
      } as ThreadUnreadInfo;
    }
  );

  return await Promise.all(threadInfoPromises);
}

/**
 * Format time difference in a human-readable way
 */
function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Send unread messages email to a user
 */
async function sendUnreadNotification(args: {
  user: UserWithUnread;
  threads: ThreadUnreadInfo[];
}) {
  const { user, threads } = args;

  const totalUnread = threads.reduce(
    (sum, thread) => sum + thread.unreadCount,
    0
  );

  const html = await renderEmail(PricklyPearUnreadMessagesEmail, {
    username: user.name,
    unreadCount: totalUnread,
    threads: threads.map((t) => ({
      id: t.id,
      title: t.title,
      unreadCount: t.unreadCount,
      lastMessageAt: t.lastMessageAt,
      participants: t.participants,
    })),
    dashboardLink: 'https://prickly.app/threads',
  });

  await sendEmail({
    userId: user.id,
    subject: `You have ${totalUnread} unread message${totalUnread !== 1 ? 's' : ''}`,
    html,
  });

  // Update last_notification_sent_at
  const supabase = getSupabaseServiceClient();
  await supabase
    .from('profiles')
    .update({ last_notification_sent_at: new Date().toISOString() })
    .eq('id', user.id);

  console.log(
    `Sent unread notification to ${user.email} (${totalUnread} messages in ${threads.length} threads)`
  );
}

/**
 * Main handler function
 */
export async function handler(req: Request) {
  if (req.method === 'OPTIONS') return res.cors();

  try {
    console.log('Starting unread notifications job...');

    const users = await getInactiveUsersWithUnread();
    console.log(`Found ${users.length} inactive users to check`);

    let emailsSent = 0;

    for (const user of users) {
      const threads = await getUnreadThreadsForUser({ userId: user.id });

      if (threads.length > 0) {
        await sendUnreadNotification({ user, threads });
        emailsSent++;
      }
    }

    console.log(
      `Unread notifications job completed. Sent ${emailsSent} emails.`
    );

    return res.ok({
      success: true,
      message: `Processed ${users.length} users, sent ${emailsSent} emails`,
      emailsSent,
    });
  } catch (error) {
    console.error('Error in send-unread-notifications:', error);
    handleError(error);
    return res.serverError(error);
  }
}

serve(handler);
