import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { UserGlobalStats, WeeklyProgress } from '@/types/milestones';

interface UseGlobalStatsReturn {
  stats: UserGlobalStats | null;
  weeklyProgress: WeeklyProgress | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateAfterPractice: (seconds: number) => void;
}

/**
 * Hook to manage global/lifetime practice statistics
 */
export function useGlobalStats(): UseGlobalStatsReturn {
  const [stats, setStats] = useState<UserGlobalStats | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

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

      // 3. Get last week's daily practice
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weekData, error: weekError } = await supabase
        .from('daily_practice_logs')
        .select('practice_date, total_minutes')
        .eq('user_id', user.id)
        .gte('practice_date', weekAgo.toISOString().split('T')[0])
        .order('practice_date', { ascending: true });

      if (weekError) throw weekError;

      // Build weekly progress
      const weeklyTotal = weekData?.reduce(
        (sum, day) => sum + (day.total_minutes || 0) * 60,
        0
      ) || 0;

      setWeeklyProgress({
        practiced_days: weekData?.length || 0,
        total_seconds: weeklyTotal,
        daily_breakdown: weekData?.map(d => ({
          date: d.practice_date,
          seconds: (d.total_minutes || 0) * 60,
        })) || [],
      });

      // Set global stats
      setStats({
        total_practice_seconds: totalSeconds,
        songs_mastered: masteredSongs.length,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        last_practiced_at: streakData?.last_practice_date || null,
        genres_mastered: genresMastered,
      });
    } catch (err) {
      console.error('Error loading global stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Optimistic update after practice
  const updateAfterPractice = useCallback((seconds: number) => {
    setStats(prev => prev ? {
      ...prev,
      total_practice_seconds: prev.total_practice_seconds + seconds,
    } : null);
  }, []);

  return {
    stats,
    weeklyProgress,
    isLoading,
    error,
    refresh: loadStats,
    updateAfterPractice,
  };
}
