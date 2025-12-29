/**
 * Lifetime Milestones Types
 * Cross-song achievements that track overall user progress
 */

export type MilestoneCategory = 'time' | 'songs' | 'streak' | 'genre';
export type MilestoneTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LifetimeMilestone {
  id: string;
  category: MilestoneCategory;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  threshold: number;
  threshold_meta?: { genre?: string };
  tier: MilestoneTier;
  sort_order: number;
}

export interface UserLifetimeMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  unlocked_at: string;
}

export interface UserGlobalStats {
  total_practice_seconds: number;
  songs_mastered: number; // Songs with 1+ hour practice
  current_streak: number;
  longest_streak: number;
  last_practiced_at: string | null;
  genres_mastered: Record<string, number>; // genre -> mastered count
}

export interface WeeklyProgress {
  practiced_days: number;
  total_seconds: number;
  daily_breakdown: { date: string; seconds: number }[];
}

// Tier colors for trophy styling
export const MILESTONE_TIER_COLORS: Record<MilestoneTier, {
  primary: string;
  gradient: [string, string];
}> = {
  bronze: {
    primary: '#CD7F32',
    gradient: ['#CD7F32', '#8B4513'],
  },
  silver: {
    primary: '#C0C0C0',
    gradient: ['#E8E8E8', '#A0A0A0'],
  },
  gold: {
    primary: '#FFD700',
    gradient: ['#FFD700', '#DAA520'],
  },
  platinum: {
    primary: '#E5E4E2',
    gradient: ['#E5E4E2', '#B0B0B0'],
  },
  diamond: {
    primary: '#B9F2FF',
    gradient: ['#B9F2FF', '#00D4FF'],
  },
};

// Milestone definitions - Time (total practice across ALL songs)
export const TIME_MILESTONES: LifetimeMilestone[] = [
  {
    id: 'time_1hr',
    category: 'time',
    title: "Beginner's Journey",
    description: 'Practice for 1 hour total',
    icon: 'footprints',
    threshold: 3600, // seconds
    tier: 'bronze',
    sort_order: 1,
  },
  {
    id: 'time_10hr',
    category: 'time',
    title: 'Getting Serious',
    description: 'Practice for 10 hours total',
    icon: 'flame',
    threshold: 36000,
    tier: 'bronze',
    sort_order: 2,
  },
  {
    id: 'time_50hr',
    category: 'time',
    title: 'Dedicated Musician',
    description: 'Practice for 50 hours total',
    icon: 'book-open',
    threshold: 180000,
    tier: 'silver',
    sort_order: 3,
  },
  {
    id: 'time_100hr',
    category: 'time',
    title: 'Century Club',
    description: 'Practice for 100 hours total',
    icon: 'award',
    threshold: 360000,
    tier: 'silver',
    sort_order: 4,
  },
  {
    id: 'time_500hr',
    category: 'time',
    title: 'Practice Legend',
    description: 'Practice for 500 hours total',
    icon: 'star',
    threshold: 1800000,
    tier: 'gold',
    sort_order: 5,
  },
  {
    id: 'time_1000hr',
    category: 'time',
    title: 'Grandmaster',
    description: 'Practice for 1000 hours total',
    icon: 'crown',
    threshold: 3600000,
    tier: 'platinum',
    sort_order: 6,
  },
];

