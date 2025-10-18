import { supabase } from '@/integrations/supabase/client';
import type { DocumentUploadResponse } from '@/types/document';

export async function uploadDocument(args: {
  file: File;
  userId: string;
}): Promise<DocumentUploadResponse> {
  const { file, userId } = args;
  try {
    // Upload to Supabase Storage
    const fileName = `${userId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Call Edge Function to extract text
    const { data: extractData, error: extractError } =
      await supabase.functions.invoke('extract-doc-text', {
        body: {
          file_path: uploadData.path,
          filename: file.name,
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

    if (extractError) {
      // Clean up uploaded file if text extraction fails
      await supabase.storage.from('documents').remove([uploadData.path]);
      throw new Error(`Text extraction failed: ${extractError.message}`);
    }

    return extractData as DocumentUploadResponse;
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Upload failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
