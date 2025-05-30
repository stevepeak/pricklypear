import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createThread,
  generateThreadConversation,
} from "@/services/threadService";
import type { User } from "@supabase/supabase-js";
import type { Thread, ThreadTopic } from "@/types/thread";

export const useThreadCreation = (
  onThreadCreated: (thread: Thread) => void,
  onClose: () => void,
) => {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ThreadTopic | undefined>(
    undefined,
  );
  const [requireAiApproval, setRequireAiApproval] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateThread = async (user: User) => {
    if (!user) {
      toast("Authentication required", {
        description: "Please sign in to create threads",
      });
      navigate("/auth");
      return;
    }

    const trimmedTitle = newThreadTitle.trim();

    if (!trimmedTitle) {
      toast("Title required", {
        description: "Please enter a title for the thread",
      });
      return;
    }

    if (selectedContactIds.length === 0) {
      toast("Participants required", {
        description: "Please select at least one participant for the thread",
      });
      return;
    }

    if (!selectedTopic) {
      toast("Topic required", {
        description: "Please select a topic for the thread",
      });
      return;
    }

    setIsCreating(true);

    const newThread = await createThread({
      title: trimmedTitle,
      ai: false,
      participantIds: selectedContactIds,
      topic: selectedTopic,
      controls: { requireAiApproval },
    });

    setIsCreating(false);

    if (newThread) {
      resetFormAndNavigate(newThread);
    } else {
      toast("Error", {
        description: "Failed to create thread. Please try again.",
      });
    }
  };

  const handleCreateAIChat = async (user: User) => {
    setIsCreating(true);

    const newThread = await createThread({
      title: "AI Chat",
      ai: true,
      topic: "other",
    });

    setIsCreating(false);

    if (newThread) {
      resetFormAndNavigate(newThread);
    } else {
      toast("Error", {
        description: "Failed to create thread. Please try again.",
      });
    }
  };

  const handleGenerateThread = async (user: User) => {
    if (!user) {
      toast("Authentication required", {
        description: "Please sign in to create threads",
      });
      navigate("/auth");
      return;
    }

    const trimmedTitle = newThreadTitle.trim();

    if (!trimmedTitle) {
      toast("Title required", {
        description: "Please enter a title for the thread",
      });
      return;
    }

    if (selectedContactIds.length === 0) {
      toast("Participants required", {
        description: "Please select at least one participant for the thread",
      });
      return;
    }

    if (!selectedTopic) {
      toast("Topic required", {
        description: "Please select a topic for the thread",
      });
      return;
    }

    setIsCreating(true);

    const newThread = await createThread({
      title: trimmedTitle,
      ai: false,
      participantIds: selectedContactIds,
      topic: selectedTopic,
      controls: { requireAiApproval },
    });

    if (newThread) {
      await generateThreadConversation({
        threadId: newThread.id,
      });
      setIsCreating(false);
      resetFormAndNavigate(newThread);
    } else {
      setIsCreating(false);
      toast("Error", {
        description: "Failed to create thread. Please try again.",
      });
    }
  };

  /**
   * Create a brand-new customer-support thread.
   *
   * Requirements:
   * - No participants are selected manually; the
   *   backend resolver will automatically add the
   *   support team and the current user.
   * - The thread is always locked for support.
   */
  const handleCreateSupportThread = async (user: User) => {
    if (!user) {
      toast("Authentication required", {
        description: "Please sign in to contact support",
      });
      navigate("/auth");
      return;
    }

    setIsCreating(true);

    const newThread = await createThread({
      title: "Customer Support",
      ai: false,
      topic: "customer_support",
      controls: {
        // Force AI approval no matter what
        requireAiApproval: true,
        supportLocked: true,
      },
    });

    setIsCreating(false);

    if (newThread) {
      resetFormAndNavigate(newThread);
    } else {
      toast("Error", {
        description:
          "Failed to open a support conversation. Please try again later.",
      });
    }
  };

  const resetFormAndNavigate = (thread: Thread) => {
    onThreadCreated(thread);
    setNewThreadTitle("");
    setSelectedContactIds([]);
    setRequireAiApproval(true);
    setSelectedTopic(undefined);
    onClose();
    // Redirect the user to the newly-created thread
    navigate(`/threads/${thread.id}`);

    toast("Thread created", {
      description: `"${thread.title}" has been created successfully.`,
    });
  };

  return {
    newThreadTitle,
    setNewThreadTitle,
    selectedContactIds,
    setSelectedContactIds,
    selectedTopic,
    setSelectedTopic,
    isCreating,
    requireAiApproval,
    setRequireAiApproval,
    handleCreateThread,
    handleCreateAIChat,
    handleGenerateThread,
    handleCreateSupportThread,
  };
};
