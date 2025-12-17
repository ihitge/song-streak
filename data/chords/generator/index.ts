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
  getNoteIndex,
} from './music-theory';
import {
  generateVoicings,
  generateVoicingsWithFallback,
  VoicingCandidate,
  detectBarres,
} from './voicing-generator';
import { rankVoicings, VoicingScore } from './voicing-scorer';

/** Valid root notes for validation */
const VALID_ROOTS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
];

/** Maximum chord name length (prevents DoS from very long strings) */
const MAX_CHORD_NAME_LENGTH = 50;

/**
 * Result of chord generation including partial voicing info
 */
export interface GenerateChordResult {
  chord: ChordDefinition | null;
  isPartial: boolean;
  omittedNotes: string[];
}

/**
 * Reduce chord notes by omitting less essential notes
 * Priority: omit 5th first, then higher extensions
 */
function reduceChordNotes(
  notes: NoteName[],
  root: NoteName,
): { notes: NoteName[]; omitted: string[] } {
  if (notes.length <= 3) {
    return { notes, omitted: [] };
  }

  const rootIndex = getNoteIndex(root);
  const fifthIndex = (rootIndex + 7) % 12;

  // First try: omit the 5th (most disposable in most chords)
  const withoutFifth = notes.filter((n) => getNoteIndex(n) !== fifthIndex);
  if (withoutFifth.length !== notes.length && withoutFifth.length >= 3) {
    return { notes: withoutFifth, omitted: ['5th'] };
  }

  // Second try: keep only essential notes (root, 3rd, 7th if present)
  // Take first 4 notes which are typically the most important
  if (notes.length > 4) {
    const essentialNotes = notes.slice(0, 4);
    const omittedExtensions = notes
      .slice(4)
      .map((_, i) => {
        const intervals = [9, 11, 13]; // Common extensions
        return intervals[i] ? `${intervals[i]}th` : 'extension';
      });
    return { notes: essentialNotes, omitted: omittedExtensions };
  }

  return { notes, omitted: [] };
}

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
  // Input validation
  if (!chordName || typeof chordName !== 'string') return null;
  if (chordName.length > MAX_CHORD_NAME_LENGTH) {
    if (__DEV__) {
      console.warn(`[Chord] Chord name too long: ${chordName.length} chars`);
    }
    return null;
  }

  // Normalize the chord name
  const normalized = chordName.trim();
  if (normalized.length === 0) return null;

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

  // Validate root note
  if (!VALID_ROOTS.includes(normalizedRoot)) {
    if (__DEV__) {
      console.warn(`[Chord] Invalid root note: ${root}`);
    }
    return null;
  }

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
 * Returns GenerateChordResult with partial voicing info
 */
export function generateChord(
  chordName: string,
  maxVoicings: number = 5,
): GenerateChordResult {
  const emptyResult: GenerateChordResult = {
    chord: null,
    isPartial: false,
    omittedNotes: [],
  };

  // Parse the chord name
  const parsed = parseChordName(chordName);
  if (!parsed) return emptyResult;

  // Get the notes in this chord
  const chordNotes = getChordNotes(parsed.root, parsed.quality);
  if (chordNotes.length === 0) return emptyResult;

  // Track partial voicing state
  let isPartial = false;
  let omittedNotes: string[] = [];
  let notesToUse = chordNotes;

  // Generate voicing candidates with fallback for difficult chords
  let candidates = generateVoicingsWithFallback(notesToUse, parsed.root);

  // If no voicings found and we have extended chord, try reducing notes
  if (candidates.length === 0 && chordNotes.length > 3) {
    const reduced = reduceChordNotes(chordNotes, parsed.root);
    candidates = generateVoicingsWithFallback(reduced.notes, parsed.root);

    if (candidates.length > 0) {
      isPartial = true;
      omittedNotes = reduced.omitted;
      notesToUse = reduced.notes;
    }
  }

  if (candidates.length === 0) {
    // Even with reduced notes, no voicings found
    return emptyResult;
  }

  // Rank the candidates
  const ranked = rankVoicings(candidates, notesToUse, maxVoicings);

  // Convert to ChordFingering format
  const voicings = ranked.map((r, i) =>
    candidateToFingering(r.candidate, r.score, i),
  );

  // Build canonical name (normalized)
  const canonical = `${parsed.root}${parsed.quality === 'major' ? '' : parsed.quality}`.toLowerCase();

  return {
    chord: {
      canonical,
      display: parsed.display,
      root: parsed.root,
      quality: getQualityCategory(parsed.quality),
      voicings,
    },
    isPartial,
    omittedNotes,
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
