/**
 * Song Mastery Path & Skill Tree Types
 * RPG-style skill tree with Theory, Technique, and Performance paths
 */

export type MasteryPath = 'theory' | 'technique' | 'performance';
export type NodeStatus = 'locked' | 'unlocked' | 'completed';

export interface MasteryNode {
  id: string;
  path: MasteryPath;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  position: number; // 1-5 within path (1 = closest to center)
  prerequisiteId?: string; // Previous node in sequence
  isFuture?: boolean; // True for placeholder nodes (not yet implemented)
}

export interface MasteryPathProgress {
  path: MasteryPath;
  completedNodeIds: string[];
  totalNodes: number;
  isPathComplete: boolean;
}

export interface SongMasteryState {
  songId: string;
  theoryProgress: MasteryPathProgress;
  techniqueProgress: MasteryPathProgress;
  performanceProgress: MasteryPathProgress;
  starRating: 0 | 1 | 2 | 3;
  isFullyMastered: boolean;
}

// Database row structure
export interface SongMasteryProgress {
  id: string;
  user_id: string;
  song_id: string;

  // Theory Path
  theory_chords_added: boolean;
  theory_structure_mapped: boolean;
  theory_key_set: boolean;
  theory_transpose_practiced: boolean;
  theory_master: boolean;

  // Performance Path (future-ready)
  perf_first_recording: boolean;
  perf_self_review: boolean;
  perf_band_ready: boolean;
  perf_stage_prep: boolean;
  perf_performance_master: boolean;

  star_rating: number;
  created_at: string;
  updated_at: string;
}

// Node definitions - Theory Path
export const THEORY_NODES: MasteryNode[] = [
  {
    id: 'theory_chords',
    path: 'theory',
    title: 'Know the Chords',
    description: 'Add at least 3 chords to the theory tab',
    icon: 'music',
    position: 1,
  },
  {
    id: 'theory_structure',
    path: 'theory',
    title: 'Full Structure',
    description: 'Map intro, verse, chorus, and bridge sections',
    icon: 'list-tree',
    position: 2,
    prerequisiteId: 'theory_chords',
  },
  {
    id: 'theory_key',
    path: 'theory',
    title: 'Key Awareness',
    description: 'Identify and set the song key',
    icon: 'key',
    position: 3,
    prerequisiteId: 'theory_structure',
  },
  {
    id: 'theory_transpose',
    path: 'theory',
    title: 'Transpose Ready',
    description: 'Practice the song in an alternate key',
    icon: 'move-horizontal',
    position: 4,
    prerequisiteId: 'theory_key',
    isFuture: true,
  },
  {
    id: 'theory_master',
    path: 'theory',
    title: 'Theory Master',
    description: 'Complete all theory milestones',
    icon: 'graduation-cap',
    position: 5,
    prerequisiteId: 'theory_transpose',
  },
];

// Node definitions - Technique Path (maps to practice time)
export const TECHNIQUE_NODES: MasteryNode[] = [
  {
    id: 'technique_first_steps',
    path: 'technique',
    title: 'First Steps',
    description: 'Practice for 5 minutes total',
    icon: 'footprints',
    position: 1,
  },
  {
    id: 'technique_building',
    path: 'technique',
    title: 'Building Muscle',
    description: 'Practice for 1 hour total',
    icon: 'dumbbell',
    position: 2,
    prerequisiteId: 'technique_first_steps',
  },
  {
    id: 'technique_committed',
    path: 'technique',
    title: 'Committed',
    description: 'Practice for 10 hours total',
    icon: 'flame',
    position: 3,
    prerequisiteId: 'technique_building',
  },
  {
    id: 'technique_near_mastery',
    path: 'technique',
    title: 'Near Mastery',
    description: 'Practice for 24 hours total',
    icon: 'star',
    position: 4,
    prerequisiteId: 'technique_committed',
  },
  {
    id: 'technique_master',
    path: 'technique',
    title: 'Song Master',
    description: 'Practice for 50 hours total',
    icon: 'trophy',
    position: 5,
    prerequisiteId: 'technique_near_mastery',
  },
];

// Node definitions - Performance Path (future placeholders)
export const PERFORMANCE_NODES: MasteryNode[] = [
  {
    id: 'perf_recording',
    path: 'performance',
    title: 'First Recording',
    description: 'Record yourself playing this song',
    icon: 'mic',
    position: 1,
    isFuture: true,
  },
  {
    id: 'perf_review',
    path: 'performance',
    title: 'Self Review',
    description: 'Listen to your recording',
    icon: 'headphones',
    position: 2,
    prerequisiteId: 'perf_recording',
    isFuture: true,
  },
  {
    id: 'perf_band',
    path: 'performance',
    title: 'Band Ready',
    description: 'Share with band members',
    icon: 'users',
    position: 3,
    prerequisiteId: 'perf_review',
    isFuture: true,
  },
  {
    id: 'perf_stage',
    path: 'performance',
    title: 'Stage Prep',
    description: 'Mark song as gig-ready',
    icon: 'sparkles',
    position: 4,
    prerequisiteId: 'perf_band',
    isFuture: true,
  },
  {
    id: 'perf_master',
    path: 'performance',
    title: 'Performance Master',
    description: 'Complete all performance milestones',
    icon: 'award',
    position: 5,
    prerequisiteId: 'perf_stage',
    isFuture: true,
  },
];

