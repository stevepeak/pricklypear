import { supabase } from "@/integrations/supabase/client";
import * as Sentry from "@sentry/react";

export const handleError = (error: unknown, context: string): boolean => {
  let message = "";
  if (error && typeof error === "object" && "message" in error) {
    message = (error as { message: string }).message;
  } else {
    message = String(error);
  }
  const err = new Error(`🐞 ${context}: ${message}`);
  Sentry.captureException(err, { extra: error });
  console.error(`Error in ${context}:`, error);
  return false;
};
