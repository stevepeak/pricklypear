import { supabase } from '@/integrations/supabase/client';
import type { DocumentLabel } from '@/types/document';

export async function updateDocumentLabels(
  documentId: string,
  labels: DocumentLabel[]
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ labels })
    .eq('id', documentId);

  if (error) {
    throw new Error(`Failed to update document labels: ${error.message}`);
  }
}
