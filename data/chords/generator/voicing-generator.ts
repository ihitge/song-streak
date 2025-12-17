/**
 * Voicing Generator
 * Generates playable guitar chord voicings using recursive backtracking
 */

import { NoteName, getNoteIndex } from './music-theory';
import {
  STRING_COUNT,
  MAX_FRET_SPAN,
  STANDARD_TUNING,
  getChordPositionsOnString,
  calculateFretSpan,
  countMutedStrings,
  getNoteAtPosition,
  isOpenStringChordTone,
} from './fretboard';

/** Constraints for voicing generation */
export interface GeneratorConstraints {
  maxFretSpan: number;
  requireRoot: boolean;
  minStrings: number;
  maxMutedStrings: number;
  preferLowPosition: boolean;
  maxFret: number;
  requireThird: boolean;
}

/** Default constraints */
export const DEFAULT_CONSTRAINTS: GeneratorConstraints = {
  maxFretSpan: MAX_FRET_SPAN,
  requireRoot: true,
  minStrings: 4,
  maxMutedStrings: 2,
  preferLowPosition: true,
  maxFret: 12,
  requireThird: true, // Third is essential for chord identity (major vs minor)
};

/** A candidate voicing before scoring */
export interface VoicingCandidate {
  frets: (number | null)[]; // null = muted
  notesPlayed: NoteName[]; // Which chord notes are sounding
  bassNote: NoteName | null;
  fretSpan: number;
  baseFret: number;
  playedStrings: number;
  hasRoot: boolean;
  hasThird: boolean;
  hasFifth: boolean;
}

/**
 * Generate all valid voicing candidates for a chord
 */
export function generateVoicings(
  chordNotes: NoteName[],
  rootNote: NoteName,
  constraints: Partial<GeneratorConstraints> = {},
): VoicingCandidate[] {
  const opts: GeneratorConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };
  const candidates: VoicingCandidate[] = [];

  // Pre-calculate chord note indices for fast lookup
  const chordNoteIndices = new Set(chordNotes.map(getNoteIndex));
  const rootIndex = getNoteIndex(rootNote);

  // Determine the third (if present) - it's typically the 2nd note in the chord
  // For major: 4 semitones, for minor: 3 semitones
  const thirdIndices = new Set([
    (rootIndex + 3) % 12, // Minor 3rd
    (rootIndex + 4) % 12, // Major 3rd
  ]);

  // Fifth is 7 semitones from root
  const fifthIndex = (rootIndex + 7) % 12;

  /**
   * Recursive function to build voicing string by string
   */
  function buildVoicing(
    stringIndex: number,
    currentFrets: (number | null)[],
    usedFrets: number[],
    notesPlayed: Set<NoteName>,
  ): void {
    // Base case: all strings processed
    if (stringIndex >= STRING_COUNT) {
      // Validate the complete voicing
      const playedStrings = currentFrets.filter((f) => f !== null).length;
      const mutedStrings = countMutedStrings(currentFrets);

      // Check minimum strings constraint
      if (playedStrings < opts.minStrings) return;

      // Check max muted strings
      if (mutedStrings > opts.maxMutedStrings) return;

      // Get bass note
      let bassNote: NoteName | null = null;
      for (let i = 0; i < STRING_COUNT; i++) {
        if (currentFrets[i] !== null) {
          bassNote = getNoteAtPosition(i, currentFrets[i]!);
          break;
        }
      }

      // Check root in bass (if required)
      const hasRootInBass = bassNote
        ? getNoteIndex(bassNote) === rootIndex
        : false;
      if (opts.requireRoot && !hasRootInBass) return;

      // Check if essential notes are present
      const playedIndices = new Set([...notesPlayed].map(getNoteIndex));
      const hasRoot = playedIndices.has(rootIndex);
      const hasThird = [...thirdIndices].some((i) => playedIndices.has(i));
      const hasFifth = playedIndices.has(fifthIndex);

      // Require at least root
      if (!hasRoot) return;

      // Optional: require third
      if (opts.requireThird && !hasThird) return;

      // Calculate fret span
      const fretSpan = calculateFretSpan(currentFrets);

      // Get base fret
      const frettedPositions = currentFrets.filter(
        (f): f is number => f !== null && f > 0,
      );
      const baseFret =
        frettedPositions.length > 0 ? Math.min(...frettedPositions) : 1;

      // Create candidate
      candidates.push({
        frets: [...currentFrets],
        notesPlayed: [...notesPlayed],
        bassNote,
        fretSpan,
        baseFret,
        playedStrings,
        hasRoot,
        hasThird,
        hasFifth,
      });

      return;
    }

    // Get possible frets on this string where chord notes exist
    const possiblePositions = getChordPositionsOnString(
      stringIndex,
      chordNotes,
      opts.maxFret,
    );

    // === Option 1: Mute this string ===
    // Only if we haven't exceeded max muted strings
    const currentMuted = currentFrets.filter((f) => f === null).length;
    if (currentMuted < opts.maxMutedStrings) {
      buildVoicing(
        stringIndex + 1,
        [...currentFrets, null],
        usedFrets,
        notesPlayed,
      );
    }

    // === Option 2: Play a chord note on this string ===
    for (const pos of possiblePositions) {
      // Skip if fret is beyond max
      if (pos.fret > opts.maxFret) continue;

      // Calculate potential fret span
      const potentialFrets =
        pos.fret > 0 ? [...usedFrets, pos.fret] : usedFrets;
      const potentialSpan =
        potentialFrets.length > 0
          ? Math.max(...potentialFrets) - Math.min(...potentialFrets)
          : 0;

      // Skip if span would exceed max
      if (potentialSpan > opts.maxFretSpan) continue;

      // Add this position
      const newNotesPlayed = new Set(notesPlayed);
      newNotesPlayed.add(pos.note);

      buildVoicing(
        stringIndex + 1,
        [...currentFrets, pos.fret],
        pos.fret > 0 ? [...usedFrets, pos.fret] : usedFrets,
        newNotesPlayed,
      );
    }

    // === Option 3: Open string (fret 0) if it's a chord tone ===
    // This is already handled in possiblePositions if fret 0 is a chord tone
    // But we explicitly handle it for clarity
    if (isOpenStringChordTone(stringIndex, chordNotes)) {
      const openNote = STANDARD_TUNING[stringIndex];
      const alreadyTried = possiblePositions.some((p) => p.fret === 0);

      if (!alreadyTried) {
        const newNotesPlayed = new Set(notesPlayed);
        newNotesPlayed.add(openNote);

        buildVoicing(
          stringIndex + 1,
          [...currentFrets, 0],
          usedFrets, // Open strings don't count in fret span
          newNotesPlayed,
        );
      }
    }
  }

  // Start recursion from string 0 (low E)
  buildVoicing(0, [], [], new Set());

  return candidates;
}

