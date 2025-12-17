/**
 * Chord Lookup Utility
 * Provides chord lookup with fallback strategies
 */

import type { ChordDefinition, ChordLookupResult } from '@/types/chords';
import { GUITAR_CHORDS } from '../guitar';
import { normalizeChordName, getDisplayName } from './normalizer';
import { generateChord, canGenerateChord } from '../generator';

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching chord names
 */
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Find similar chord names (fuzzy match)
 */
const findSimilarChords = (
  input: string,
  maxDistance: number = 2,
): string[] => {
  const normalized = normalizeChordName(input).toLowerCase();
  const available = Object.keys(GUITAR_CHORDS);

  const matches = available
    .map((chord) => ({
      chord,
      distance: levenshteinDistance(
        normalized,
        normalizeChordName(chord).toLowerCase(),
      ),
    }))
    .filter((m) => m.distance <= maxDistance && m.distance > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((m) => m.chord);

  return matches;
};

/**
 * Lookup a chord by name with four-tier fallback:
 * 1. Exact match after normalization (static dictionary)
 * 2. Fuzzy match (suggest similar from dictionary)
 * 3. Algorithmic generation (generate voicings on-the-fly)
 * 4. Unknown (returns display name only)
 */
export const lookupChord = (chordName: string): ChordLookupResult => {
  const displayName = getDisplayName(chordName);
  const normalized = normalizeChordName(chordName);

  // Tier 1: Exact match from static dictionary
  if (normalized in GUITAR_CHORDS) {
    return {
      status: 'found',
      chord: GUITAR_CHORDS[normalized],
      displayName,
      isGenerated: false,
    };
  }

  // Also check with original case-preserved
  if (chordName in GUITAR_CHORDS) {
    return {
      status: 'found',
      chord: GUITAR_CHORDS[chordName],
      displayName,
      isGenerated: false,
    };
  }

  // Tier 2: Algorithmic generation (try to generate before fuzzy match)
  // This ensures extended chords like Am9, Cmaj7, etc. get generated
  // even if they're similar to simpler chords in the dictionary
  if (canGenerateChord(chordName)) {
    const generated = generateChord(chordName);
    if (generated && generated.voicings.length > 0) {
      return {
        status: 'generated',
        chord: generated,
        displayName,
        isGenerated: true,
      };
    }
  }

  // Tier 3: Fuzzy match (suggest similar chords from dictionary)
  // Only reached if algorithmic generation fails
  const suggestions = findSimilarChords(chordName);
  if (suggestions.length > 0) {
    return {
      status: 'similar',
      suggestions,
      displayName,
    };
  }

  // Tier 4: Unknown
  return {
    status: 'unknown',
    displayName,
  };
};

/**
 * Batch lookup multiple chords
 */
export const lookupChords = (chordNames: string[]): ChordLookupResult[] => {
  return chordNames.map(lookupChord);
};

/**
 * Get default voicing for a chord
 */
export const getDefaultVoicing = (chord: ChordDefinition) => {
  return chord.voicings[0];
};

/**
 * Check if any chords in the list have available diagrams
 * Returns true for both static dictionary and generated chords
 */
export const hasAnyDiagrams = (chordNames: string[]): boolean => {
  return chordNames.some((name) => {
    const result = lookupChord(name);
    return result.status === 'found' || result.status === 'generated';
  });
};
