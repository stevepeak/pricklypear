import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUnreadCounts } from "@/services/messageService";
import { useRealtimeMessages } from "./useRealtimeMessages";

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [threadCounts, setThreadCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Initial load of unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user) {
        setTotalUnread(0);
        setThreadCounts({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const counts = await getAllUnreadCounts();
        const total = Object.values(counts).reduce(
          (sum, count) => sum + count,
          0,
        );
        setTotalUnread(total);
        setThreadCounts(counts);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCounts();
  }, [user]);

  // Subscribe to real-time updates
  useRealtimeMessages({
    onUnreadCountsUpdated: (total, counts) => {
      setTotalUnread(total);
      setThreadCounts(counts);
    },
  });

  return { totalUnread, threadCounts, isLoading };
};
