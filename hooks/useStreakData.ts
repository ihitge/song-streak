import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  UserStreak,
  DailyPracticeLog,
  StreakUpdateResult,
  FlameLevel,
  DailyGoalMinutes,
  getFlameLevel,
  isStreakActive,
} from '@/types/streak';

interface UseStreakDataReturn {
  // State
  streakData: UserStreak | null;
  todayProgress: DailyPracticeLog | null;
  isLoading: boolean;
  error: string | null;

  // Derived values
  flameLevel: FlameLevel;
  dailyGoalProgress: number; // 0-100 percentage
  todayGoalMet: boolean;
  isActive: boolean; // Streak is currently active (practiced today or yesterday)

  // Actions
  updateDailyGoal: (minutes: DailyGoalMinutes) => Promise<void>;
  recordPractice: (minutes: number) => Promise<StreakUpdateResult | null>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage user streak data
 * Handles loading, updating, and calculating streak status
 */
export function useStreakData(): UseStreakDataReturn {
  const [streakData, setStreakData] = useState<UserStreak | null>(null);
  const [todayProgress, setTodayProgress] = useState<DailyPracticeLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load streak data
  const loadStreakData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
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

      setStreakData(streakRow);

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

      setTodayProgress(todayLog || null);
    } catch (err) {
      console.error('Error loading streak data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load streak data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  // Update daily goal setting
  const updateDailyGoal = useCallback(async (minutes: DailyGoalMinutes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({ daily_goal_minutes: minutes })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setStreakData((prev) => prev ? { ...prev, daily_goal_minutes: minutes } : null);
    } catch (err) {
      console.error('Error updating daily goal:', err);
      throw err;
    }
  }, []);

  // Record practice and update streak
  const recordPractice = useCallback(async (minutes: number): Promise<StreakUpdateResult | null> => {
    if (minutes <= 0) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];

      // Call the RPC function to handle all streak logic
      const { data, error: rpcError } = await supabase.rpc('update_user_streak', {
        p_user_id: user.id,
        p_practice_date: today,
        p_practice_minutes: minutes,
      });

      if (rpcError) throw rpcError;

      const result = data as StreakUpdateResult;

      // Refresh local state to get updated values
      await loadStreakData();

      return result;
    } catch (err) {
      console.error('Error recording practice:', err);
      throw err;
    }
  }, [loadStreakData]);

  // Derived values
  const flameLevel = getFlameLevel(streakData?.current_streak || 0);

  // Guard against division by zero if daily_goal_minutes is 0 or null
  const dailyGoalProgress = streakData && todayProgress && streakData.daily_goal_minutes > 0
    ? Math.min(100, Math.round((todayProgress.total_minutes / streakData.daily_goal_minutes) * 100))
    : 0;

  const todayGoalMet = todayProgress?.goal_met ?? false;

  const isActive = isStreakActive(streakData?.last_practice_date || null);

  return {
    streakData,
    todayProgress,
    isLoading,
    error,
    flameLevel,
    dailyGoalProgress,
    todayGoalMet,
    isActive,
    updateDailyGoal,
    recordPractice,
    refresh: loadStreakData,
  };
}
