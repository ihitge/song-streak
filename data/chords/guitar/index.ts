/**
 * Guitar Chord Dictionary
 * ~20 common guitar chord fingerings
 */

import type { ChordDefinition } from '@/types/chords';

export const GUITAR_CHORDS: Record<string, ChordDefinition> = {
  // ============ MAJOR CHORDS ============
  C: {
    canonical: 'C',
    display: 'C',
    root: 'C',
    quality: 'major',
    voicings: [
      {
        id: 'c-open',
        name: 'Open',
        frets: [null, 3, 2, 0, 1, 0],
        fingers: [null, 3, 2, null, 1, null],
        difficulty: 'easy',
      },
    ],
  },

  D: {
    canonical: 'D',
    display: 'D',
    root: 'D',
    quality: 'major',
    voicings: [
      {
        id: 'd-open',
        name: 'Open',
        frets: [null, null, 0, 2, 3, 2],
        fingers: [null, null, null, 1, 3, 2],
        difficulty: 'easy',
      },
    ],
  },

  E: {
    canonical: 'E',
    display: 'E',
    root: 'E',
    quality: 'major',
    voicings: [
      {
        id: 'e-open',
        name: 'Open',
        frets: [0, 2, 2, 1, 0, 0],
        fingers: [null, 2, 3, 1, null, null],
        difficulty: 'easy',
      },
    ],
  },

  F: {
    canonical: 'F',
    display: 'F',
    root: 'F',
    quality: 'major',
    voicings: [
      {
        id: 'f-barre',
        name: 'Barre',
        frets: [1, 3, 3, 2, 1, 1],
        fingers: [1, 3, 4, 2, 1, 1],
        barres: [{ fret: 1, fromString: 0, toString: 5 }],
        baseFret: 1,
        difficulty: 'intermediate',
      },
    ],
  },

  G: {
    canonical: 'G',
    display: 'G',
    root: 'G',
    quality: 'major',
    voicings: [
      {
        id: 'g-open',
        name: 'Open',
        frets: [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, null, null, null, 3],
        difficulty: 'easy',
      },
    ],
  },

  A: {
    canonical: 'A',
    display: 'A',
    root: 'A',
    quality: 'major',
    voicings: [
      {
        id: 'a-open',
        name: 'Open',
        frets: [null, 0, 2, 2, 2, 0],
        fingers: [null, null, 1, 2, 3, null],
        difficulty: 'easy',
      },
    ],
  },

  B: {
    canonical: 'B',
    display: 'B',
    root: 'B',
    quality: 'major',
    voicings: [
      {
        id: 'b-barre',
        name: 'Barre',
        frets: [null, 2, 4, 4, 4, 2],
        fingers: [null, 1, 2, 3, 4, 1],
        barres: [{ fret: 2, fromString: 1, toString: 5 }],
        baseFret: 2,
        difficulty: 'intermediate',
      },
    ],
  },

  // ============ MINOR CHORDS ============
  Am: {
    canonical: 'Am',
    display: 'Am',
    root: 'A',
    quality: 'minor',
    voicings: [
      {
        id: 'am-open',
        name: 'Open',
        frets: [null, 0, 2, 2, 1, 0],
        fingers: [null, null, 2, 3, 1, null],
        difficulty: 'easy',
      },
    ],
  },

  Dm: {
    canonical: 'Dm',
    display: 'Dm',
    root: 'D',
    quality: 'minor',
    voicings: [
      {
        id: 'dm-open',
        name: 'Open',
        frets: [null, null, 0, 2, 3, 1],
        fingers: [null, null, null, 2, 3, 1],
        difficulty: 'easy',
      },
    ],
  },

  Em: {
    canonical: 'Em',
    display: 'Em',
    root: 'E',
    quality: 'minor',
    voicings: [
      {
        id: 'em-open',
        name: 'Open',
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [null, 2, 3, null, null, null],
        difficulty: 'easy',
      },
    ],
  },

  Bm: {
    canonical: 'Bm',
    display: 'Bm',
    root: 'B',
    quality: 'minor',
    voicings: [
      {
        id: 'bm-barre',
        name: 'Barre',
        frets: [null, 2, 4, 4, 3, 2],
        fingers: [null, 1, 3, 4, 2, 1],
        barres: [{ fret: 2, fromString: 1, toString: 5 }],
        baseFret: 2,
        difficulty: 'intermediate',
      },
    ],
  },

  'F#m': {
    canonical: 'F#m',
    display: 'F#m',
    root: 'F#',
    quality: 'minor',
    voicings: [
      {
        id: 'fsm-barre',
        name: 'Barre',
        frets: [2, 4, 4, 2, 2, 2],
        fingers: [1, 3, 4, 1, 1, 1],
        barres: [{ fret: 2, fromString: 0, toString: 5 }],
        baseFret: 2,
        difficulty: 'intermediate',
      },
    ],
  },

  // ============ SEVENTH CHORDS ============
  G7: {
    canonical: 'G7',
    display: 'G7',
    root: 'G',
    quality: 'dominant',
    extensions: ['7'],
    voicings: [
      {
        id: 'g7-open',
        name: 'Open',
        frets: [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, null, null, null, 1],
        difficulty: 'easy',
      },
    ],
  },

  A7: {
    canonical: 'A7',
    display: 'A7',
    root: 'A',
    quality: 'dominant',
    extensions: ['7'],
    voicings: [
      {
        id: 'a7-open',
        name: 'Open',
        frets: [null, 0, 2, 0, 2, 0],
        fingers: [null, null, 2, null, 3, null],
        difficulty: 'easy',
      },
    ],
  },

  D7: {
    canonical: 'D7',
    display: 'D7',
    root: 'D',
    quality: 'dominant',
    extensions: ['7'],
    voicings: [
      {
        id: 'd7-open',
        name: 'Open',
        frets: [null, null, 0, 2, 1, 2],
        fingers: [null, null, null, 2, 1, 3],
        difficulty: 'easy',
      },
    ],
  },

  E7: {
    canonical: 'E7',
    display: 'E7',
    root: 'E',
    quality: 'dominant',
    extensions: ['7'],
    voicings: [
      {
        id: 'e7-open',
        name: 'Open',
        frets: [0, 2, 0, 1, 0, 0],
        fingers: [null, 2, null, 1, null, null],
        difficulty: 'easy',
      },
    ],
  },

  Am7: {
    canonical: 'Am7',
    display: 'Am7',
    root: 'A',
    quality: 'minor',
    extensions: ['7'],
    voicings: [
      {
        id: 'am7-open',
        name: 'Open',
        frets: [null, 0, 2, 0, 1, 0],
        fingers: [null, null, 2, null, 1, null],
        difficulty: 'easy',
      },
    ],
  },

  Em7: {
    canonical: 'Em7',
    display: 'Em7',
    root: 'E',
    quality: 'minor',
    extensions: ['7'],
    voicings: [
      {
        id: 'em7-open',
        name: 'Open',
        frets: [0, 2, 0, 0, 0, 0],
        fingers: [null, 2, null, null, null, null],
        difficulty: 'easy',
      },
    ],
  },

  // ============ SUSPENDED & ADD CHORDS ============
  Dsus4: {
    canonical: 'Dsus4',
    display: 'Dsus4',
    root: 'D',
    quality: 'suspended',
    extensions: ['sus4'],
    voicings: [
      {
        id: 'dsus4-open',
        name: 'Open',
        frets: [null, null, 0, 2, 3, 3],
        fingers: [null, null, null, 1, 2, 3],
        difficulty: 'easy',
      },
    ],
  },

  Asus4: {
    canonical: 'Asus4',
    display: 'Asus4',
    root: 'A',
    quality: 'suspended',
    extensions: ['sus4'],
    voicings: [
      {
        id: 'asus4-open',
        name: 'Open',
        frets: [null, 0, 2, 2, 3, 0],
        fingers: [null, null, 1, 2, 3, null],
        difficulty: 'easy',
      },
    ],
  },

  Cadd9: {
    canonical: 'Cadd9',
    display: 'Cadd9',
    root: 'C',
    quality: 'add',
    extensions: ['add9'],
    voicings: [
      {
        id: 'cadd9-open',
        name: 'Open',
        frets: [null, 3, 2, 0, 3, 0],
        fingers: [null, 2, 1, null, 3, null],
        difficulty: 'easy',
      },
    ],
  },
};

/** Get all available chord names */
export const getGuitarChordNames = (): string[] => Object.keys(GUITAR_CHORDS);

/** Check if a chord exists in the dictionary */
export const hasGuitarChord = (chordName: string): boolean =>
  chordName in GUITAR_CHORDS;

/** Get a specific chord definition */
export const getGuitarChord = (
  chordName: string,
): ChordDefinition | undefined => GUITAR_CHORDS[chordName];
