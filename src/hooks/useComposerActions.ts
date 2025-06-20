import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { saveMessage } from "@/services/messageService/save-message";
import { getMessages } from "@/services/messageService/get-messages";
import { archiveThread, unarchiveThread } from "@/services/threadService";
import { handleError } from "@/services/messageService/utils";
import { useConnections } from "@/hooks/useConnections";
import type { Thread } from "@/types/thread";
import type { Message } from "@/types/message";

interface UseComposerActionsProps {
  thread: Thread;
  loadMessages: () => Promise<Message[]>;
}

export function useComposerActions({
  thread,
  loadMessages,
}: UseComposerActionsProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { connections } = useConnections();
  const navigate = useNavigate();

  const handleCopy = async () => {
    try {
      const messages = await getMessages({
        threadId: thread.id,
        connections,
      });
      if (!messages.length) {
        toast("Nothing to copy", {
          description: "No messages found in this thread.",
        });
        return;
      }
      const formatted = messages
        .map((msg) => {
          const date =
            msg.timestamp instanceof Date
              ? msg.timestamp
              : new Date(msg.timestamp);
          const time = date.toLocaleString();
          return `[${time}] ${msg.sender?.name || "someone"}: ${msg.text}`;
        })
        .join("\n\n");
      await navigator.clipboard.writeText(formatted);
      toast("Copied!", {
        description: "Thread messages copied to clipboard.",
      });
    } catch (err) {
      handleError(err, "copyThreadClipboard");
      toast("Copy failed", {
        description: "Failed to copy messages to clipboard.",
      });
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    const success = await archiveThread({ threadId: thread.id });
    if (success) {
      toast("Thread archived", {
        description: "This thread has been archived.",
      });
      await loadMessages();
      navigate("/threads");
    } else {
      toast("Archive failed", {
        description: "Could not archive the thread.",
      });
    }
    setIsArchiving(false);
  };

  const handleUnarchive = async () => {
    setIsUnarchiving(true);
    const success = await unarchiveThread({ threadId: thread.id });
    if (success) {
      toast("Thread unarchived", {
        description: "This thread has been unarchived.",
      });
      await loadMessages();
    } else {
      toast("Unarchive failed", {
        description: "Could not unarchive the thread.",
      });
    }
    setIsUnarchiving(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!thread?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${thread.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("threads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // TODO soon we will not send message as is but include as attachment to a text message
      const success = await saveMessage({
        text: "Uploaded an image",
        threadId: thread.id,
        type: "user_message",
        details: {
          assets: [filePath],
        },
      });

      if (success) {
        await loadMessages();
      }
    } catch (err) {
      handleError(err, "uploadImage");
      toast("Upload failed", {
        description: "Failed to upload image.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isArchiving,
    isUnarchiving,
    isUploading,
    handleCopy,
    handleArchive,
    handleUnarchive,
    handleImageUpload,
  };
}
