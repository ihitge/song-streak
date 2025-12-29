import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  LifetimeMilestone,
  UserGlobalStats,
  MilestoneCategory,
  ALL_MILESTONES,
  getMilestonesByCategory,
  getMilestoneProgress,
  isMilestoneUnlocked,
  getNextMilestone,
  getNearingCompletion,
  checkForNewMilestones,
} from '@/types/milestones';

interface UseMilestonesReturn {
  milestones: LifetimeMilestone[];
  unlockedIds: string[];
  isLoading: boolean;
  error: string | null;

  // Helpers
  getMilestonesByCategory: (category: MilestoneCategory) => LifetimeMilestone[];
  getProgressForMilestone: (milestone: LifetimeMilestone, stats: UserGlobalStats) => number;
  getNextMilestoneInCategory: (category: MilestoneCategory, stats: UserGlobalStats) => LifetimeMilestone | null;
  getMilestonesNearingCompletion: (stats: UserGlobalStats) => LifetimeMilestone[];

  // Actions
  checkAndUnlockMilestones: (stats: UserGlobalStats) => Promise<LifetimeMilestone[]>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage lifetime milestone tracking
 */
export function useMilestones(): UseMilestonesReturn {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load unlocked milestones from database
  const loadUnlockedMilestones = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_lifetime_milestones')
        .select('milestone_id')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      setUnlockedIds(data?.map(m => m.milestone_id) || []);
    } catch (err) {
      console.error('Error loading milestones:', err);
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUnlockedMilestones();
  }, [loadUnlockedMilestones]);

  // Get milestones by category (memoized)
  const getMilestonesByCategoryHelper = useCallback((category: MilestoneCategory) => {
    return getMilestonesByCategory(category);
  }, []);

  // Get progress for a milestone
  const getProgressForMilestone = useCallback((
    milestone: LifetimeMilestone,
    stats: UserGlobalStats
  ): number => {
    if (unlockedIds.includes(milestone.id)) return 100;
    return getMilestoneProgress(milestone, stats);
  }, [unlockedIds]);

  // Get next milestone in category
  const getNextMilestoneInCategory = useCallback((
    category: MilestoneCategory,
    stats: UserGlobalStats
  ): LifetimeMilestone | null => {
    return getNextMilestone(category, unlockedIds, stats);
  }, [unlockedIds]);

  // Get milestones nearing completion (>90%)
  const getMilestonesNearingCompletion = useCallback((
    stats: UserGlobalStats
  ): LifetimeMilestone[] => {
    return getNearingCompletion(unlockedIds, stats);
  }, [unlockedIds]);

  // Check and unlock new milestones
  const checkAndUnlockMilestones = useCallback(async (
    stats: UserGlobalStats
  ): Promise<LifetimeMilestone[]> => {
    const newlyEarned = checkForNewMilestones(unlockedIds, stats);

    if (newlyEarned.length === 0) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Insert new milestones
      const { error: insertError } = await supabase
        .from('user_lifetime_milestones')
        .insert(
          newlyEarned.map(m => ({
            user_id: user.id,
            milestone_id: m.id,
          }))
        );

      if (insertError) throw insertError;

      // Update local state
      setUnlockedIds(prev => [...prev, ...newlyEarned.map(m => m.id)]);

      return newlyEarned;
    } catch (err) {
      console.error('Error unlocking milestones:', err);
      return [];
    }
  }, [unlockedIds]);

  return {
    milestones: ALL_MILESTONES,
    unlockedIds,
    isLoading,
    error,
    getMilestonesByCategory: getMilestonesByCategoryHelper,
    getProgressForMilestone,
    getNextMilestoneInCategory,
    getMilestonesNearingCompletion,
    checkAndUnlockMilestones,
    refresh: loadUnlockedMilestones,
  };
}
