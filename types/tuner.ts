/**
 * Tuner Types - Guitar Tuner Type Definitions
 *
 * Based on YIN pitch detection algorithm
 * Supports standard guitar tuning (EADGBE)
 */

// Guitar string frequencies (in Hz) for standard tuning
export const GUITAR_STRINGS = {
  E2: { name: 'E', note: 'E2', frequency: 82.41, stringNumber: 6, fullName: 'Low E' },
  A2: { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  D3: { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  G3: { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  B3: { name: 'B', note: 'B3', frequency: 246.94, stringNumber: 2, fullName: 'B' },
  E4: { name: 'E', note: 'E4', frequency: 329.63, stringNumber: 1, fullName: 'High E' },
} as const;

export type GuitarStringKey = keyof typeof GUITAR_STRINGS;

export interface GuitarString {
  name: string;
  note: string;
  frequency: number;
  stringNumber: number;
  fullName: string;
}

// Array of guitar strings for iteration (low to high)
export const GUITAR_STRINGS_ARRAY: GuitarString[] = [
  GUITAR_STRINGS.E2,
  GUITAR_STRINGS.A2,
  GUITAR_STRINGS.D3,
  GUITAR_STRINGS.G3,
  GUITAR_STRINGS.B3,
  GUITAR_STRINGS.E4,
];

// Tuner state machine status
export type TunerStatus =
  | 'idle' // Tuner not active
  | 'initializing' // Requesting permissions/starting audio
  | 'listening' // Listening for audio input
  | 'no_signal' // Audio too quiet (below threshold)
  | 'detecting' // Pitch detected, not in tune
  | 'in_tune'; // Pitch is within acceptable range

// Direction indicator for tuning
export type TuningDirection = 'flat' | 'sharp' | 'perfect' | null;

// Core tuner state
export interface TunerState {
  status: TunerStatus;
  frequency: number | null;
  cents: number | null;
  direction: TuningDirection;
  signalStrength: number; // 0-1 normalized volume
  isInTune: boolean;
}

// Full tuner hook return type
export interface TunerHookReturn extends TunerState {
  selectedString: GuitarString | null;
  setSelectedString: (string: GuitarString | null) => void;
  detectedString: GuitarString | null; // Auto-detected from frequency
  start: (initialString?: GuitarString) => void;
  stop: () => void;
  hasPermission: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  requestPermission: () => Promise<boolean>;
}

// Pitch detection result
export interface PitchResult {
  frequency: number;
  probability: number;
}

// Note detection result with guitar string matching
export interface NoteDetectionResult {
  string: GuitarString;
  cents: number;
  direction: TuningDirection;
  isHarmonic: boolean;
}

// Tuning guidance for UI display
export interface TuningGuidance {
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'perfect';
  action: 'tighten' | 'loosen' | 'hold';
}
