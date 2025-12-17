/**
 * Music Theory Engine
 * Core music theory constants and utilities for chord generation
 */

/** Chromatic scale (12 semitones) */
export const NOTES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTES)[number];

/** Enharmonic equivalents (flat → sharp conversion) */
export const ENHARMONIC_MAP: Record<string, NoteName> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
  // Double sharps/flats (rare but possible)
  'C##': 'D',
  'D##': 'E',
  'E##': 'F#',
  'F##': 'G',
  'G##': 'A',
  'A##': 'B',
  'B##': 'C#',
};

/**
 * Chord formulas - intervals in semitones from root
 * Each formula defines which notes make up the chord type
 */
export const CHORD_FORMULAS: Record<string, number[]> = {
  // === TRIADS ===
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],

  // === POWER CHORD ===
  '5': [0, 7],

  // === SUSPENDED ===
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],

  // === SEVENTH CHORDS ===
  '7': [0, 4, 7, 10], // Dominant 7th
  maj7: [0, 4, 7, 11], // Major 7th
  m7: [0, 3, 7, 10], // Minor 7th
  mMaj7: [0, 3, 7, 11], // Minor-Major 7th
  dim7: [0, 3, 6, 9], // Diminished 7th
  'm7b5': [0, 3, 6, 10], // Half-diminished 7th
  aug7: [0, 4, 8, 10], // Augmented 7th

  // === SUSPENDED SEVENTHS ===
  '7sus2': [0, 2, 7, 10],
  '7sus4': [0, 5, 7, 10],

  // === SIXTH CHORDS ===
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],

  // === ADD CHORDS ===
  add9: [0, 4, 7, 14], // 14 = octave + 2 (major 9th)
  add11: [0, 4, 7, 17], // 17 = octave + 5 (perfect 11th)
  madd9: [0, 3, 7, 14],

  // === EXTENDED CHORDS ===
  '9': [0, 4, 7, 10, 14], // Dominant 9th
  maj9: [0, 4, 7, 11, 14], // Major 9th
  m9: [0, 3, 7, 10, 14], // Minor 9th
  '11': [0, 4, 7, 10, 14, 17], // Dominant 11th
  m11: [0, 3, 7, 10, 14, 17], // Minor 11th
  '13': [0, 4, 7, 10, 14, 21], // Dominant 13th (21 = octave + 9)

  // === ALTERED CHORDS ===
  '7#9': [0, 4, 7, 10, 15], // 15 = augmented 9th
  '7b9': [0, 4, 7, 10, 13], // 13 = minor 9th
  '7#5': [0, 4, 8, 10], // Augmented 5th
  '7b5': [0, 4, 6, 10], // Diminished 5th
  '7#5#9': [0, 4, 8, 10, 15],
  '7b5b9': [0, 4, 6, 10, 13],
};

/**
 * Map quality strings to formula keys
 * Handles various naming conventions
 */
export const QUALITY_TO_FORMULA: Record<string, string> = {
  // Major variations
  '': 'major',
  maj: 'major',
  M: 'major',
  major: 'major',

  // Minor variations
  m: 'minor',
  min: 'minor',
  '-': 'minor',
  minor: 'minor',

  // Diminished
  dim: 'diminished',
  o: 'diminished',
  '°': 'diminished',

  // Augmented
  aug: 'augmented',
  '+': 'augmented',

  // Suspended
  sus2: 'sus2',
  sus4: 'sus4',
  sus: 'sus4', // Default sus = sus4

  // Power chord
  '5': '5',

  // Sevenths
  '7': '7',
  dom7: '7',
  maj7: 'maj7',
  M7: 'maj7',
  m7: 'm7',
  min7: 'm7',
  '-7': 'm7',
  mMaj7: 'mMaj7',
  'mM7': 'mMaj7',
  dim7: 'dim7',
  'o7': 'dim7',
  '°7': 'dim7',
  'm7b5': 'm7b5',
  'ø': 'm7b5',
  'ø7': 'm7b5',
  aug7: 'aug7',
  '+7': 'aug7',

  // Suspended sevenths
  '7sus2': '7sus2',
  '7sus4': '7sus4',
  '7sus': '7sus4',

  // Sixths
  '6': '6',
  m6: 'm6',

  // Add chords
  add9: 'add9',
  add11: 'add11',
  madd9: 'madd9',

  // Extended
  '9': '9',
  maj9: 'maj9',
  M9: 'maj9',
  m9: 'm9',
  min9: 'm9',
  '11': '11',
  m11: 'm11',
  '13': '13',

  // Altered
  '7#9': '7#9',
  '7b9': '7b9',
  '7#5': '7#5',
  '7b5': '7b5',
};

