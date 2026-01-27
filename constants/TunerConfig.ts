/**
 * Tuner Configuration Constants
 *
 * Contains frequency tables, note mappings, detection thresholds,
 * and Kalman filter parameters for the chromatic tuner.
 */

// ============================================================================
// Audio Configuration
// ============================================================================

/** Sample rate for audio processing (Hz) */
export const TUNER_SAMPLE_RATE = 44100;

/** FFT size for standard pitch detection (guitar range >100Hz) */
export const FAST_FFT_SIZE = 2048;

/** FFT size for bass pitch detection (<100Hz) - larger window for low frequencies */
export const SLOW_FFT_SIZE = 8192;

/** Minimum clarity threshold for pitch detection (0-1) */
export const MIN_CLARITY_THRESHOLD = 0.85;

/** Minimum frequency to detect (Hz) - below Low B on 5-string bass */
export const MIN_FREQUENCY = 25;

/** Maximum frequency to detect (Hz) - above high E on guitar */
export const MAX_FREQUENCY = 1000;

/** Analysis frame rate (updates per second) */
export const ANALYSIS_RATE = 30;

// ============================================================================
// Reference Pitch
// ============================================================================

/** A4 reference frequency (Hz) - standard concert pitch */
export const A4_FREQUENCY = 440;

/** MIDI note number for A4 */
export const A4_MIDI_NOTE = 69;

// ============================================================================
// Note Names
// ============================================================================

/** Note names in chromatic order starting from C */
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Note names with flats for display (used when context prefers flats) */
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// ============================================================================
// Tuning Thresholds (in cents)
// ============================================================================

/** Perfect tune threshold - green LED */
export const IN_TUNE_THRESHOLD = 5;

/** Close threshold - light green */
export const CLOSE_THRESHOLD = 15;

/** Slightly off threshold - yellow */
export const SLIGHTLY_OFF_THRESHOLD = 25;

/** Moderately off threshold - orange */
export const MODERATELY_OFF_THRESHOLD = 35;

// Beyond 35 cents = far off (red)

// ============================================================================
// Kalman Filter Parameters
// ============================================================================

export const KALMAN_CONFIG = {
  /** Process noise - higher = more responsive, more jittery */
  processNoise: 0.1,
  /** Measurement noise - higher = smoother, more latent */
  measurementNoise: 0.5,
  /** Initial error covariance */
  initialCovariance: 1,
  /** Adaptive noise when pitch is rapidly changing */
  rapidChangeProcessNoise: 0.5,
  /** Threshold for detecting rapid pitch change (cents/frame) */
  rapidChangeThreshold: 20,
};

// ============================================================================
// Instrument Configurations
// ============================================================================

export type InstrumentType = 'guitar' | 'bass4' | 'bass5';

export interface StringConfig {
  /** String number (1 = highest pitch) */
  number: number;
  /** Note name */
  note: string;
  /** Octave number */
  octave: number;
  /** Target frequency in Hz */
  frequency: number;
}

/** Guitar standard tuning (E-A-D-G-B-E) */
export const GUITAR_STANDARD: StringConfig[] = [
  { number: 1, note: 'E', octave: 4, frequency: 329.63 },
  { number: 2, note: 'B', octave: 3, frequency: 246.94 },
  { number: 3, note: 'G', octave: 3, frequency: 196.00 },
  { number: 4, note: 'D', octave: 3, frequency: 146.83 },
  { number: 5, note: 'A', octave: 2, frequency: 110.00 },
  { number: 6, note: 'E', octave: 2, frequency: 82.41 },
];

/** Bass 4-string standard tuning (E-A-D-G) */
export const BASS_4_STANDARD: StringConfig[] = [
  { number: 1, note: 'G', octave: 2, frequency: 98.00 },
  { number: 2, note: 'D', octave: 2, frequency: 73.42 },
  { number: 3, note: 'A', octave: 1, frequency: 55.00 },
  { number: 4, note: 'E', octave: 1, frequency: 41.20 },
];

/** Bass 5-string standard tuning (B-E-A-D-G) */
export const BASS_5_STANDARD: StringConfig[] = [
  { number: 1, note: 'G', octave: 2, frequency: 98.00 },
  { number: 2, note: 'D', octave: 2, frequency: 73.42 },
  { number: 3, note: 'A', octave: 1, frequency: 55.00 },
  { number: 4, note: 'E', octave: 1, frequency: 41.20 },
  { number: 5, note: 'B', octave: 0, frequency: 30.87 },
];

/** Get string configuration for instrument type */
export function getInstrumentStrings(instrument: InstrumentType): StringConfig[] {
  switch (instrument) {
    case 'guitar':
      return GUITAR_STANDARD;
    case 'bass4':
      return BASS_4_STANDARD;
    case 'bass5':
      return BASS_5_STANDARD;
    default:
      return GUITAR_STANDARD;
  }
}

/** Get instrument display name */
export function getInstrumentName(instrument: InstrumentType): string {
  switch (instrument) {
    case 'guitar':
      return 'Guitar';
    case 'bass4':
      return '4-String Bass';
    case 'bass5':
      return '5-String Bass';
    default:
      return 'Guitar';
  }
}

// ============================================================================
// Frequency Utilities
// ============================================================================

/**
 * Convert frequency to MIDI note number (continuous, not rounded)
 * @param frequency Frequency in Hz
 * @returns MIDI note number (can be fractional)
 */
export function frequencyToMidi(frequency: number): number {
  return 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NOTE;
}

/**
 * Convert MIDI note number to frequency
 * @param midi MIDI note number
 * @returns Frequency in Hz
 */
export function midiToFrequency(midi: number): number {
  return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI_NOTE) / 12);
}

/**
 * Convert frequency to note information
 * @param frequency Frequency in Hz
 * @returns Note name, octave, and cents deviation
 */
export function frequencyToNote(frequency: number): {
  note: string;
  octave: number;
  cents: number;
  midiNote: number;
} {
  const midiNote = frequencyToMidi(frequency);
  const roundedMidi = Math.round(midiNote);
  const cents = (midiNote - roundedMidi) * 100;
  const noteIndex = ((roundedMidi % 12) + 12) % 12; // Handle negative modulo
  const note = NOTE_NAMES[noteIndex];
  const octave = Math.floor(roundedMidi / 12) - 1;

  return { note, octave, cents, midiNote: roundedMidi };
}

/**
 * Find the closest target string for a detected frequency
 * @param frequency Detected frequency
 * @param strings String configurations
 * @returns Closest string and cents deviation
 */
export function findClosestString(
  frequency: number,
  strings: StringConfig[]
): { string: StringConfig; cents: number } | null {
  if (strings.length === 0) return null;

  let closest: StringConfig = strings[0];
  let minCents = Infinity;

  for (const str of strings) {
    const centsFromTarget = 1200 * Math.log2(frequency / str.frequency);
    const absCents = Math.abs(centsFromTarget);

    if (absCents < Math.abs(minCents)) {
      closest = str;
      minCents = centsFromTarget;
    }
  }

  return { string: closest, cents: minCents };
}
