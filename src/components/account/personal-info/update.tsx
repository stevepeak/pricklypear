import { supabase } from '@/integrations/supabase/client';
import { type PersonalInfoUpdate } from './types';

export async function updatePersonalInfo(data: PersonalInfoUpdate) {
  const { error: authError, data: authData } = await supabase.auth.updateUser({
    email: data.email,
    data: {
      name: data.name,
    },
  });
  if (authError) throw authError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name: data.name, email: data.email })
    .eq('id', authData.user.id);

  if (profileError) throw profileError;
}
