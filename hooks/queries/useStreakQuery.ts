/**
 * useStreakQuery Hook
 *
 * React Query-based hook for fetching and caching streak data.
 * Provides stale-while-revalidate behavior to prevent tab flicker.
 *
 * This hook wraps multiple streak-related queries:
 * - User streak data (current streak, longest, freezes)
 * - Today's practice progress
 * - Global stats
 * - Milestones
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import {
  UserStreak,
  DailyPracticeLog,
  FlameLevel,
  DailyGoalMinutes,
  getFlameLevel,
  isStreakActive,
} from '@/types/streak';
import { UserGlobalStats } from '@/types/milestones';

// Query keys
export const STREAK_QUERY_KEY = ['streak'] as const;
export const TODAY_PROGRESS_QUERY_KEY = ['todayProgress'] as const;
export const GLOBAL_STATS_QUERY_KEY = ['globalStats'] as const;
export const MILESTONES_QUERY_KEY = ['milestones'] as const;

interface StreakData {
  streakData: UserStreak | null;
  todayProgress: DailyPracticeLog | null;
}

/**
 * Fetches streak and today's progress data
 */
async function fetchStreakData(): Promise<StreakData> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { streakData: null, todayProgress: null };
  }

  // Get or create user_streaks row
  let { data: streakRow, error: streakError } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (streakError && streakError.code === 'PGRST116') {
    // No row exists, create one
    const { data: newStreak, error: insertError } = await supabase
      .from('user_streaks')
      .insert({ user_id: user.id })
      .select()
      .single();

    if (insertError) throw insertError;
    streakRow = newStreak;
  } else if (streakError) {
    throw streakError;
  }

  // Get today's practice log
  const today = new Date().toISOString().split('T')[0];
  const { data: todayLog, error: logError } = await supabase
    .from('daily_practice_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('practice_date', today)
    .single();

  if (logError && logError.code !== 'PGRST116') {
    throw logError;
  }

  return {
    streakData: streakRow,
    todayProgress: todayLog || null,
  };
}

/**
 * Fetches global stats (matches UserGlobalStats type for TrophyCase compatibility)
 */
async function fetchGlobalStats(): Promise<UserGlobalStats | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get total practice seconds across all songs
  const { data: practiceData, error: practiceError } = await supabase
    .from('songs')
    .select('id, total_practice_seconds, techniques')
    .eq('user_id', user.id);

  if (practiceError) throw practiceError;

  // Calculate totals
  const totalSeconds = practiceData?.reduce(
    (sum, song) => sum + (song.total_practice_seconds || 0),
    0
  ) || 0;

  // Count mastered songs (1+ hour)
  const masteredSongs = practiceData?.filter(
    song => (song.total_practice_seconds || 0) >= 3600
  ) || [];

  // Build genre map from mastered songs
  const genresMastered: Record<string, number> = {};
  masteredSongs.forEach(song => {
    (song.techniques || []).forEach((genre: string) => {
      genresMastered[genre] = (genresMastered[genre] || 0) + 1;
    });
  });

  // 2. Get streak data
  const { data: streakData, error: streakError } = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak, last_practice_date')
    .eq('user_id', user.id)
    .single();

  // Ignore "no rows" error
  if (streakError && streakError.code !== 'PGRST116') {
    throw streakError;
  }

  return {
    total_practice_seconds: totalSeconds,
    songs_mastered: masteredSongs.length,
    current_streak: streakData?.current_streak || 0,
    longest_streak: streakData?.longest_streak || 0,
    last_practiced_at: streakData?.last_practice_date || null,
    genres_mastered: genresMastered,
  };
}

/**
 * Fetches unlocked milestone IDs
 */
async function fetchMilestones(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('user_milestones')
    .select('milestone_id')
    .eq('user_id', user.id);

  if (error) throw error;

  return data?.map(m => m.milestone_id) || [];
}

/**
 * Combined hook for all streak-related data with caching
 */
export function useStreakQuery() {
  const queryClient = useQueryClient();

  // Main streak data query
  const streakQuery = useQuery({
    queryKey: STREAK_QUERY_KEY,
    queryFn: fetchStreakData,
    staleTime: 30 * 1000,
  });

  // Global stats query
  const statsQuery = useQuery({
    queryKey: GLOBAL_STATS_QUERY_KEY,
    queryFn: fetchGlobalStats,
    staleTime: 60 * 1000, // Stats can be stale longer
  });

  // Milestones query
  const milestonesQuery = useQuery({
    queryKey: MILESTONES_QUERY_KEY,
    queryFn: fetchMilestones,
    staleTime: 60 * 1000,
  });

  // Update daily goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (minutes: DailyGoalMinutes) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_streaks')
        .update({ daily_goal_minutes: minutes })
        .eq('user_id', user.id);

      if (error) throw error;
      return minutes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY });
    },
  });

  // Derived values
  const streakData = streakQuery.data?.streakData ?? null;
  const todayProgress = streakQuery.data?.todayProgress ?? null;
  const flameLevel = getFlameLevel(streakData?.current_streak || 0);
  const todayGoalMet = todayProgress?.goal_met ?? false;
  const isActive = isStreakActive(streakData?.last_practice_date || null);

  // Combined loading state - only true on initial load
  const isLoading = streakQuery.isLoading || statsQuery.isLoading || milestonesQuery.isLoading;

  // Refresh all data
  const refresh = async () => {
    await Promise.all([
      streakQuery.refetch(),
      statsQuery.refetch(),
      milestonesQuery.refetch(),
    ]);
  };

  // Invalidate all streak-related caches
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: GLOBAL_STATS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: MILESTONES_QUERY_KEY });
  };

  return {
    // Streak data
    streakData,
    todayProgress,
    flameLevel,
    todayGoalMet,
    isActive,

    // Global stats
    stats: statsQuery.data ?? null,

    // Milestones
    unlockedIds: milestonesQuery.data ?? [],

    // Loading states
    isLoading,
    streakLoading: streakQuery.isLoading,
    statsLoading: statsQuery.isLoading,
    milestonesLoading: milestonesQuery.isLoading,

    // Error
    error: streakQuery.error?.message ?? statsQuery.error?.message ?? null,

    // Actions
    updateDailyGoal: updateGoalMutation.mutateAsync,
    refresh,
    invalidateAll,
  };
}

export default useStreakQuery;
