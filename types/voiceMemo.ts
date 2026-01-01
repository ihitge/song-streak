/**
 * Voice Memo Types
 *
 * Types for the Reel-to-Reel voice recorder feature.
 * Standalone memos for capturing song ideas (lyrics, melodies, riffs).
 */

/**
 * Maximum recording duration in seconds
 */
export const MAX_RECORDING_SECONDS = 30;

/**
 * Playback speed options
 */
export type PlaybackSpeed = 'slow' | 'normal' | 'fast';

/**
 * Speed multipliers for playback
 */
export const PLAYBACK_SPEED_MULTIPLIERS: Record<PlaybackSpeed, number> = {
  slow: 0.75,
  normal: 1.0,
  fast: 1.5,
};

/**
 * Recorder state machine states
 */
export type RecorderState =
  | 'idle'           // Ready to record
  | 'recording'      // Currently recording
  | 'paused'         // Recording paused (future)
  | 'stopped'        // Recording stopped, ready to save/play
  | 'playing'        // Playing back recording
  | 'uploading'      // Uploading to storage
  | 'error';         // Error state

/**
 * Transport button types
 */
export type TransportButton = 'rewind' | 'record' | 'stop' | 'play' | 'fastforward';

/**
 * Voice memo from database
 */
export interface VoiceMemo {
  id: string;
  created_by: string;
  band_id: string | null;
  audio_url: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  title: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  linked_song_id: string | null;
}

/**
 * Voice memo with additional display info
 */
export interface VoiceMemoWithMeta extends VoiceMemo {
  // Band name if shared with band
  band_name?: string;
  // Creator display name (for band shared memos)
  creator_name?: string;
  // Is this memo owned by current user
  is_owner: boolean;
}

/**
 * Create voice memo input
 */
export interface CreateVoiceMemoInput {
  audio_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  title?: string;
  notes?: string;
  band_id?: string;
}

/**
 * Update voice memo input
 */
export interface UpdateVoiceMemoInput {
  title?: string;
  notes?: string;
  band_id?: string | null;
}

/**
 * Recording session data (during recording)
 */
export interface RecordingSession {
  startTime: number;          // Timestamp when recording started
  elapsedSeconds: number;     // Current elapsed time
  audioLevel: number;         // Current audio level (0-1)
  audioLevelLeft: number;     // Left channel level (0-1)
  audioLevelRight: number;    // Right channel level (0-1)
  blob: Blob | null;          // Recorded audio blob (web)
}

/**
 * Playback session data (during playback)
 */
export interface PlaybackSession {
  currentTime: number;        // Current playback position in seconds
  duration: number;           // Total duration in seconds
  speed: PlaybackSpeed;       // Current playback speed
  isPlaying: boolean;         // Is currently playing
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to MM:SS / MM:SS display (elapsed / total)
 */
export function formatTimeWithTotal(elapsed: number, total: number): string {
  return `${formatTime(elapsed)} / ${formatTime(total)}`;
}

/**
 * Convert audio level (0-1) to decibels
 */
export function levelToDecibels(level: number): number {
  if (level <= 0) return -60;
  return Math.max(-60, 20 * Math.log10(level));
}

/**
 * Convert decibels to display percentage (0-100)
 * -60dB = 0%, 0dB = 100%
 */
export function decibelsToPercent(db: number): number {
  const minDb = -60;
  const maxDb = 0;
  return Math.max(0, Math.min(100, ((db - minDb) / (maxDb - minDb)) * 100));
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
