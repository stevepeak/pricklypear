import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/lib/tracking';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  error?: string;
  documentId?: string;
}

interface UseDocumentUploadResult extends UploadState {
  upload: (
    file: File,
    onComplete?: (documentId: string) => void
  ) => Promise<void>;
}

/**
 * Provides a reusable way to upload a document to Supabase storage,
 * invoke the extract-doc-text edge function, and track analytics.
 */
export function useDocumentUpload(): UseDocumentUploadResult {
  const { user } = useAuth();

  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });

  const upload = useCallback(
    async (file: File, onComplete?: (documentId: string) => void) => {
      if (!user) {
        setState({
          status: 'error',
          progress: 0,
          error: 'You must be signed in to upload documents.',
        });
        return;
      }

      setState({ status: 'uploading', progress: 0 });

      try {
        // 1. Upload file to storage -------------------------------------------------
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Move progress to 50 %
        setState({ status: 'processing', progress: 50 });

        // 2. Invoke edge function to extract text ----------------------------------
        const { data: extractData, error: extractError } =
          await supabase.functions.invoke('extract-doc-text', {
            body: {
              user_id: user.id,
              file_path: uploadData.path,
              filename: file.name,
            },
            headers: {
              Authorization: `Bearer ${
                (await supabase.auth.getSession()).data.session?.access_token ??
                ''
              }`,
            },
          });

        if (extractError) throw extractError;

        // 3. Analytics --------------------------------------------------------------
        trackEvent({ name: 'upload_document', user });

        // 4. Finish -----------------------------------------------------------------
        setState({
          status: 'success',
          progress: 100,
          documentId: extractData.document_id,
        });

        onComplete?.(extractData.document_id as string);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Document upload failed.';
        // eslint-disable-next-line no-console
        console.error('Document upload failed:', err);
        setState({
          status: 'error',
          progress: 0,
          error: message,
        });
      }
    },
    [user]
  );

  return {
    upload,
    ...state,
  };
}
