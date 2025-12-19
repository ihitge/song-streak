/**
 * Supabase Authentication Helpers
 *
 * Utility functions for common authentication patterns.
 * Reduces code duplication across hooks that need authenticated user access.
 */

import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Error thrown when user is not authenticated
 */
export class AuthenticationError extends Error {
  constructor(message = 'Not authenticated') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current authenticated user, throwing if not authenticated
 * Use this when an operation requires authentication
 *
 * @throws {AuthenticationError} If user is not authenticated
 * @returns The current authenticated user
 *
 * @example
 * const user = await requireAuth();
 * // user is guaranteed to be non-null here
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError('Not authenticated');
  }

  return user;
}

/**
 * Get the current user's ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Get the current user's ID, throwing if not authenticated
 * @throws {AuthenticationError} If user is not authenticated
 * @returns The user ID
 */
export async function requireUserId(): Promise<string> {
  const user = await requireAuth();
  return user.id;
}

/**
 * Check if the current user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get the current user's email (first part as display initial)
 * @returns The first letter of email, or 'U' if not available
 */
export async function getUserInitial(): Promise<string> {
  const user = await getCurrentUser();
  const email = user?.email;
  return email ? email.charAt(0).toUpperCase() : 'U';
}
