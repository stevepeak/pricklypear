import { supabase } from '@/integrations/supabase/client';
import type { Document } from '@/types/document';

export async function getDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }

  return data || [];
}

export async function getDocument(
  documentId: string,
  userId: string
): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Document not found
    }
    throw new Error(`Failed to fetch document: ${error.message}`);
  }

  return data;
}
