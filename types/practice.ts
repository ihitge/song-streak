/**
 * Practice Session & Achievement Types
 */

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold_seconds: number;
  tier: AchievementTier;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  song_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  song_id: string;
  duration_seconds: number;
  practiced_at: string;
}

export interface PracticeStats {
  totalSeconds: number;
  sessionCount: number;
  lastPracticed: string | null;
}

// Achievement definitions (matching database)
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'practice_5min', title: 'First Steps', description: 'Practice a song for 5 minutes total', icon: 'footprints', threshold_seconds: 300, tier: 'bronze' },
  { id: 'practice_30min', title: 'Getting Warmed Up', description: 'Practice a song for 30 minutes total', icon: 'flame', threshold_seconds: 1800, tier: 'bronze' },
  { id: 'practice_1hr', title: 'Dedicated Student', description: 'Practice a song for 1 hour total', icon: 'book-open', threshold_seconds: 3600, tier: 'silver' },
  { id: 'practice_3hr', title: 'Serious Player', description: 'Practice a song for 3 hours total', icon: 'guitar', threshold_seconds: 10800, tier: 'silver' },
  { id: 'practice_10hr', title: 'Committed Artist', description: 'Practice a song for 10 hours total', icon: 'star', threshold_seconds: 36000, tier: 'gold' },
  { id: 'practice_24hr', title: 'Master in Training', description: 'Practice a song for 24 hours total', icon: 'crown', threshold_seconds: 86400, tier: 'gold' },
  { id: 'practice_50hr', title: 'Song Master', description: 'Practice a song for 50 hours total', icon: 'trophy', threshold_seconds: 180000, tier: 'platinum' },
];

// Tier colors for styling
export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

/**
 * Get the next achievement threshold based on current practice time
 */
export function getNextAchievement(totalSeconds: number, unlockedIds: string[]): Achievement | null {
  const sorted = [...ACHIEVEMENTS].sort((a, b) => a.threshold_seconds - b.threshold_seconds);
  return sorted.find(a => !unlockedIds.includes(a.id) && a.threshold_seconds > totalSeconds) || null;
}

/**
 * Check which achievements should be unlocked based on total practice time
 */
export function checkForNewAchievements(
  totalSeconds: number,
  alreadyUnlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    a => a.threshold_seconds <= totalSeconds && !alreadyUnlockedIds.includes(a.id)
  );
}

/**
 * Format seconds into HH:MM:SS display
 */
export function formatPracticeTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate progress percentage toward next achievement (0-100)
 */
export function calculateProgress(totalSeconds: number): number {
  // Find the highest achieved threshold
  const sortedThresholds = ACHIEVEMENTS
    .map(a => a.threshold_seconds)
    .sort((a, b) => a - b);

  // If we've passed all achievements, return 100
  const maxThreshold = sortedThresholds[sortedThresholds.length - 1];
  if (totalSeconds >= maxThreshold) return 100;

  // Find current bracket
  let prevThreshold = 0;
  let nextThreshold = sortedThresholds[0];

  for (let i = 0; i < sortedThresholds.length; i++) {
    if (totalSeconds < sortedThresholds[i]) {
      nextThreshold = sortedThresholds[i];
      prevThreshold = i > 0 ? sortedThresholds[i - 1] : 0;
      break;
    }
  }

  // Calculate progress within current bracket, then scale to overall position
  const bracketProgress = (totalSeconds - prevThreshold) / (nextThreshold - prevThreshold);
  const bracketIndex = sortedThresholds.indexOf(nextThreshold);
  const overallProgress = (bracketIndex + bracketProgress) / sortedThresholds.length;

  return Math.min(100, Math.max(0, overallProgress * 100));
}
