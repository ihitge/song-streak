/**
 * Practice Player Types
 *
 * Types for the audio practice player with pitch-preserved speed control.
 */

/**
 * Playback state for the practice player
 */
export type PlaybackState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

/**
 * Audio file information from document picker
 */
export interface AudioFile {
  /** Local file URI (from document picker) */
  uri: string;
  /** Original file name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type (audio/mpeg, audio/wav, etc.) */
  mimeType: string;
}

/**
 * Loop region for A-B repeat practice
 */
export interface LoopRegion {
  /** Start position in milliseconds */
  startMs: number;
  /** End position in milliseconds */
  endMs: number;
  /** Whether loop is active */
  enabled: boolean;
}

/**
 * Playback status with timing information
 */
export interface PlaybackStatus {
  /** Current position in milliseconds */
  positionMs: number;
  /** Total duration in milliseconds */
  durationMs: number;
  /** Playback rate (0.5 to 1.5) */
  rate: number;
  /** Whether pitch correction is enabled */
  pitchCorrected: boolean;
  /** Current volume (0 to 1) */
  volume: number;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is buffering */
  isBuffering: boolean;
}

/**
 * Practice player hook return type
 */
export interface UsePracticePlayerReturn {
  // State
  state: PlaybackState;
  status: PlaybackStatus | null;
  audioFile: AudioFile | null;
  loopRegion: LoopRegion;
  error: string | null;

  // Actions
  loadFile: (file: AudioFile) => Promise<void>;
  pickFile: () => Promise<AudioFile | null>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (positionMs: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setLoopRegion: (region: Partial<LoopRegion>) => void;
  clearLoopRegion: () => void;
  unload: () => Promise<void>;
}

/**
 * Supported playback rates
 */
export const PLAYBACK_RATES = [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/**
 * Default playback status
 */
export const DEFAULT_PLAYBACK_STATUS: PlaybackStatus = {
  positionMs: 0,
  durationMs: 0,
  rate: 1.0,
  pitchCorrected: true,
  volume: 1.0,
  isPlaying: false,
  isBuffering: false,
};

/**
 * Default loop region (disabled)
 */
export const DEFAULT_LOOP_REGION: LoopRegion = {
  startMs: 0,
  endMs: 0,
  enabled: false,
};

/**
 * Supported audio MIME types
 */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',     // MP3
  'audio/mp3',      // MP3 alternate
  'audio/wav',      // WAV
  'audio/wave',     // WAV alternate
  'audio/x-wav',    // WAV alternate
  'audio/aiff',     // AIFF
  'audio/x-aiff',   // AIFF alternate
  'audio/m4a',      // M4A
  'audio/x-m4a',    // M4A alternate
  'audio/mp4',      // MP4 audio
] as const;

/**
 * MIME types for document picker
 */
export const AUDIO_PICKER_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/aiff',
  'audio/mp4',
  'audio/x-m4a',
];