// All nodes combined
export const MASTERY_NODES: MasteryNode[] = [
  ...THEORY_NODES,
  ...TECHNIQUE_NODES,
  ...PERFORMANCE_NODES,
];

// Technique thresholds (seconds) mapped to node IDs
export const TECHNIQUE_THRESHOLDS: Record<string, number> = {
  technique_first_steps: 300,      // 5 minutes
  technique_building: 3600,        // 1 hour
  technique_committed: 36000,      // 10 hours
  technique_near_mastery: 86400,   // 24 hours
  technique_master: 180000,        // 50 hours
};

// Path colors (consistent with app design system)
export const PATH_COLORS: Record<MasteryPath, string> = {
  theory: '#0E273C',      // Colors.deepSpaceBlue
  technique: '#EE6C4D',   // Colors.vermilion
  performance: '#417B5A', // Colors.moss
};

// Path angles for radial display (degrees from top)
export const PATH_ANGLES: Record<MasteryPath, number> = {
  theory: 210,      // Bottom-left
  technique: 330,   // Bottom-right
  performance: 90,  // Top
};

/**
 * Get nodes for a specific path
 */
export function getNodesForPath(path: MasteryPath): MasteryNode[] {
  return MASTERY_NODES.filter(node => node.path === path);
}

/**
 * Get node by ID
 */
export function getNodeById(nodeId: string): MasteryNode | undefined {
  return MASTERY_NODES.find(node => node.id === nodeId);
}

/**
 * Check if a node is unlockable (prerequisite completed)
 */
export function isNodeUnlockable(
  nodeId: string,
  completedNodeIds: string[]
): boolean {
  const node = getNodeById(nodeId);
  if (!node) return false;

  // First node in path has no prerequisite
  if (!node.prerequisiteId) return true;

  // Check if prerequisite is completed
  return completedNodeIds.includes(node.prerequisiteId);
}

/**
 * Get node status based on completion and prerequisites
 */
export function getNodeStatus(
  nodeId: string,
  completedNodeIds: string[]
): NodeStatus {
  if (completedNodeIds.includes(nodeId)) return 'completed';
  if (isNodeUnlockable(nodeId, completedNodeIds)) return 'unlocked';
  return 'locked';
}

/**
 * Calculate star rating based on completed paths (0-3)
 */
export function calculateStarRating(
  theoryComplete: boolean,
  techniqueComplete: boolean,
  performanceComplete: boolean
): 0 | 1 | 2 | 3 {
  const count = [theoryComplete, techniqueComplete, performanceComplete]
    .filter(Boolean).length;
  return count as 0 | 1 | 2 | 3;
}

/**
 * Check if technique node should be completed based on practice time
 */
export function checkTechniqueNodeCompletion(
  totalPracticeSeconds: number
): string[] {
  const completedNodeIds: string[] = [];

  for (const [nodeId, threshold] of Object.entries(TECHNIQUE_THRESHOLDS)) {
    if (totalPracticeSeconds >= threshold) {
      completedNodeIds.push(nodeId);
    }
  }

  return completedNodeIds;
}

/**
 * Map database mastery progress to node completion status
 */
export function mapMasteryProgressToNodes(
  progress: SongMasteryProgress | null,
  totalPracticeSeconds: number
): string[] {
  const completedNodeIds: string[] = [];

  // Technique path is based on practice time
  completedNodeIds.push(...checkTechniqueNodeCompletion(totalPracticeSeconds));

  if (!progress) return completedNodeIds;

  // Theory path from database flags
  if (progress.theory_chords_added) completedNodeIds.push('theory_chords');
  if (progress.theory_structure_mapped) completedNodeIds.push('theory_structure');
  if (progress.theory_key_set) completedNodeIds.push('theory_key');
  if (progress.theory_transpose_practiced) completedNodeIds.push('theory_transpose');
  if (progress.theory_master) completedNodeIds.push('theory_master');

  // Performance path from database flags
  if (progress.perf_first_recording) completedNodeIds.push('perf_recording');
  if (progress.perf_self_review) completedNodeIds.push('perf_review');
  if (progress.perf_band_ready) completedNodeIds.push('perf_band');
  if (progress.perf_stage_prep) completedNodeIds.push('perf_stage');
  if (progress.perf_performance_master) completedNodeIds.push('perf_master');

  return completedNodeIds;
}
