import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import {
  MasteryPath,
  NodeStatus,
  MasteryPathProgress,
  SongMasteryState,
  SongMasteryProgress,
  MasteryNode,
  THEORY_NODES,
  TECHNIQUE_NODES,
  PERFORMANCE_NODES,
  mapMasteryProgressToNodes,
  getNodeStatus,
  calculateStarRating,
} from '@/types/mastery';

interface UseSongMasteryReturn {
  // State
  masteryState: SongMasteryState | null;
  isLoading: boolean;
  error: string | null;

  // Computed helpers
  getNodeStatus: (nodeId: string) => NodeStatus;
  getPathProgress: (path: MasteryPath) => MasteryPathProgress;
  getCompletedNodeIds: () => string[];

  // Actions
  completeTheoryNode: (nodeId: string) => Promise<void>;
  checkTheoryProgress: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to manage per-song mastery progress (skill tree)
 */
export function useSongMastery(
  songId: string | undefined,
  totalPracticeSeconds: number = 0
): UseSongMasteryReturn {
  const [masteryProgress, setMasteryProgress] = useState<SongMasteryProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load mastery progress
  const loadMasteryProgress = useCallback(async () => {
    if (!songId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get or create mastery progress row
      let { data, error: fetchError } = await supabase
        .from('song_mastery_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('song_id', songId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No row exists, create one
        const { data: newRow, error: insertError } = await supabase
          .from('song_mastery_progress')
          .insert({
            user_id: user.id,
            song_id: songId,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newRow;
      } else if (fetchError) {
        throw fetchError;
      }

      setMasteryProgress(data);
    } catch (err) {
      console.error('Error loading mastery progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to load mastery progress');
    } finally {
      setIsLoading(false);
    }
  }, [songId]);

  // Initial load
  useEffect(() => {
    loadMasteryProgress();
  }, [loadMasteryProgress]);

  // Compute completed node IDs from progress + practice time
  const completedNodeIds = useMemo(() => {
    return mapMasteryProgressToNodes(masteryProgress, totalPracticeSeconds);
  }, [masteryProgress, totalPracticeSeconds]);

  // Get node status helper
  const getNodeStatusHelper = useCallback((nodeId: string): NodeStatus => {
    return getNodeStatus(nodeId, completedNodeIds);
  }, [completedNodeIds]);

  // Get path progress helper
  const getPathProgress = useCallback((path: MasteryPath): MasteryPathProgress => {
    const pathNodes = path === 'theory' ? THEORY_NODES :
                      path === 'technique' ? TECHNIQUE_NODES :
                      PERFORMANCE_NODES;

    const completedInPath = pathNodes.filter(n => completedNodeIds.includes(n.id));
    const isComplete = completedInPath.length === pathNodes.length;

    return {
      path,
      completedNodeIds: completedInPath.map(n => n.id),
      totalNodes: pathNodes.length,
      isPathComplete: isComplete,
    };
  }, [completedNodeIds]);

  // Compute mastery state
  const masteryState = useMemo((): SongMasteryState | null => {
    if (!songId) return null;

    const theoryProgress = getPathProgress('theory');
    const techniqueProgress = getPathProgress('technique');
    const performanceProgress = getPathProgress('performance');

    const starRating = calculateStarRating(
      theoryProgress.isPathComplete,
      techniqueProgress.isPathComplete,
      performanceProgress.isPathComplete
    );

    return {
      songId,
      theoryProgress,
      techniqueProgress,
      performanceProgress,
      starRating,
      isFullyMastered: starRating === 3,
    };
  }, [songId, getPathProgress]);

  // Complete a theory node manually
  const completeTheoryNode = useCallback(async (nodeId: string) => {
    if (!songId || !masteryProgress) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Map node ID to database column
      const columnMap: Record<string, string> = {
        theory_chords: 'theory_chords_added',
        theory_structure: 'theory_structure_mapped',
        theory_key: 'theory_key_set',
        theory_transpose: 'theory_transpose_practiced',
        theory_master: 'theory_master',
      };

      const column = columnMap[nodeId];
      if (!column) throw new Error(`Unknown node: ${nodeId}`);

      const { error: updateError } = await supabase
        .from('song_mastery_progress')
        .update({ [column]: true })
        .eq('user_id', user.id)
        .eq('song_id', songId);

      if (updateError) throw updateError;

      // Refresh data
      await loadMasteryProgress();
    } catch (err) {
      console.error('Error completing theory node:', err);
      throw err;
    }
  }, [songId, masteryProgress, loadMasteryProgress]);

  // Auto-check theory progress based on song data
  const checkTheoryProgress = useCallback(async () => {
    if (!songId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch song data to check theory completion
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .select('chords, key, song_structure')
        .eq('id', songId)
        .single();

      if (songError) throw songError;

      const updates: Partial<SongMasteryProgress> = {};

      // Check chords (3+ added)
      if (songData.chords && songData.chords.length >= 3) {
        updates.theory_chords_added = true;
      }

      // Check key set
      if (songData.key) {
        updates.theory_key_set = true;
      }

      // Check structure mapped
      if (songData.song_structure) {
        const structure = songData.song_structure;
        const hasStructure = structure.intro || structure.verse ||
                            structure.chorus || structure.bridge;
        if (hasStructure) {
          updates.theory_structure_mapped = true;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('song_mastery_progress')
          .update(updates)
          .eq('user_id', user.id)
          .eq('song_id', songId);

        if (updateError) throw updateError;

        await loadMasteryProgress();
      }
    } catch (err) {
      console.error('Error checking theory progress:', err);
    }
  }, [songId, loadMasteryProgress]);

  return {
    masteryState,
    isLoading,
    error,
    getNodeStatus: getNodeStatusHelper,
    getPathProgress,
    getCompletedNodeIds: () => completedNodeIds,
    completeTheoryNode,
    checkTheoryProgress,
    refresh: loadMasteryProgress,
  };
}
