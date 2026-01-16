/**
 * QueryProvider
 *
 * Wraps the app with TanStack React Query for data fetching and caching.
 * Provides stale-while-revalidate behavior to prevent tab flicker.
 *
 * Configuration:
 * - staleTime: 30 seconds - data considered fresh
 * - gcTime: 5 minutes - cache retention
 * - refetchOnWindowFocus: true - refresh when app foregrounds
 * - refetchOnMount: 'always' - background check for updates
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      // During this time, cached data is returned immediately without refetch
      staleTime: 30 * 1000,

      // Cache is kept for 5 minutes after last use
      // Allows fast tab switching without re-fetching
      gcTime: 5 * 60 * 1000,

      // Refetch when app returns to foreground (React Native focus)
      refetchOnWindowFocus: true,

      // Always check for updates on mount, but show cached data immediately
      refetchOnMount: 'always',

      // Retry failed requests up to 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on reconnect by default (user can pull-to-refresh)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export client for use in invalidation/prefetching
export { queryClient };

export default QueryProvider;
