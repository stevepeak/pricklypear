import { requireCurrentUser } from "@/utils/authCache";
import { supabase } from "@/integrations/supabase/client";
import { type UserNotification } from "./types";

export async function update(notifications: UserNotification) {
  const user = await requireCurrentUser();

  const { error } = await supabase
    .from("profiles")
    .update({ notifications })
    .eq("id", user.id);

  if (error) throw error;
}
