export { createThread } from "./createThread";
export { getThreads } from "./getThreads";
export { getThread } from "./getThread";
export { generateThreadConversation } from "./generateConversation";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "../messageService/utils";

export async function archiveThread({
  threadId,
}: {
  threadId: string;
}): Promise<boolean> {
  const { data, error } = await supabase
    .from("threads")
    .update({ status: "Archived" })
    .eq("id", threadId)
    .select()
    .single();
  if (error) handleError(error, "archiveThread");
  if (data?.status !== "Archived") {
    throw new Error(
      "Failed to archive thread. This may be due to a Row Level Security (RLS) policy preventing the update.",
    );
  }
  return true;
}

export async function unarchiveThread({
  threadId,
}: {
  threadId: string;
}): Promise<boolean> {
  const { data, error } = await supabase
    .from("threads")
    .update({ status: "Open" })
    .eq("id", threadId)
    .select()
    .single();
  if (error) handleError(error, "unarchiveThread");
  if (data?.status !== "Open") {
    throw new Error(
      "Failed to unarchive thread. This may be due to a Row Level Security (RLS) policy preventing the update.",
    );
  }
  return true;
}

export async function updateThreadTitle({
  threadId,
  title,
}: {
  threadId: string;
  title: string;
}): Promise<boolean> {
  const { data, error } = await supabase
    .from("threads")
    .update({ title })
    .eq("id", threadId)
    .select()
    .single();
  if (error) handleError(error, "updateThreadTitle");
  if (data?.title !== title) {
    throw new Error(
      "Failed to update thread title. This may be due to a Row Level Security (RLS) policy preventing the update.",
    );
  }
  return true;
}
