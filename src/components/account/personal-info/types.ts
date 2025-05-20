import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

export const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
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

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
