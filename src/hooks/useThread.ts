import { useQuery } from "@tanstack/react-query";
import { getThread } from "@/services/threadService";

export const useThread = (threadId: string | undefined) => {
  return useQuery({
    queryKey: ["thread", threadId],
    queryFn: async () => {
      if (!threadId) return null;
      return getThread(threadId);
    },
    enabled: !!threadId,
  });
};
