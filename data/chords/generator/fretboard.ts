/**
 * Fretboard Model
 * Maps notes to positions on the guitar fretboard
 */

import { NOTES, NoteName, transposeNote, getNoteIndex } from './music-theory';

/** Standard guitar tuning (low E to high E) - string indices 0-5 */
export const STANDARD_TUNING: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'];

/** Maximum fret to consider for chord voicings */
export const MAX_FRET = 15;

/** Maximum fret span for human hand (typically 4 frets) */
export const MAX_FRET_SPAN = 4;

/** Number of strings on a guitar */
export const STRING_COUNT = 6;

/** Position on the fretboard */
export interface FretPosition {
  string: number; // 0-5 (0 = low E, 5 = high e)
  fret: number; // 0-15 (0 = open string)
  note: NoteName;
}

/** Cached fretboard map for performance */
let fretboardCache: Map<string, FretPosition[]> | null = null;

/**
 * Get the note at a specific fretboard position
 */
export function getNoteAtPosition(string: number, fret: number): NoteName {
  const openNote = STANDARD_TUNING[string];
  return transposeNote(openNote, fret);
}

/**
 * Find all positions on the fretboard where a specific note can be played
 */
export function findNotePositions(
  note: string,
  maxFret: number = MAX_FRET,
): FretPosition[] {
  const positions: FretPosition[] = [];
  const targetIndex = getNoteIndex(note);

  for (let string = 0; string < STRING_COUNT; string++) {
    const openNoteIndex = getNoteIndex(STANDARD_TUNING[string]);

    for (let fret = 0; fret <= maxFret; fret++) {
      const noteAtFret = (openNoteIndex + fret) % 12;

      if (noteAtFret === targetIndex) {
        positions.push({
          string,
          fret,
          note: NOTES[targetIndex],
        });
      }
    }
  }

  return positions;
}

/**
 * Build a complete fretboard map (cached for performance)
 * Maps note names to all their positions on the fretboard
 */
export function buildFretboardMap(): Map<string, FretPosition[]> {
  if (fretboardCache) {
    return fretboardCache;
  }

  const map = new Map<string, FretPosition[]>();

  for (const note of NOTES) {
    map.set(note, findNotePositions(note));
  }

  fretboardCache = map;
  return map;
}

/**
 * Get positions for a note from the cached map
 */
export function getPositionsForNote(note: string): FretPosition[] {
  const map = buildFretboardMap();
  const normalizedNote = NOTES[getNoteIndex(note)];
  return map.get(normalizedNote) || [];
}

/**
 * Get positions on a specific string where chord notes can be played
 */
export function getChordPositionsOnString(
  stringIndex: number,
  chordNotes: NoteName[],
  maxFret: number = MAX_FRET,
): FretPosition[] {
  const positions: FretPosition[] = [];
  const openNote = STANDARD_TUNING[stringIndex];
  const openNoteIndex = getNoteIndex(openNote);

  // Convert chord notes to indices for fast lookup
  const chordNoteIndices = new Set(chordNotes.map(getNoteIndex));

  for (let fret = 0; fret <= maxFret; fret++) {
    const noteIndex = (openNoteIndex + fret) % 12;

    if (chordNoteIndices.has(noteIndex)) {
      positions.push({
        string: stringIndex,
        fret,
        note: NOTES[noteIndex],
      });
    }
  }

  return positions;
}

/**
 * Calculate the fret span (distance between lowest and highest fret)
 * Ignores open strings (fret 0) in span calculation
 */
export function calculateFretSpan(frets: (number | null)[]): number {
  const frettedPositions = frets.filter(
    (f): f is number => f !== null && f > 0,
  );

  if (frettedPositions.length === 0) {
    return 0; // All open or muted
  }

  const minFret = Math.min(...frettedPositions);
  const maxFret = Math.max(...frettedPositions);

  return maxFret - minFret;
}

/**
 * Check if a fret combination is physically playable
 */
export function isPlayable(
  frets: (number | null)[],
  maxSpan: number = MAX_FRET_SPAN,
): boolean {
  const span = calculateFretSpan(frets);
  return span <= maxSpan;
}

/**
 * Get the bass note (lowest sounding note) from a voicing
 */
export function getBassNote(frets: (number | null)[]): NoteName | null {
  for (let string = 0; string < STRING_COUNT; string++) {
    const fret = frets[string];
    if (fret !== null) {
      return getNoteAtPosition(string, fret);
    }
  }
  return null;
}

/**
 * Count how many strings are being played (not muted)
 */
export function countPlayedStrings(frets: (number | null)[]): number {
  return frets.filter((f) => f !== null).length;
}

/**
 * Count how many strings are muted
 */
export function countMutedStrings(frets: (number | null)[]): number {
  return frets.filter((f) => f === null).length;
}

/**
 * Get the lowest (minimum) fret position, excluding open strings
 */
export function getBaseFret(frets: (number | null)[]): number {
  const frettedPositions = frets.filter(
    (f): f is number => f !== null && f > 0,
  );

  if (frettedPositions.length === 0) {
    return 1; // All open strings
  }

  return Math.min(...frettedPositions);
}

/**
 * Check if the open string note is a chord tone
 */
export function isOpenStringChordTone(
  stringIndex: number,
  chordNotes: NoteName[],
): boolean {
  const openNote = STANDARD_TUNING[stringIndex];
  const openNoteIndex = getNoteIndex(openNote);
  return chordNotes.some((note) => getNoteIndex(note) === openNoteIndex);
}
