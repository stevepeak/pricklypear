import { supabase } from "@/integrations/supabase/client";

export async function deleteDocument(
  documentId: string,
  userId: string,
): Promise<void> {
  // Get document to find file path
  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", documentId)
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch document: ${fetchError.message}`);
  }

  // Delete from storage
  if (document.file_path) {
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document.file_path]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to delete document: ${deleteError.message}`);
  }
}