/**
 * Generate voicings with relaxed constraints if none found
 */
export function generateVoicingsWithFallback(
  chordNotes: NoteName[],
  rootNote: NoteName,
  constraints: Partial<GeneratorConstraints> = {},
): VoicingCandidate[] {
  // Try with original constraints (requireThird: true by default)
  let candidates = generateVoicings(chordNotes, rootNote, constraints);

  if (candidates.length > 0) {
    return candidates;
  }

  // Relax: don't require root in bass (but still require third)
  candidates = generateVoicings(chordNotes, rootNote, {
    ...constraints,
    requireRoot: false,
  });

  if (candidates.length > 0) {
    return candidates;
  }

  // Relax: allow more muted strings (still require third)
  candidates = generateVoicings(chordNotes, rootNote, {
    ...constraints,
    requireRoot: false,
    maxMutedStrings: 3,
    minStrings: 3,
  });

  if (candidates.length > 0) {
    return candidates;
  }

  // Relax: increase fret span (still require third)
  candidates = generateVoicings(chordNotes, rootNote, {
    ...constraints,
    requireRoot: false,
    maxMutedStrings: 3,
    minStrings: 3,
    maxFretSpan: 5,
  });

  if (candidates.length > 0) {
    return candidates;
  }

  // Last resort: don't require third (for power chords, etc.)
  candidates = generateVoicings(chordNotes, rootNote, {
    ...constraints,
    requireRoot: false,
    requireThird: false,
    maxMutedStrings: 3,
    minStrings: 3,
    maxFretSpan: 5,
  });

  return candidates;
}

/**
 * Detect if a voicing contains a barre (same finger across multiple strings)
 */
export function detectBarres(
  frets: (number | null)[],
): { fret: number; fromString: number; toString: number }[] {
  const barres: { fret: number; fromString: number; toString: number }[] = [];

  // Find consecutive strings with the same fret (not 0 or null)
  let startString = -1;
  let currentFret = -1;

  for (let i = 0; i < frets.length; i++) {
    const fret = frets[i];

    if (fret !== null && fret > 0) {
      if (fret === currentFret && startString !== -1) {
        // Continue potential barre
      } else {
        // Check if previous was a barre
        if (startString !== -1 && i - startString >= 2 && currentFret > 0) {
          barres.push({
            fret: currentFret,
            fromString: startString,
            toString: i - 1,
          });
        }
        // Start new potential barre
        startString = i;
        currentFret = fret;
      }
    } else {
      // Check if previous was a barre
      if (startString !== -1 && i - startString >= 2 && currentFret > 0) {
        barres.push({
          fret: currentFret,
          fromString: startString,
          toString: i - 1,
        });
      }
      startString = -1;
      currentFret = -1;
    }
  }

  // Check final stretch
  if (
    startString !== -1 &&
    frets.length - startString >= 2 &&
    currentFret > 0
  ) {
    barres.push({
      fret: currentFret,
      fromString: startString,
      toString: frets.length - 1,
    });
  }

  return barres;
}
