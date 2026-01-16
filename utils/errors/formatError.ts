/**
 * Error Formatting Utility
 *
 * Consistent error message formatting for catch blocks across the app.
 * Safely extracts message from Error objects or returns fallback.
 */

/**
 * Format an error into a user-friendly message
 *
 * @param error - The caught error (unknown type from catch block)
 * @param fallback - Default message if error message cannot be extracted
 * @returns Formatted error message string
 *
 * @example
 * ```ts
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   const message = formatError(error, 'Operation failed');
 *   showAlert('Error', message);
 * }
 * ```
 */
export function formatError(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Extract error message with custom parsing for common error types
 *
 * @param error - The caught error
 * @param fallback - Default message if extraction fails
 * @returns Extracted or fallback message
 */
export function extractErrorMessage(error: unknown, fallback: string): string {
  // Standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Objects with message property (like Supabase errors)
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  // String errors
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
}
