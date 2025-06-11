import { z } from 'zod';
import { PasswordSchema } from '@/types/schemas';

export const changePasswordFormSchema = z
  .object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmNewPassword: PasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type PasswordFormValues = z.infer<typeof changePasswordFormSchema>;
