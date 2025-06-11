import { supabase } from '@/integrations/supabase/client';

export async function updateDocumentTitle(
  documentId: string,
  newTitle: string
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ filename: newTitle })
    .eq('id', documentId);

  if (error) {
    throw new Error(`Failed to update document title: ${error.message}`);
  }
}
