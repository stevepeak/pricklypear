import { supabase } from "@/integrations/supabase/client";

export interface ThreadImageUpload {
  path: string;
  publicUrl: string;
}

export async function uploadThreadImage(
  file: File,
  threadId: string,
): Promise<ThreadImageUpload> {
  const filePath = `thread/${threadId}/${Date.now()}-${file.name}`;
  const { data: uploadData, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (error || !uploadData?.path) {
    throw new Error(error?.message || "Upload failed");
  }

  const { data } = supabase.storage
    .from("documents")
    .getPublicUrl(uploadData.path);

  return {
    path: uploadData.path,
    publicUrl: data.publicUrl,
  };
}
