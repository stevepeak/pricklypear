import { supabase } from "@/integrations/supabase/client";

export async function updateDocumentTitle(
  documentId: string,
  userId: string,
  newTitle: string,
): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update({ original_filename: newTitle })
    .eq("id", documentId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to update document title: ${error.message}`);
  }
}
