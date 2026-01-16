/**
 * useVoiceMemosQuery Hook
 *
 * React Query-based hook for fetching and caching voice memos.
 * Provides stale-while-revalidate behavior to prevent tab flicker.
 *
 * Note: This hook only handles fetching/caching. Mutations (upload, delete, etc.)
 * are still handled by the original useVoiceMemos hook for complexity reasons.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { VoiceMemoWithMeta } from '@/types/voiceMemo';

// Query key factory
export const VOICE_MEMOS_QUERY_KEY = ['voiceMemos'] as const;

export function getVoiceMemosQueryKey(bandId?: string | null) {
  return bandId
    ? [...VOICE_MEMOS_QUERY_KEY, 'band', bandId] as const
    : VOICE_MEMOS_QUERY_KEY;
}

interface FetchMemosOptions {
  bandId?: string | null;
  includeShared?: boolean;
}

/**
 * Fetches voice memos from Supabase
 */
async function fetchVoiceMemos(options: FetchMemosOptions = {}): Promise<VoiceMemoWithMeta[]> {
  const { bandId = null, includeShared = true } = options;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // Build query
  let query = supabase
    .from('voice_memos')
    .select('*')
    .order('recorded_at', { ascending: false });

  // Filter based on options
  if (bandId) {
    // Specific band memos
    query = query.eq('band_id', bandId);
  } else if (!includeShared) {
    // Personal memos only
    query = query.eq('created_by', user.id).is('band_id', null);
  }
  // If includeShared is true, RLS will handle returning all visible memos

  const { data, error } = await query;

  if (error) throw error;

  // Enrich with meta information
  return (data || []).map((memo): VoiceMemoWithMeta => ({
    ...memo,
    is_owner: memo.created_by === user.id,
  }));
}

interface UseVoiceMemosQueryOptions {
  /** Filter by band ID (null = personal only) */
  bandId?: string | null;
  /** Include shared band memos */
  includeShared?: boolean;
}

/**
 * Hook for fetching voice memos with caching
 */
export function useVoiceMemosQuery(options: UseVoiceMemosQueryOptions = {}) {
  const { bandId = null, includeShared = true } = options;
  const queryClient = useQueryClient();

  const queryKey = getVoiceMemosQueryKey(bandId);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchVoiceMemos({ bandId, includeShared }),
    staleTime: 30 * 1000,
  });

  /**
   * Manually trigger a refetch (for pull-to-refresh)
   */
  const refetch = async () => {
    await query.refetch();
  };

  /**
   * Invalidate the memos cache (after upload/delete)
   */
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: VOICE_MEMOS_QUERY_KEY });
  };

  return {
    /**
     * Array of voice memos (empty array if not yet loaded)
     */
    memos: query.data ?? [],

    /**
     * True only during initial load when no cached data exists.
     * Use this to show skeleton screens.
     */
    isLoading: query.isLoading,

    /**
     * True during any fetch (including background refetch).
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

export default useVoiceMemosQuery;
