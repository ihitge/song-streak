/**
 * Chord Generator - Public API
 * Generates guitar chord fingerings algorithmically for any chord
 */

import { ChordDefinition, ChordFingering, BarrePosition } from '@/types/chords';
import {
  NoteName,
  getChordNotes,
  QUALITY_TO_FORMULA,
  CHORD_FORMULAS,
} from './music-theory';
import {
  generateVoicings,
  generateVoicingsWithFallback,
  VoicingCandidate,
  detectBarres,
} from './voicing-generator';
import { rankVoicings, VoicingScore } from './voicing-scorer';

/**
 * Parse a chord name into root note and quality
 * Examples:
 *   "Am" → { root: "A", quality: "minor" }
 *   "C#maj7" → { root: "C#", quality: "maj7" }
 *   "Bb7sus4" → { root: "A#", quality: "7sus4" }
 */
export function parseChordName(chordName: string): {
  root: NoteName;
  quality: string;
  display: string;
} | null {
  if (!chordName || chordName.length === 0) return null;

  // Normalize the chord name
  const normalized = chordName.trim();

  // Extract root note (with possible accidental)
  let root: string;
  let qualityStart: number;

  // Check for accidental (# or b)
  if (normalized.length >= 2 && (normalized[1] === '#' || normalized[1] === 'b')) {
    root = normalized.substring(0, 2);
    qualityStart = 2;
  } else {
    root = normalized.substring(0, 1);
    qualityStart = 1;
  }

  // Normalize root to uppercase
  root = root.charAt(0).toUpperCase() + root.slice(1);

  // Convert flats to sharps for internal consistency
  const flatToSharp: Record<string, string> = {
    Db: 'C#',
    Eb: 'D#',
    Fb: 'E',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
    Cb: 'B',
  };

  const normalizedRoot = (flatToSharp[root] || root) as NoteName;

  // Extract quality
  let quality = normalized.substring(qualityStart);

  // Handle common quality aliases
  if (quality === '' || quality === 'M' || quality === 'maj') {
    quality = 'major';
  } else if (quality === 'm' || quality === 'min' || quality === '-') {
    quality = 'minor';
  }

  // Check if we have a formula for this quality
  const formulaKey = QUALITY_TO_FORMULA[quality] || quality;
  if (!CHORD_FORMULAS[formulaKey] && !CHORD_FORMULAS[quality]) {
    // Unknown quality - try to find closest match
    // For now, default to major if completely unknown
    if (quality.includes('m') && !quality.includes('maj')) {
      quality = 'minor';
    } else {
      quality = 'major';
    }
  }

  return {
    root: normalizedRoot,
    quality: QUALITY_TO_FORMULA[quality] || quality,
    display: chordName,
  };
}

/**
 * Convert a VoicingCandidate to a ChordFingering
 */
function candidateToFingering(
  candidate: VoicingCandidate,
  score: VoicingScore,
  index: number,
): ChordFingering {
  // Detect barres
  const barres = detectBarres(candidate.frets);

  // Convert barres to our format
  const barrePositions: BarrePosition[] = barres.map((b) => ({
    fret: b.fret,
    fromString: b.fromString,
    toString: b.toString,
  }));

  // Determine difficulty based on score and characteristics
  let difficulty: 'easy' | 'intermediate' | 'advanced' = 'intermediate';

  if (score.total >= 70 && candidate.fretSpan <= 2 && barres.length === 0) {
    difficulty = 'easy';
  } else if (score.total < 50 || candidate.fretSpan >= 4 || barres.length > 0) {
    difficulty = 'advanced';
  }

  // Generate a name for this voicing
  let name = 'Standard';
  if (candidate.baseFret > 3) {
    name = `Position ${candidate.baseFret}`;
  } else if (barres.length > 0) {
    name = 'Barre';
  } else if (candidate.frets.filter((f) => f === 0).length >= 3) {
    name = 'Open';
  }

  return {
    id: `gen-${index}`,
    name,
    frets: candidate.frets,
    barres: barrePositions.length > 0 ? barrePositions : undefined,
    baseFret: candidate.baseFret > 1 ? candidate.baseFret : undefined,
    difficulty,
  };
}

/**
 * Determine the chord quality category for the type field
 */
function getQualityCategory(
  quality: string,
): 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant' | 'suspended' | 'add' {
  if (quality.includes('dim') || quality === 'diminished') {
    return 'diminished';
  }
  if (quality.includes('aug') || quality === 'augmented' || quality === '+') {
    return 'augmented';
  }
  if (quality.includes('sus')) {
    return 'suspended';
  }
  if (quality.includes('add')) {
    return 'add';
  }
  if (quality === '7' || quality === '9' || quality === '11' || quality === '13') {
    return 'dominant';
  }
  if (
    quality.includes('m') &&
    !quality.includes('maj') &&
    quality !== 'major'
  ) {
    return 'minor';
  }
  return 'major';
}

/**
 * Generate a chord definition for any chord name
 * Returns null if the chord cannot be parsed
 */
export function generateChord(
  chordName: string,
  maxVoicings: number = 5,
): ChordDefinition | null {
  // Parse the chord name
  const parsed = parseChordName(chordName);
  if (!parsed) return null;

  // Get the notes in this chord
  const chordNotes = getChordNotes(parsed.root, parsed.quality);
  if (chordNotes.length === 0) return null;

  // Generate voicing candidates with fallback for difficult chords
  const candidates = generateVoicingsWithFallback(
    chordNotes,
    parsed.root,
  );

  if (candidates.length === 0) {
    // Even with relaxed constraints, no voicings found
    // This is very rare - create a minimal power chord as fallback
    return null;
  }

  // Rank the candidates
  const ranked = rankVoicings(candidates, chordNotes, maxVoicings);

  // Convert to ChordFingering format
  const voicings = ranked.map((r, i) =>
    candidateToFingering(r.candidate, r.score, i),
  );

  // Build canonical name (normalized)
  const canonical = `${parsed.root}${parsed.quality === 'major' ? '' : parsed.quality}`.toLowerCase();

  return {
    canonical,
    display: parsed.display,
    root: parsed.root,
    quality: getQualityCategory(parsed.quality),
    voicings,
  };
}

/**
 * Check if a chord can be generated
 */
export function canGenerateChord(chordName: string): boolean {
  const parsed = parseChordName(chordName);
  if (!parsed) return false;

  const formulaKey = QUALITY_TO_FORMULA[parsed.quality] || parsed.quality;
  return CHORD_FORMULAS[formulaKey] !== undefined;
}

// Re-export types for convenience
export type { VoicingCandidate } from './voicing-generator';
export type { VoicingScore } from './voicing-scorer';
export { getChordNotes } from './music-theory';
