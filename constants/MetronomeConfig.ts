/**
 * Metronome Configuration Constants
 *
 * Based on the metronome skill requirements for professional-grade timing.
 * These values are critical for sample-accurate audio playback.
 */

import type { MetronomeConfig } from '@/types/metronome';

/**
 * Core metronome configuration
 * CRITICAL: Do not modify timing values without understanding the lookahead scheduling pattern
 */
export const METRONOME_CONFIG: MetronomeConfig = {
  // BPM Range
  bpmMin: 20, // Largo
  bpmMax: 300, // Prestissimo
  bpmDefault: 120, // Allegro moderato

  // Timing (CRITICAL for sample-accurate playback)
  // Standard JS timers have 50-100ms jitter - we use lookahead scheduling instead
  lookaheadMs: 100, // Schedule beats 100ms into future
  schedulerIntervalMs: 25, // Check for new beats every 25ms

  // Tap Tempo
  tapTimeoutMs: 2000, // Reset if no tap for 2 seconds
  tapMinCount: 2, // Minimum taps to calculate BPM
  tapMaxCount: 8, // Keep only recent taps for accuracy
};

// Visual constants for pendulum animation
export const PENDULUM_MAX_ANGLE = 30; // Maximum swing angle in degrees
export const PENDULUM_WIDTH = 8; // Arm width in pixels
export const PENDULUM_HEIGHT = 120; // Arm length in pixels
export const PENDULUM_BOB_SIZE = 24; // Weight at bottom of pendulum

// Touch targets (from metronome skill - must be large for instrument-in-hand use)
export const TAP_BUTTON_SIZE = 80; // Minimum 80pt for usability
export const START_STOP_SIZE = 72; // Matches PrimaryButton circle variant

// Animation timing
export const BEAT_FLASH_DURATION_MS = 100; // Duration of beat indicator flash

// Audio constants
export const AUDIO_SAMPLE_RATE = 44100; // Standard sample rate
