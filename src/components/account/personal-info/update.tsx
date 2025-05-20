import { requireCurrentUser } from "@/utils/authCache";
import { supabase } from "@/integrations/supabase/client";
import { type PersonalInfoUpdate } from "./types";

export async function updatePersonalInfo(data: PersonalInfoUpdate) {
  const user = await requireCurrentUser();
  // Update user metadata (full name)
  const { error: metadataError } = await supabase.auth.updateUser({
    data: { name: data.name },
  });
  if (metadataError) throw metadataError;
  // Update email if changed
  if (data.email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: data.email,
    });
    if (emailError) throw emailError;
  }
  // Also update the profile name and emoji for consistency
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name: data.name })
    .eq("id", user.id);
  if (profileError) throw profileError;
}
