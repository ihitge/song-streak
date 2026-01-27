/**
 * Tuner Type Definitions
 *
 * Types for pitch detection, tuner state, and instrument configuration.
 */

import type { InstrumentType, StringConfig } from '@/constants/TunerConfig';

// ============================================================================
// Pitch Detection Types
// ============================================================================

/** Result from pitch detection algorithm */
export interface PitchResult {
  /** Detected frequency in Hz */
  frequency: number;
  /** Clarity/confidence of detection (0-1) */
  clarity: number;
  /** Detected note name (C, C#, D, etc.) */
  note: string;
  /** Octave number */
  octave: number;
  /** Deviation from nearest note in cents (-50 to +50) */
  cents: number;
  /** MIDI note number of nearest note */
  midiNote: number;
  /** Timestamp of detection */
  timestamp: number;
}

/** Pitch detection hook return type */
export interface UsePitchDetectionReturn {
  /** Whether pitch detection is initialized and ready */
  isReady: boolean;
  /** Current detected pitch (null if no pitch detected) */
  pitch: PitchResult | null;
  /** Error message if initialization failed */
  error: string | null;
  /** Start listening for pitch */
  start: () => Promise<void>;
  /** Stop listening for pitch */
  stop: () => void;
  /** Whether currently listening */
  isListening: boolean;
}

// ============================================================================
// Tuner State Types
// ============================================================================

/** Overall tuner state */
export interface TunerState {
  /** Currently selected instrument */
  instrument: InstrumentType;
  /** Current pitch result (raw from detection) */
  rawPitch: PitchResult | null;
  /** Smoothed pitch result (after Kalman filtering) */
  smoothedPitch: SmoothedPitchResult | null;
  /** Target string (closest to detected pitch) */
  targetString: StringConfig | null;
  /** Cents deviation from target string */
  centsFromTarget: number | null;
  /** Whether currently in tune (within threshold) */
  isInTune: boolean;
  /** Whether tuner is active/listening */
  isActive: boolean;
  /** Error state */
  error: string | null;
}

/** Smoothed pitch result after Kalman filtering */
export interface SmoothedPitchResult {
  /** Smoothed frequency */
  frequency: number;
  /** Smoothed cents deviation */
  cents: number;
  /** Note name (from raw detection) */
  note: string;
  /** Octave (from raw detection) */
  octave: number;
  /** Original clarity */
  clarity: number;
}

/** Tuner hook return type */
export interface UseTunerReturn {
  /** Current tuner state */
  state: TunerState;
  /** Whether tuner is ready (audio initialized) */
  isReady: boolean;
  /** Whether tuner is listening */
  isListening: boolean;
  /** Start the tuner */
  start: () => Promise<void>;
  /** Stop the tuner */
  stop: () => void;
  /** Toggle tuner on/off */
  toggle: () => Promise<void>;
  /** Change selected instrument */
  setInstrument: (instrument: InstrumentType) => void;
  /** Get string configurations for current instrument */
  strings: StringConfig[];
  /** Whether microphone permission is granted */
  hasPermission: boolean;
  /** Request microphone permission */
  requestPermission: () => Promise<boolean>;
}

// ============================================================================
// Kalman Filter Types
// ============================================================================

/** Kalman filter state */
export interface KalmanState {
  /** Current state estimate */
  x: number;
  /** Error covariance */
  P: number;
}

/** Kalman filter configuration */
export interface KalmanConfig {
  /** Process noise covariance */
  Q: number;
  /** Measurement noise covariance */
  R: number;
}

// ============================================================================
// UI Types
// ============================================================================

/** Tuner display mode */
export type TunerDisplayMode = 'needle' | 'strobe';

/** Tuning accuracy level for visual feedback */
export type TuningAccuracy = 'perfect' | 'close' | 'slight' | 'moderate' | 'far' | 'none';

/** Get tuning accuracy from cents deviation */
export function getTuningAccuracy(cents: number | null): TuningAccuracy {
  if (cents === null) return 'none';
  const absCents = Math.abs(cents);
  if (absCents <= 5) return 'perfect';
  if (absCents <= 15) return 'close';
  if (absCents <= 25) return 'slight';
  if (absCents <= 35) return 'moderate';
  return 'far';
}

// ============================================================================
// Audio Types (extending existing audio.ts)
// ============================================================================

/** AnalyserNode interface for pitch detection */
export interface AnalyserNodeType {
  fftSize: number;
  frequencyBinCount: number;
  getFloatTimeDomainData(array: Float32Array): void;
  getByteFrequencyData(array: Uint8Array): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

/** MediaStreamAudioSourceNode interface */
export interface MediaStreamSourceType {
  connect(destination: AudioNode): void;
  disconnect(): void;
}
