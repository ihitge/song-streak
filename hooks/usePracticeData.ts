import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';
import { UserAchievement, PracticeSession, checkForNewAchievements, Achievement } from '@/types/practice';
import { StreakUpdateResult } from '@/types/streak';

interface PracticeData {
  totalSeconds: number;
  unlockedAchievementIds: string[];
  isLoading: boolean;
  error: string | null;
}

interface LogPracticeResult {
  newAchievements: Achievement[];
  streakUpdate: StreakUpdateResult | null;
}

interface UsePracticeDataReturn extends PracticeData {
  logPracticeSession: (seconds: number) => Promise<LogPracticeResult>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage practice data for a song
 * Handles loading, saving practice sessions, and achievement unlocks
 */
export function usePracticeData(songId: string | undefined): UsePracticeDataReturn {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load practice data for the song
  const loadPracticeData = useCallback(async () => {
    if (!songId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch song's total practice seconds
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('total_practice_seconds')
        .eq('id', songId)
        .single();

      if (songError) throw songError;

      setTotalSeconds(songData?.total_practice_seconds || 0);

      // Fetch unlocked achievements for this song
      const { data: achievementData, error: achievementError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id)
        .eq('song_id', songId);

      if (achievementError) throw achievementError;

      setUnlockedAchievementIds(
        achievementData?.map((a) => a.achievement_id) || []
      );
    } catch (err) {
      console.error('Error loading practice data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load practice data');
    } finally {
      setIsLoading(false);
    }
  }, [songId]);

  // Initial load
  useEffect(() => {
    loadPracticeData();
  }, [loadPracticeData]);

  /**
   * Log a practice session, update streak, and check for new achievements
   * Returns newly unlocked achievements and streak update result
   */
  const logPracticeSession = useCallback(async (seconds: number): Promise<LogPracticeResult> => {
    if (!songId || seconds <= 0) return { newAchievements: [], streakUpdate: null };

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Insert practice session
      const { error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: user.id,
          song_id: songId,
          duration_seconds: seconds,
        });

      if (sessionError) throw sessionError;

      // 2. Update total practice seconds on song
      const newTotal = totalSeconds + seconds;
      const { error: updateError } = await supabase
        .from('songs')
        .update({ total_practice_seconds: newTotal })
        .eq('id', songId);

      if (updateError) throw updateError;

      // 3. Update daily streak (convert seconds to minutes)
      const practiceMinutes = Math.ceil(seconds / 60);
      const today = new Date().toISOString().split('T')[0];

      let streakUpdate: StreakUpdateResult | null = null;
      try {
        const { data: streakData, error: streakError } = await supabase.rpc('update_user_streak', {
          p_user_id: user.id,
          p_practice_date: today,
          p_practice_minutes: practiceMinutes,
        });

        if (streakError) {
          console.warn('Error updating streak:', streakError);
        } else {
          streakUpdate = streakData as StreakUpdateResult;
        }
      } catch (streakErr) {
        // Non-fatal: log but don't fail the whole operation
        console.warn('Failed to update streak:', streakErr);
      }

      // 4. Check for new per-song achievements
      const newAchievements = checkForNewAchievements(newTotal, unlockedAchievementIds);

      if (newAchievements.length > 0) {
        // Insert new achievements
        const { error: achievementError } = await supabase
          .from('user_achievements')
          .insert(
            newAchievements.map((a) => ({
              user_id: user.id,
              song_id: songId,
              achievement_id: a.id,
            }))
          );

        if (achievementError) throw achievementError;

        // Update local state
        setUnlockedAchievementIds((prev) => [
          ...prev,
          ...newAchievements.map((a) => a.id),
        ]);
      }

      // Update total seconds
      setTotalSeconds(newTotal);

      return { newAchievements, streakUpdate };
    } catch (err) {
      console.error('Error logging practice session:', err);
      throw err;
    }
  }, [songId, totalSeconds, unlockedAchievementIds]);

  return {
    totalSeconds,
    unlockedAchievementIds,
    isLoading,
    error,
    logPracticeSession,
    refresh: loadPracticeData,
  };
}