// Milestone definitions - Songs (mastered = 1+ hour practice)
export const SONG_MILESTONES: LifetimeMilestone[] = [
  {
    id: 'songs_1',
    category: 'songs',
    title: 'First Song',
    description: 'Master your first song (1hr+ practice)',
    icon: 'music',
    threshold: 1,
    tier: 'bronze',
    sort_order: 1,
  },
  {
    id: 'songs_5',
    category: 'songs',
    title: 'Growing Repertoire',
    description: 'Master 5 songs',
    icon: 'disc',
    threshold: 5,
    tier: 'bronze',
    sort_order: 2,
  },
  {
    id: 'songs_10',
    category: 'songs',
    title: 'Versatile Player',
    description: 'Master 10 songs',
    icon: 'layers',
    threshold: 10,
    tier: 'silver',
    sort_order: 3,
  },
  {
    id: 'songs_25',
    category: 'songs',
    title: 'Walking Jukebox',
    description: 'Master 25 songs',
    icon: 'list-music',
    threshold: 25,
    tier: 'silver',
    sort_order: 4,
  },
  {
    id: 'songs_50',
    category: 'songs',
    title: 'Living Library',
    description: 'Master 50 songs',
    icon: 'library',
    threshold: 50,
    tier: 'gold',
    sort_order: 5,
  },
  {
    id: 'songs_100',
    category: 'songs',
    title: 'Infinite Playlist',
    description: 'Master 100 songs',
    icon: 'infinity',
    threshold: 100,
    tier: 'platinum',
    sort_order: 6,
  },
];

// Milestone definitions - Streak (consecutive practice days)
export const STREAK_MILESTONES: LifetimeMilestone[] = [
  {
    id: 'streak_7',
    category: 'streak',
    title: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    icon: 'calendar-check',
    threshold: 7,
    tier: 'bronze',
    sort_order: 1,
  },
  {
    id: 'streak_30',
    category: 'streak',
    title: 'Month Master',
    description: 'Practice for 30 consecutive days',
    icon: 'calendar',
    threshold: 30,
    tier: 'silver',
    sort_order: 2,
  },
  {
    id: 'streak_90',
    category: 'streak',
    title: 'Quarterly Quest',
    description: 'Practice for 90 consecutive days',
    icon: 'calendar-range',
    threshold: 90,
    tier: 'gold',
    sort_order: 3,
  },
  {
    id: 'streak_365',
    category: 'streak',
    title: 'Year of Dedication',
    description: 'Practice for 365 consecutive days',
    icon: 'trophy',
    threshold: 365,
    tier: 'diamond',
    sort_order: 4,
  },
];

// Milestone definitions - Genre (5 mastered songs in genre)
export const GENRE_MILESTONES: LifetimeMilestone[] = [
  {
    id: 'genre_rock',
    category: 'genre',
    title: 'Rock Star',
    description: 'Master 5 Rock songs',
    icon: 'guitar',
    threshold: 5,
    threshold_meta: { genre: 'Rock' },
    tier: 'silver',
    sort_order: 1,
  },
  {
    id: 'genre_jazz',
    category: 'genre',
    title: 'Jazz Cat',
    description: 'Master 5 Jazz songs',
    icon: 'music-2',
    threshold: 5,
    threshold_meta: { genre: 'Jazz' },
    tier: 'silver',
    sort_order: 2,
  },
  {
    id: 'genre_blues',
    category: 'genre',
    title: 'Blues Brother',
    description: 'Master 5 Blues songs',
    icon: 'music-3',
    threshold: 5,
    threshold_meta: { genre: 'Blues' },
    tier: 'silver',
    sort_order: 3,
  },
  {
    id: 'genre_metal',
    category: 'genre',
    title: 'Metal Head',
    description: 'Master 5 Metal songs',
    icon: 'skull',
    threshold: 5,
    threshold_meta: { genre: 'Metal' },
    tier: 'silver',
    sort_order: 4,
  },
  {
    id: 'genre_classical',
    category: 'genre',
    title: 'Classical Virtuoso',
    description: 'Master 5 Classical songs',
    icon: 'scroll',
    threshold: 5,
    threshold_meta: { genre: 'Classical' },
    tier: 'silver',
    sort_order: 5,
  },
  {
    id: 'genre_country',
    category: 'genre',
    title: 'Country Road',
    description: 'Master 5 Country songs',
    icon: 'sun',
    threshold: 5,
    threshold_meta: { genre: 'Country' },
    tier: 'silver',
    sort_order: 6,
  },
  {
    id: 'genre_funk',
    category: 'genre',
    title: 'Funk Master',
    description: 'Master 5 Funk songs',
    icon: 'zap',
    threshold: 5,
    threshold_meta: { genre: 'Funk' },
    tier: 'silver',
    sort_order: 7,
  },
  {
    id: 'genre_folk',
    category: 'genre',
    title: 'Folk Hero',
    description: 'Master 5 Folk songs',
    icon: 'feather',
    threshold: 5,
    threshold_meta: { genre: 'Folk' },
    tier: 'silver',
    sort_order: 8,
  },
];

