import { supabase } from '@/integrations/supabase/client';
import { requireCurrentUser } from '@/utils/authCache';

interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export async function updatePassword({
  currentPassword,
  newPassword,
}: UpdatePasswordParams) {
  const user = await requireCurrentUser();

  // First verify the current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Current password is incorrect');
  }

  // If verification successful, update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}
