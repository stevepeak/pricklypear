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

export async function updatePassword(args: {
  currentPassword: string;
  newPassword: string;
}) {
  const user = await requireCurrentUser();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: args.currentPassword,
  });
  if (signInError) throw new Error("Current password is incorrect");

  const { error: passwordError } = await supabase.auth.updateUser({
    password: args.newPassword,
  });
  if (passwordError) throw passwordError;
}
