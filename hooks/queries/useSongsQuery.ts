/**
 * useSongsQuery Hook
 *
 * React Query-based hook for fetching and caching the user's song library.
 * Provides stale-while-revalidate behavior to prevent tab flicker.
 *
 * Features:
 * - Automatic caching between tab switches
 * - Background refetching without showing loading state
 * - Pull-to-refresh support
 * - Demo mode for logged-out users
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { MOCK_SONGS } from '@/data/mockSongs';
import type { Song } from '@/types/song';
import type { DbSong } from '@/types/database';

// Query key for songs
export const SONGS_QUERY_KEY = ['songs'] as const;

/**
 * Fetches songs from Supabase for the current user
 */
async function fetchSongs(): Promise<Song[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Demo mode: return mock songs for logged-out users
    console.log('[useSongsQuery] No user, returning demo songs');
    return MOCK_SONGS;
  }

  console.log('[useSongsQuery] Fetching songs for user:', user.id);

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[useSongsQuery] Error:', error);
    throw new Error('Failed to load songs');
  }

  console.log('[useSongsQuery] Fetched:', data?.length || 0, 'songs');

  // Map database rows to Song type
  return (data || []).map((row: DbSong): Song => ({
    id: row.id,
    title: row.title,
    artist: row.artist,
    duration: '0:00', // Calculated field - not stored in DB
    lastPracticed: 'Never', // Derived from practice_sessions
    instrument: row.instrument || 'Guitar',
    genres: (row.techniques || []) as Song['genres'],
    artwork: row.artwork_url ?? undefined,
  }));
}

/**
 * Hook for fetching the user's song library with caching
 */
export function useSongsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SONGS_QUERY_KEY,
    queryFn: fetchSongs,
    // Songs don't change often - keep fresh for 30 seconds
    staleTime: 30 * 1000,
  });

  /**
   * Manually trigger a refetch (for pull-to-refresh)
   */
  const refetch = async () => {
    await query.refetch();
  };

  /**
   * Invalidate the songs cache (after add/edit/delete)
   */
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: SONGS_QUERY_KEY });
  };

  return {
    /**
     * Array of songs (empty array if not yet loaded)
     */
    songs: query.data ?? [],

    /**
     * True only during initial load when no cached data exists.
     * Use this to show skeleton screens.
     */
    isLoading: query.isLoading,

    /**
     * True during any fetch (including background refetch).
     * Use this for subtle "updating" indicators if needed.
     */
    isFetching: query.isFetching,

    /**
     * True if data is stale and being refreshed in background
     */
    isRefreshing: query.isFetching && !query.isLoading,

    /**
     * Error message if fetch failed
     */
    error: query.error?.message ?? null,

    /**
     * True if we have any data (cached or fresh)
     */
    hasData: !!query.data,

    /**
     * Manually trigger a refetch
     */
    refetch,

    /**
     * Invalidate cache (use after mutations)
     */
    invalidate,
  };
}

export default useSongsQuery;
