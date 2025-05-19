// Types and constants shared by account components
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email is required"),
});

export type FormValues = z.infer<typeof formSchema>;
