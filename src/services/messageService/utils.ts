import { logError } from '@/utils/logger';

export const handleError = (error: unknown, context: string): boolean => {
  logError(context, error);
  return false;
};
