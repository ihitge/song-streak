/**
 * Auth Utility Functions
 *
 * Centralized auth check patterns for use across hooks.
 * Reduces repetitive auth checking boilerplate.
 */

import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

/**
 * Error thrown when user is not authenticated
 */
export class AuthRequiredError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

/**
 * Get the current authenticated user
 * Throws AuthRequiredError if not logged in
 *
 * @returns The authenticated user
 * @throws AuthRequiredError if user is not authenticated
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * console.log('Logged in as:', user.email);
 * ```
 */
export async function getCurrentUser(): Promise<User> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new AuthRequiredError(error.message);
  }

  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

/**
 * Get current user ID or null if not authenticated
 * Useful when auth is optional
 *
 * @returns User ID string or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Check if a user is currently authenticated
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user !== null;
}

/**
 * Require authentication and return user ID
 * Throws if not authenticated
 *
 * @returns User ID string
 * @throws AuthRequiredError if not authenticated
 *
 * @example
 * ```ts
 * const userId = await requireAuth();
 * const songs = await fetchSongsForUser(userId);
 * ```
 */
export async function requireAuth(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}