// All milestones combined
export const ALL_MILESTONES: LifetimeMilestone[] = [
  ...TIME_MILESTONES,
  ...SONG_MILESTONES,
  ...STREAK_MILESTONES,
  ...GENRE_MILESTONES,
];

// Notification threshold (show "approaching" at 90%)
export const NOTIFICATION_THRESHOLD = 0.9;

/**
 * Get milestones by category
 */
export function getMilestonesByCategory(category: MilestoneCategory): LifetimeMilestone[] {
  return ALL_MILESTONES.filter(m => m.category === category);
}

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): LifetimeMilestone | undefined {
  return ALL_MILESTONES.find(m => m.id === id);
}

/**
 * Calculate progress toward a milestone (0-100)
 */
export function getMilestoneProgress(
  milestone: LifetimeMilestone,
  stats: UserGlobalStats
): number {
  let current: number;

  switch (milestone.category) {
    case 'time':
      current = stats.total_practice_seconds;
      break;
    case 'songs':
      current = stats.songs_mastered;
      break;
    case 'streak':
      // Use longest_streak for milestone tracking
      current = Math.max(stats.current_streak, stats.longest_streak);
      break;
    case 'genre':
      const genre = milestone.threshold_meta?.genre;
      current = genre ? (stats.genres_mastered[genre] || 0) : 0;
      break;
    default:
      current = 0;
  }

  return Math.min(100, Math.round((current / milestone.threshold) * 100));
}

/**
 * Check if a milestone is unlocked
 */
export function isMilestoneUnlocked(
  milestone: LifetimeMilestone,
  stats: UserGlobalStats
): boolean {
  return getMilestoneProgress(milestone, stats) >= 100;
}

/**
 * Get next milestone in category
 */
export function getNextMilestone(
  category: MilestoneCategory,
  unlockedIds: string[],
  stats: UserGlobalStats
): LifetimeMilestone | null {
  const categoryMilestones = getMilestonesByCategory(category)
    .sort((a, b) => a.sort_order - b.sort_order);

  return categoryMilestones.find(m =>
    !unlockedIds.includes(m.id) && getMilestoneProgress(m, stats) < 100
  ) || null;
}

/**
 * Get milestones approaching completion (>90%)
 */
export function getNearingCompletion(
  unlockedIds: string[],
  stats: UserGlobalStats
): LifetimeMilestone[] {
  return ALL_MILESTONES.filter(m => {
    if (unlockedIds.includes(m.id)) return false;
    const progress = getMilestoneProgress(m, stats);
    return progress >= NOTIFICATION_THRESHOLD * 100 && progress < 100;
  });
}

/**
 * Check for newly earned milestones
 */
export function checkForNewMilestones(
  unlockedIds: string[],
  stats: UserGlobalStats
): LifetimeMilestone[] {
  return ALL_MILESTONES.filter(m =>
    !unlockedIds.includes(m.id) && isMilestoneUnlocked(m, stats)
  );
}

/**
 * Format hours for display
 */
export function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format milestone threshold for display
 */
export function formatMilestoneThreshold(milestone: LifetimeMilestone): string {
  switch (milestone.category) {
    case 'time':
      return formatHours(milestone.threshold);
    case 'songs':
      return `${milestone.threshold} song${milestone.threshold !== 1 ? 's' : ''}`;
    case 'streak':
      return `${milestone.threshold} day${milestone.threshold !== 1 ? 's' : ''}`;
    case 'genre':
      return `${milestone.threshold} songs`;
    default:
      return String(milestone.threshold);
  }
}
