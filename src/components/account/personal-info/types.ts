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
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    confirmNewPassword: z
      .string()
      .min(8, "Please confirm your new password")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;
