/**
 * Streak System Types
 * Daily practice chain with evolving flame visuals
 */

// Flame visual levels based on streak length
export type FlameLevel = 'ember' | 'flame' | 'blaze' | 'inferno';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  streak_freezes_available: number; // Max 3
  daily_goal_minutes: number;
  last_practice_date: string | null; // ISO date string (YYYY-MM-DD)
  streak_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyPracticeLog {
  id: string;
  user_id: string;
  practice_date: string; // ISO date string (YYYY-MM-DD)
  total_minutes: number;
  goal_met: boolean;
  streak_freeze_used: boolean;
}

export interface StreakUpdateResult {
  current_streak: number;
  longest_streak: number;
  freezes_available: number;
  goal_met_today: boolean;
  freeze_used: boolean;
  freeze_earned: boolean;
  streak_broken: boolean;
}

export interface WeeklySummary {
  week_start_date: string;
  total_minutes: number;
  days_goal_met: number;
  average_minutes_per_day: number;
}

// Daily goal options
export const DAILY_GOAL_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
] as const;

export type DailyGoalMinutes = typeof DAILY_GOAL_OPTIONS[number]['value'];

// Flame level thresholds
export const FLAME_THRESHOLDS: Record<FlameLevel, { min: number; max: number }> = {
  ember: { min: 1, max: 7 },       // Days 1-7: Small orange flame
  flame: { min: 8, max: 30 },      // Days 8-30: Medium fire with sparks
  blaze: { min: 31, max: 100 },    // Days 31-100: Blue flame
  inferno: { min: 101, max: Infinity }, // Days 100+: Purple eternal flame
};

// Flame colors for each level
export const FLAME_COLORS: Record<FlameLevel, {
  primary: string;
  secondary: string;
  glow: string;
}> = {
  ember: {
    primary: '#FF6B35',    // Orange
    secondary: '#FFAA00',  // Yellow-orange
    glow: 'rgba(255,107,53,0.5)',
  },
  flame: {
    primary: '#FF4500',    // Red-orange
    secondary: '#FFD700',  // Gold
    glow: 'rgba(255,69,0,0.6)',
  },
  blaze: {
    primary: '#00BFFF',    // Deep sky blue
    secondary: '#1E90FF',  // Dodger blue
    glow: 'rgba(0,191,255,0.6)',
  },
  inferno: {
    primary: '#9932CC',    // Dark orchid (purple)
    secondary: '#DA70D6',  // Orchid
    glow: 'rgba(153,50,204,0.7)',
  },
};

/**
 * Determine flame level based on streak days
 */
export function getFlameLevel(streakDays: number): FlameLevel {
  if (streakDays <= 0) return 'ember'; // No streak, but show ember for visual
  if (streakDays <= 7) return 'ember';
  if (streakDays <= 30) return 'flame';
  if (streakDays <= 100) return 'blaze';
  return 'inferno';
}

/**
 * Get flame colors for current streak
 */
export function getFlameColors(streakDays: number) {
  const level = getFlameLevel(streakDays);
  return FLAME_COLORS[level];
}

/**
 * Format streak display text
 */
export function formatStreakText(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Check if streak is active (practiced today or within freeze window)
 */
export function isStreakActive(lastPracticeDate: string | null): boolean {
  if (!lastPracticeDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastPractice = new Date(lastPracticeDate);
  lastPractice.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

  return diffDays <= 1; // Active if practiced today or yesterday
}

/**
 * Calculate days until next streak freeze is earned
 */
export function daysUntilNextFreeze(currentStreak: number): number {
  const nextFreezeAt = Math.ceil(currentStreak / 7) * 7;
  return nextFreezeAt - currentStreak;
}
