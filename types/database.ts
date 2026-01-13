/**
 * Database Types for Supabase Schema
 *
 * These types represent the raw database rows from Supabase tables.
 * Use these for type-safe database queries and mapping to app types.
 */

// ============================================================================
// Core Tables
// ============================================================================

/**
 * songs table - Main song library
 */
export interface DbSong {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  instrument: 'Guitar' | 'Bass';
  video_url: string | null;
  artwork_url: string | null;
  key: string | null;
  tempo: string | null;
  time_signature: string | null;
  difficulty: string | null; // DEPRECATED - kept for compatibility
  techniques: string[] | null; // Array of genre/technique tags
  total_practice_seconds: number;
  chords: string[] | null;
  scales: string[] | null;
  lyrics: string | null;
  song_structure: DbSongStructure | null;
  created_at: string;
  updated_at: string;
}

/**
 * Song structure JSONB field
 */
export interface DbSongStructure {
  intro?: boolean;
  verse?: boolean;
  chorus?: boolean;
  bridge?: boolean;
  outro?: boolean;
}

/**
 * practice_sessions table - Individual practice event logs
 */
export interface DbPracticeSession {
  id: string;
  user_id: string;
  song_id: string;
  duration_seconds: number;
  practiced_at: string;
}

/**
 * achievements table - Achievement definitions (static)
 */
export interface DbAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold_seconds: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * user_achievements table - Per-user achievement unlocks
 */
export interface DbUserAchievement {
  id: string;
  user_id: string;
  song_id: string;
  achievement_id: string;
  unlocked_at: string;
}

// ============================================================================
// Band Tables
// ============================================================================

/**
 * bands table - Band groups
 */
export interface DbBand {
  id: string;
  name: string;
  join_code: string;
  created_by: string;
  created_at: string;
}

/**
 * band_members table - Membership mapping
 */
export interface DbBandMember {
  id: string;
  band_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

/**
 * band_invites table - Email invitations
 */
export interface DbBandInvite {
  id: string;
  band_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

/**
 * setlists table - Band setlist definitions
 */
export interface DbSetlist {
  id: string;
  band_id: string;
  name: string;
  venue: string | null;
  gig_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * setlist_songs table - Songs in setlists
 */
export interface DbSetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  added_by: string;
  added_at: string;
}

// ============================================================================
// Gamification Tables
// ============================================================================

/**
 * user_streaks table - Daily practice streak tracking
 */
export interface DbUserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_freezes_available: number;
  daily_goal_minutes: number;
  last_practice_date: string | null;
  streak_started_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * daily_practice_logs table - Aggregated daily practice
 */
export interface DbDailyPracticeLog {
  id: string;
  user_id: string;
  practice_date: string;
  total_minutes: number;
  goal_met: boolean;
  streak_freeze_used: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * streak_freeze_history table - Freeze usage tracking
 */
export interface DbStreakFreezeHistory {
  id: string;
  user_id: string;
  action_type: 'earned' | 'used' | 'expired';
  action_date: string;
  streak_day_count: number | null;
  notes: string | null;
  created_at: string;
}

/**
 * song_mastery_progress table - Per-song skill tree
 */
export interface DbSongMasteryProgress {
  id: string;
  user_id: string;
  song_id: string;
  // Theory Path (5 nodes)
  theory_chords_added: boolean;
  theory_structure_mapped: boolean;
  theory_key_set: boolean;
  theory_transpose_practiced: boolean;
  theory_master: boolean;
  // Performance Path (5 nodes - future)
  perf_first_recording: boolean;
  perf_self_review: boolean;
  perf_band_ready: boolean;
  perf_stage_prep: boolean;
  perf_performance_master: boolean;
  // Star rating
  star_rating: number;
  created_at: string;
  updated_at: string;
}

/**
 * lifetime_milestones table - Global achievement definitions
 */
export interface DbLifetimeMilestone {
  id: string;
  category: 'time' | 'songs' | 'streak' | 'genre';
  title: string;
  description: string;
  icon: string;
  threshold: number;
  threshold_meta: Record<string, unknown> | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  sort_order: number;
  created_at: string;
}

/**
 * user_lifetime_milestones table - Per-user milestone unlocks
 */
export interface DbUserLifetimeMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  unlocked_at: string;
}

// ============================================================================
// Voice Memos Table
// ============================================================================

/**
 * voice_memos table - Reel-to-Reel voice recorder
 */
export interface DbVoiceMemo {
  id: string;
  created_by: string;
  band_id: string | null;
  audio_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  title: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  linked_song_id: string | null;
}

// ============================================================================
// Type Guards and Utilities
// ============================================================================

/**
 * Type guard to check if an error has a message property
 */
export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
