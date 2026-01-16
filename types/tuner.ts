/**
 * Tuner Types - Guitar & Bass Tuner Type Definitions
 *
 * Based on YIN pitch detection algorithm
 * Supports multiple guitar and bass tunings
 */

export interface GuitarString {
  name: string;
  note: string;
  frequency: number;
  stringNumber: number;
  fullName: string;
}

export type TunerInstrument = 'Guitar' | 'Bass';

export type TuningType = 'standard' | 'dropD' | 'openG' | 'openD' | 'dadgad';
export type BassTuningType = 'standard';

export interface GuitarTuning {
  id: TuningType | BassTuningType;
  label: string;
  strings: GuitarString[];
}

// Standard Tuning (E A D G B E) - Most common tuning
const STANDARD_TUNING: GuitarString[] = [
  { name: 'E', note: 'E2', frequency: 82.41, stringNumber: 6, fullName: 'Low E' },
  { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  { name: 'B', note: 'B3', frequency: 246.94, stringNumber: 2, fullName: 'B' },
  { name: 'E', note: 'E4', frequency: 329.63, stringNumber: 1, fullName: 'High E' },
];

// Drop D Tuning (D A D G B E) - Low E dropped to D, popular in rock/metal
const DROP_D_TUNING: GuitarString[] = [
  { name: 'D', note: 'D2', frequency: 73.42, stringNumber: 6, fullName: 'Low D' },
  { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  { name: 'B', note: 'B3', frequency: 246.94, stringNumber: 2, fullName: 'B' },
  { name: 'E', note: 'E4', frequency: 329.63, stringNumber: 1, fullName: 'High E' },
];

// Open G Tuning (D G D G B D) - Used in blues, slide guitar, Keith Richards style
const OPEN_G_TUNING: GuitarString[] = [
  { name: 'D', note: 'D2', frequency: 73.42, stringNumber: 6, fullName: 'Low D' },
  { name: 'G', note: 'G2', frequency: 98.0, stringNumber: 5, fullName: 'G' },
  { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  { name: 'B', note: 'B3', frequency: 246.94, stringNumber: 2, fullName: 'B' },
  { name: 'D', note: 'D4', frequency: 293.66, stringNumber: 1, fullName: 'High D' },
];

// Open D Tuning (D A D F# A D) - Popular for slide guitar and folk
const OPEN_D_TUNING: GuitarString[] = [
  { name: 'D', note: 'D2', frequency: 73.42, stringNumber: 6, fullName: 'Low D' },
  { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  { name: 'F#', note: 'F#3', frequency: 185.0, stringNumber: 3, fullName: 'F#' },
  { name: 'A', note: 'A3', frequency: 220.0, stringNumber: 2, fullName: 'A' },
  { name: 'D', note: 'D4', frequency: 293.66, stringNumber: 1, fullName: 'High D' },
];

// DADGAD Tuning (D A D G A D) - Celtic/folk tuning, used by Jimmy Page
const DADGAD_TUNING: GuitarString[] = [
  { name: 'D', note: 'D2', frequency: 73.42, stringNumber: 6, fullName: 'Low D' },
  { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  { name: 'A', note: 'A3', frequency: 220.0, stringNumber: 2, fullName: 'A' },
  { name: 'D', note: 'D4', frequency: 293.66, stringNumber: 1, fullName: 'High D' },
];

// ============================================
// BASS TUNINGS
// ============================================

// Bass Standard Tuning (E A D G) - 4-string bass
const BASS_STANDARD_TUNING: GuitarString[] = [
  { name: 'E', note: 'E1', frequency: 41.20, stringNumber: 4, fullName: 'Low E' },
  { name: 'A', note: 'A1', frequency: 55.0, stringNumber: 3, fullName: 'A' },
  { name: 'D', note: 'D2', frequency: 73.42, stringNumber: 2, fullName: 'D' },
  { name: 'G', note: 'G2', frequency: 98.0, stringNumber: 1, fullName: 'G' },
];

// All available guitar tunings
export const GUITAR_TUNINGS: Record<TuningType, GuitarTuning> = {
  standard: { id: 'standard', label: 'STANDARD', strings: STANDARD_TUNING },
  dropD: { id: 'dropD', label: 'DROP D', strings: DROP_D_TUNING },
  openG: { id: 'openG', label: 'OPEN G', strings: OPEN_G_TUNING },
  openD: { id: 'openD', label: 'OPEN D', strings: OPEN_D_TUNING },
  dadgad: { id: 'dadgad', label: 'DADGAD', strings: DADGAD_TUNING },
};

// All available bass tunings
export const BASS_TUNINGS: Record<BassTuningType, GuitarTuning> = {
  standard: { id: 'standard', label: 'STANDARD', strings: BASS_STANDARD_TUNING },
};

// Helper to get strings for a guitar tuning
export function getStringsForTuning(tuningId: TuningType): GuitarString[] {
  return GUITAR_TUNINGS[tuningId]?.strings || STANDARD_TUNING;
}

// Helper to get strings for a bass tuning
export function getStringsForBassTuning(tuningId: BassTuningType): GuitarString[] {
  return BASS_TUNINGS[tuningId]?.strings || BASS_STANDARD_TUNING;
}

// Helper to get strings for an instrument and tuning
export function getStringsForInstrumentTuning(
  instrument: TunerInstrument,
  tuningId: TuningType | BassTuningType
): GuitarString[] {
  if (instrument === 'Bass') {
    return BASS_TUNINGS[tuningId as BassTuningType]?.strings || BASS_STANDARD_TUNING;
  }
  return GUITAR_TUNINGS[tuningId as TuningType]?.strings || STANDARD_TUNING;
}

// Legacy exports for backward compatibility
export const GUITAR_STRINGS = {
  E2: STANDARD_TUNING[0],
  A2: STANDARD_TUNING[1],
  D3: STANDARD_TUNING[2],
  G3: STANDARD_TUNING[3],
  B3: STANDARD_TUNING[4],
  E4: STANDARD_TUNING[5],
} as const;

export type GuitarStringKey = keyof typeof GUITAR_STRINGS;

// Array of guitar strings for iteration (low to high) - Standard tuning
export const GUITAR_STRINGS_ARRAY: GuitarString[] = STANDARD_TUNING;

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
