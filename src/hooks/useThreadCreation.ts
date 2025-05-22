import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createThread } from "@/services/threadService";
import type { User } from "@supabase/supabase-js";
import type { Thread, ThreadTopic } from "@/types/thread";

export const useThreadCreation = (
  onThreadCreated: (thread: Thread) => void,
  onClose: () => void,
) => {
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<ThreadTopic | undefined>(
    undefined,
  );
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreateThread = async (user: User, requireAiApproval: boolean) => {
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

    if (!selectedContactId) {
      toast("Contact required", {
        description: "Please select a contact for the thread",
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

    const newThread = await createThread(
      trimmedTitle,
      [selectedContactId],
      selectedTopic,
      { requireAiApproval },
    );

    setIsCreating(false);

    if (newThread) {
      onThreadCreated(newThread);
      setNewThreadTitle("");
      setSelectedContactId("");
      setSelectedTopic(undefined);
      onClose();
      // Redirect the user to the newly-created thread
      navigate(`/threads/${newThread.id}`);

      toast("Thread created", {
        description: `"${trimmedTitle}" has been created successfully.`,
      });
    } else {
      toast("Error", {
        description: "Failed to create thread. Please try again.",
      });
    }
  };

  return {
    newThreadTitle,
    setNewThreadTitle,
    selectedContactId,
    setSelectedContactId,
    selectedTopic,
    setSelectedTopic,
    isCreating,
    handleCreateThread,
  };
};