/**
 * Get the index of a note in the chromatic scale (0-11)
 */
export function getNoteIndex(note: string): number {
  // Normalize enharmonics
  const normalized = ENHARMONIC_MAP[note] || note;

  const index = NOTES.indexOf(normalized as NoteName);
  if (index === -1) {
    // Try without accidentals
    const baseNote = note.charAt(0).toUpperCase();
    const baseIndex = NOTES.indexOf(baseNote as NoteName);
    if (baseIndex === -1 && __DEV__) {
      console.warn(`[Chord] Unknown note: ${note}`);
    }
    return baseIndex >= 0 ? baseIndex : 0; // Return 0 (C) as safe fallback
  }
  return index;
}

/**
 * Transpose a note by a number of semitones
 */
export function transposeNote(note: string, semitones: number): NoteName {
  const index = getNoteIndex(note);
  const newIndex = ((index + semitones) % 12 + 12) % 12; // Handle negative semitones
  return NOTES[newIndex];
}

/**
 * Get all notes in a chord given root and quality
 * Returns unique notes (octave-collapsed)
 */
export function getChordNotes(root: string, quality: string): NoteName[] {
  // Get the formula key
  const formulaKey = QUALITY_TO_FORMULA[quality] || quality;
  const formula = CHORD_FORMULAS[formulaKey];

  if (!formula) {
    // Unknown quality - try to parse as combination
    // e.g., "m7b5" might not be directly mapped
    if (__DEV__) {
      console.warn(`[Chord] Unknown chord quality: ${quality}, defaulting to major`);
    }
    return getChordNotes(root, 'major');
  }

  // Apply intervals to root note
  const notes = formula.map((interval) => {
    // Collapse octaves (intervals > 12)
    const collapsedInterval = interval % 12;
    return transposeNote(root, collapsedInterval);
  });

  // Remove duplicates (some extended chords have octave duplicates)
  return [...new Set(notes)];
}

/**
 * Parse a chord quality string into its components
 * Handles complex qualities like "m7b5", "7sus4", "maj9"
 */
export function parseQuality(qualityStr: string): {
  baseQuality: string;
  extensions: string[];
} {
  // Common patterns
  const patterns = [
    // Extended and altered first (more specific)
    /^(maj9|m9|min9)$/,
    /^(maj7|m7|min7|dim7|aug7|mMaj7)$/,
    /^(7#9|7b9|7#5|7b5)$/,
    /^(7sus[24]?)$/,
    /^(m7b5|ø7?)$/,
    // Sixths
    /^(m?6)$/,
    // Add chords
    /^(m?add[0-9]+)$/,
    // Simple
    /^(7|9|11|13)$/,
    /^(sus[24])$/,
    /^(dim|aug|m|min|maj|M|\+|°|o|-)$/,
    /^5$/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(qualityStr)) {
      return { baseQuality: qualityStr, extensions: [] };
    }
  }

  // Complex quality - try to break it down
  // e.g., "m7b5add9" → baseQuality: "m7b5", extensions: ["add9"]
  return { baseQuality: qualityStr, extensions: [] };
}

/**
 * Get formula for a complex chord by combining base + extensions
 */
export function getComplexChordFormula(quality: string): number[] | null {
  // First try direct lookup
  const formulaKey = QUALITY_TO_FORMULA[quality] || quality;
  if (CHORD_FORMULAS[formulaKey]) {
    return CHORD_FORMULAS[formulaKey];
  }

  // Try to parse complex quality
  const { baseQuality } = parseQuality(quality);
  const baseKey = QUALITY_TO_FORMULA[baseQuality] || baseQuality;

  return CHORD_FORMULAS[baseKey] || null;
}
