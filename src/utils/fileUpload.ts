import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export async function uploadThreadImage(
  file: File,
  threadId: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${threadId}/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('threads')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  return filePath;
}
