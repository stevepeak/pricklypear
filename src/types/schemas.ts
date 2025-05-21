import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, "New password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  );
