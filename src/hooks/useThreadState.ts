import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getThread } from "@/services/threadService";
import type { Thread } from "@/types/thread";

export const useThreadState = (threadId: string | undefined) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const loadThread = async () => {
    if (!threadId) {
      navigate("/threads");
      return null;
    }

    const threadData = await getThread(threadId);
    if (!threadData) {
      toast("Error", {
        description: "Thread not found",
      });
      navigate("/threads");
      return null;
    }

    setThread(threadData);
    return threadData;
  };

  return {
    thread,
    setThread,
    isLoading,
    setIsLoading,
    loadThread,
  };
};
