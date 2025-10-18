/**
 * Transforms raw thread participants data into a clean array of participant names.
 * Filters out the current user unless the user is an admin viewing a support thread.
 */
export function transformThreadParticipants(args: {
  participants: Array<{
    profiles: {
      id: string;
      name: string;
    } | null;
  }>;
  currentUserId: string;
  isAdmin: boolean;
  threadType: string;
}): string[] {
  const { participants, currentUserId, isAdmin, threadType } = args;

  return participants
    .map((item) => ({
      id: item.profiles?.id,
      name: item.profiles?.name,
    }))
    .filter((participant) => {
      if (!participant.id || !participant.name) return false;
      // If admin viewing support thread, include all participants
      if (isAdmin && threadType === 'customer_support') return true;
      // Otherwise exclude current user
      return participant.id !== currentUserId;
    })
    .map((participant) => participant.name as string);
}
