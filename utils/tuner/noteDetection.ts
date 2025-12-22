/**
 * Note Detection Utilities
 *
 * Functions for matching detected frequencies to guitar strings
 * and calculating tuning deviation in cents.
 */

import {
  GuitarString,
  GUITAR_STRINGS_ARRAY,
  NoteDetectionResult,
  TuningDirection,
  TuningGuidance,
} from '@/types/tuner';
import { TUNING_CONFIG } from '@/constants/TunerConfig';

/** Reference frequency for A4 (standard concert pitch) */
const A4_FREQ = 440;

/**
 * Calculate cents offset between two frequencies
 * Formula: cents = 1200 * log2(detectedFreq / targetFreq)
 *
 * @param detectedFreq - The frequency detected from audio
 * @param targetFreq - The target frequency to compare against
 * @returns Cents offset (negative = flat, positive = sharp)
 */
export function calculateCents(detectedFreq: number, targetFreq: number): number {
  if (detectedFreq <= 0 || targetFreq <= 0) return 0;
  return 1200 * Math.log2(detectedFreq / targetFreq);
}

/**
 * Check if a cents offset is within tuning tolerance
 *
 * @param centsOffset - The cents deviation from target
 * @param tolerance - The acceptable deviation (default: inTuneEnter from config)
 * @returns True if within tolerance
 */
export function isInTune(
  centsOffset: number,
  tolerance: number = TUNING_CONFIG.inTuneEnter
): boolean {
  return Math.abs(centsOffset) <= tolerance;
}

/**
 * Get tuning direction from cents offset
 *
 * @param cents - Cents deviation from target
 * @returns 'flat', 'sharp', or 'perfect'
 */
export function getTuningDirection(cents: number): TuningDirection {
  if (Math.abs(cents) <= TUNING_CONFIG.inTuneEnter) {
    return 'perfect';
  }
  return cents < 0 ? 'flat' : 'sharp';
}

/**
 * Handle harmonic detection for guitar strings
 *
 * Guitar strings naturally produce harmonics that can confuse pitch detection.
 * This function checks if a detected frequency might be a 2nd harmonic
 * and returns the fundamental frequency if so.
 *
 * Note: Only checks 2nd harmonic, not 3rd or 4th, because:
 * - Low E 3rd harmonic (247 Hz) ≈ B string (247 Hz)
 * - Guitar strings are inherently harmonically related
 *
 * @param frequency - The detected frequency
 * @returns The effective frequency (fundamental or original)
 */
export function getEffectiveFrequency(frequency: number): {
  frequency: number;
  isHarmonic: boolean;
} {
  // First check if frequency is already close to a guitar string
  for (const guitarString of GUITAR_STRINGS_ARRAY) {
    const cents = Math.abs(calculateCents(frequency, guitarString.frequency));
    if (cents <= TUNING_CONFIG.stringMatchTolerance) {
      // Already matches a string - not a harmonic
      return { frequency, isHarmonic: false };
    }
  }

  // Check if this could be a 2nd harmonic (octave above)
  const potentialFundamental = frequency / 2;

  // Use 3% tolerance for harmonic matching
  const harmonicTolerance = 0.03;

  for (const guitarString of GUITAR_STRINGS_ARRAY) {
    const ratio = potentialFundamental / guitarString.frequency;
    if (Math.abs(ratio - 1) <= harmonicTolerance) {
      // This is likely a 2nd harmonic
      return { frequency: potentialFundamental, isHarmonic: true };
    }
  }

  // Not a harmonic we recognize
  return { frequency, isHarmonic: false };
}

/**
 * Find the closest guitar string to a detected frequency
 *
 * @param detectedFrequency - The frequency from pitch detection
 * @returns Match result with string, cents offset, and direction, or null if no match
 */
export function findClosestGuitarString(
  detectedFrequency: number
): NoteDetectionResult | null {
  if (detectedFrequency <= 0 || !isFinite(detectedFrequency)) {
    return null;
  }

  // Apply harmonic correction
  const { frequency: effectiveFreq, isHarmonic } =
    getEffectiveFrequency(detectedFrequency);

  let closestString: GuitarString | null = null;
  let closestCents = Infinity;

  // Find the string with minimum cents deviation
  for (const guitarString of GUITAR_STRINGS_ARRAY) {
    const cents = calculateCents(effectiveFreq, guitarString.frequency);
    const absCents = Math.abs(cents);

    if (absCents < Math.abs(closestCents)) {
      closestCents = cents;
      closestString = guitarString;
    }
  }

  // Reject if too far from any string
  if (!closestString || Math.abs(closestCents) > TUNING_CONFIG.maxCentsForMatch) {
    return null;
  }

  return {
    string: closestString,
    cents: closestCents,
    direction: getTuningDirection(closestCents),
    isHarmonic,
  };
}

/**
 * Convert frequency to chromatic note name
 * Uses A4 = 440 Hz as reference
 *
 * @param frequency - The frequency to convert
 * @returns Note name with octave (e.g., "A4", "E2")
 */
export function frequencyToNote(frequency: number): string {
  if (frequency <= 0) return '--';

  const semitones = Math.round(12 * Math.log2(frequency / A4_FREQ));
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = 4 + Math.floor((semitones + 9) / 12);
  const noteIndex = ((semitones % 12) + 12) % 12;
  const note = noteNames[noteIndex];

  return `${note}${octave}`;
}

/**
 * Get user-friendly tuning guidance
 *
 * @param cents - Cents deviation from target
 * @param direction - 'flat', 'sharp', or 'perfect'
 * @returns Guidance object with message, urgency, and action
 */
export function getTuningGuidance(
  cents: number,
  direction: TuningDirection
): TuningGuidance {
  const absCents = Math.abs(cents);

  if (direction === 'perfect' || absCents <= TUNING_CONFIG.inTuneEnter) {
    return {
      message: 'In Tune',
      urgency: 'perfect',
      action: 'hold',
    };
  }

  if (absCents <= 10) {
    return {
      message: direction === 'flat' ? 'Slightly Flat' : 'Slightly Sharp',
      urgency: 'low',
      action: direction === 'flat' ? 'tighten' : 'loosen',
    };
  }

  if (absCents <= 25) {
    return {
      message: direction === 'flat' ? 'Flat' : 'Sharp',
      urgency: 'medium',
      action: direction === 'flat' ? 'tighten' : 'loosen',
    };
  }

  return {
    message: direction === 'flat' ? 'Very Flat' : 'Very Sharp',
    urgency: 'high',
    action: direction === 'flat' ? 'tighten' : 'loosen',
  };
}

/**
 * Smooth frequency readings using exponential moving average
 *
 * @param newFrequency - Latest frequency reading
 * @param previousFrequency - Previous smoothed frequency
 * @param alpha - Smoothing factor (0-1, higher = faster response)
 * @returns Smoothed frequency
 */
export function smoothFrequency(
  newFrequency: number,
  previousFrequency: number | null,
  alpha: number = 0.5
): number {
  if (previousFrequency === null || previousFrequency <= 0) {
    return newFrequency;
  }

  return alpha * newFrequency + (1 - alpha) * previousFrequency;
}
