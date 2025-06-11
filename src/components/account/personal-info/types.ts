import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

export const formSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('A valid email is required'),
});

export type FormValues = z.infer<typeof formSchema>;

export interface PersonalInfoUpdate {
  name: string;
  email: string;
}

export interface PersonalInfoFormProps {
  form: UseFormReturn<FormValues>;
  profileLoading: boolean;
  onProfileUpdated?: () => void;
}
