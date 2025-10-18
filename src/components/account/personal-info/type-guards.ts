/**
 * Type guard to check if an error has a message property with 'confirmation' in it
 */
export function isConfirmationError(
  error: unknown
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message.includes('confirmation')
  );
}
