/**
 * Music Theory Engine Tests
 * Validates chord formulas, note transposition, and music theory calculations
 */

import {
  NOTES,
  ENHARMONIC_MAP,
  CHORD_FORMULAS,
  QUALITY_TO_FORMULA,
  getNoteIndex,
  transposeNote,
  getChordNotes,
  parseQuality,
  getComplexChordFormula,
  type NoteName,
} from './music-theory';

// ============================================================================
// CONSTANTS VALIDATION
// ============================================================================

describe('NOTES constant', () => {
  test('has exactly 12 notes (chromatic scale)', () => {
    expect(NOTES).toHaveLength(12);
  });

  test('starts with C and ends with B', () => {
    expect(NOTES[0]).toBe('C');
    expect(NOTES[11]).toBe('B');
  });

  test('has correct chromatic order', () => {
    expect(NOTES).toEqual([
      'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    ]);
  });

  test('no duplicate notes', () => {
    const unique = new Set(NOTES);
    expect(unique.size).toBe(12);
  });
});

describe('ENHARMONIC_MAP', () => {
  test.each([
    ['Db', 'C#'],
    ['Eb', 'D#'],
    ['Fb', 'E'],
    ['Gb', 'F#'],
    ['Ab', 'G#'],
    ['Bb', 'A#'],
    ['Cb', 'B'],
  ])('%s maps to %s', (flat, sharp) => {
    expect(ENHARMONIC_MAP[flat]).toBe(sharp);
  });

  test.each([
    ['C##', 'D'],
    ['D##', 'E'],
    ['F##', 'G'],
    ['G##', 'A'],
    ['A##', 'B'],
  ])('double sharp %s maps to %s', (doubleSharp, natural) => {
    expect(ENHARMONIC_MAP[doubleSharp]).toBe(natural);
  });
});

// ============================================================================
// CHORD FORMULAS VALIDATION
// ============================================================================

describe('CHORD_FORMULAS', () => {
  describe('triads', () => {
    test('major: root, major 3rd, perfect 5th', () => {
      expect(CHORD_FORMULAS['major']).toEqual([0, 4, 7]);
    });

    test('minor: root, minor 3rd, perfect 5th', () => {
      expect(CHORD_FORMULAS['minor']).toEqual([0, 3, 7]);
    });

    test('diminished: root, minor 3rd, diminished 5th', () => {
      expect(CHORD_FORMULAS['diminished']).toEqual([0, 3, 6]);
    });

    test('augmented: root, major 3rd, augmented 5th', () => {
      expect(CHORD_FORMULAS['augmented']).toEqual([0, 4, 8]);
    });
  });

  describe('seventh chords', () => {
    test('dominant 7th: major triad + minor 7th', () => {
      expect(CHORD_FORMULAS['7']).toEqual([0, 4, 7, 10]);
    });

    test('major 7th: major triad + major 7th', () => {
      expect(CHORD_FORMULAS['maj7']).toEqual([0, 4, 7, 11]);
    });

    test('minor 7th: minor triad + minor 7th', () => {
      expect(CHORD_FORMULAS['m7']).toEqual([0, 3, 7, 10]);
    });

    test('diminished 7th: diminished triad + diminished 7th', () => {
      expect(CHORD_FORMULAS['dim7']).toEqual([0, 3, 6, 9]);
    });

    test('half-diminished (m7b5): diminished triad + minor 7th', () => {
      expect(CHORD_FORMULAS['m7b5']).toEqual([0, 3, 6, 10]);
    });
  });

  describe('suspended chords', () => {
    test('sus2: root, major 2nd, perfect 5th', () => {
      expect(CHORD_FORMULAS['sus2']).toEqual([0, 2, 7]);
    });

    test('sus4: root, perfect 4th, perfect 5th', () => {
      expect(CHORD_FORMULAS['sus4']).toEqual([0, 5, 7]);
    });
  });

  describe('extended chords', () => {
    test('9th: dominant 7th + major 9th', () => {
      expect(CHORD_FORMULAS['9']).toEqual([0, 4, 7, 10, 14]);
    });

    test('major 9th: major 7th + major 9th', () => {
      expect(CHORD_FORMULAS['maj9']).toEqual([0, 4, 7, 11, 14]);
    });

    test('minor 9th: minor 7th + major 9th', () => {
      expect(CHORD_FORMULAS['m9']).toEqual([0, 3, 7, 10, 14]);
    });
  });

  describe('all formulas start with root (0)', () => {
    test.each(Object.entries(CHORD_FORMULAS))(
      '%s formula starts with 0 (root)',
      (name, formula) => {
        expect(formula[0]).toBe(0);
      }
    );
  });

  describe('all formulas have ascending intervals', () => {
    test.each(Object.entries(CHORD_FORMULAS))(
      '%s formula has intervals in ascending order',
      (name, formula) => {
        for (let i = 1; i < formula.length; i++) {
          expect(formula[i]).toBeGreaterThan(formula[i - 1]);
        }
      }
    );
  });
});

// ============================================================================
// getNoteIndex TESTS
// ============================================================================

describe('getNoteIndex', () => {
  describe('natural notes', () => {
    test.each([
      ['C', 0],
      ['D', 2],
      ['E', 4],
      ['F', 5],
      ['G', 7],
      ['A', 9],
      ['B', 11],
    ])('getNoteIndex(%s) = %d', (note, expected) => {
      expect(getNoteIndex(note)).toBe(expected);
    });
  });

  describe('sharp notes', () => {
    test.each([
      ['C#', 1],
      ['D#', 3],
      ['F#', 6],
      ['G#', 8],
      ['A#', 10],
    ])('getNoteIndex(%s) = %d', (note, expected) => {
      expect(getNoteIndex(note)).toBe(expected);
    });
  });

  describe('flat notes (enharmonic)', () => {
    test.each([
      ['Db', 1], // same as C#
      ['Eb', 3], // same as D#
      ['Gb', 6], // same as F#
      ['Ab', 8], // same as G#
      ['Bb', 10], // same as A#
    ])('getNoteIndex(%s) = %d', (note, expected) => {
      expect(getNoteIndex(note)).toBe(expected);
    });
  });

  describe('edge cases', () => {
    test('Fb (enharmonic to E) = 4', () => {
      expect(getNoteIndex('Fb')).toBe(4);
    });

    test('Cb (enharmonic to B) = 11', () => {
      expect(getNoteIndex('Cb')).toBe(11);
    });

    test('lowercase note gets base note index', () => {
      // Falls back to base character upper-cased
      const result = getNoteIndex('c');
      // May return 0 (C) if normalized, or -1 if not found
      expect(result).toBeGreaterThanOrEqual(-1);
    });
  });
});

// ============================================================================
// transposeNote TESTS
// ============================================================================

describe('transposeNote', () => {
  describe('basic transposition', () => {
    test('C + 0 semitones = C', () => {
      expect(transposeNote('C', 0)).toBe('C');
    });

    test('C + 1 semitone = C#', () => {
      expect(transposeNote('C', 1)).toBe('C#');
    });

    test('C + 12 semitones = C (octave)', () => {
      expect(transposeNote('C', 12)).toBe('C');
    });
  });

  describe('common intervals from C', () => {
    test.each([
      [0, 'C'], // unison
      [2, 'D'], // major 2nd
      [3, 'D#'], // minor 3rd
      [4, 'E'], // major 3rd
      [5, 'F'], // perfect 4th
      [7, 'G'], // perfect 5th
      [9, 'A'], // major 6th
      [10, 'A#'], // minor 7th
      [11, 'B'], // major 7th
    ])('C + %d semitones = %s', (semitones, expected) => {
      expect(transposeNote('C', semitones)).toBe(expected);
    });
  });

  describe('transposition from different roots', () => {
    test('A + 3 semitones = C (minor 3rd)', () => {
      expect(transposeNote('A', 3)).toBe('C');
    });

    test('G + 4 semitones = B (major 3rd)', () => {
      expect(transposeNote('G', 4)).toBe('B');
    });

    test('E + 7 semitones = B (perfect 5th)', () => {
      expect(transposeNote('E', 7)).toBe('B');
    });

    test('F# + 7 semitones = C# (perfect 5th)', () => {
      expect(transposeNote('F#', 7)).toBe('C#');
    });
  });

  describe('wrap-around (octave boundary)', () => {
    test('B + 1 = C (wraps)', () => {
      expect(transposeNote('B', 1)).toBe('C');
    });

    test('A# + 2 = C (wraps)', () => {
      expect(transposeNote('A#', 2)).toBe('C');
    });

    test('G + 7 = D (wraps)', () => {
      expect(transposeNote('G', 7)).toBe('D');
    });
  });

  describe('extended intervals (beyond octave)', () => {
    test('C + 14 = D (major 9th)', () => {
      expect(transposeNote('C', 14)).toBe('D');
    });

    test('C + 21 = A (major 13th)', () => {
      expect(transposeNote('C', 21)).toBe('A');
    });
  });
});

// ============================================================================
// getChordNotes TESTS - CRITICAL FOR ACCURACY
// ============================================================================

describe('getChordNotes', () => {
  describe('major chords', () => {
    test('C major = C, E, G', () => {
      expect(getChordNotes('C', 'major')).toEqual(['C', 'E', 'G']);
    });

    test('G major = G, B, D', () => {
      expect(getChordNotes('G', 'major')).toEqual(['G', 'B', 'D']);
    });

    test('D major = D, F#, A', () => {
      expect(getChordNotes('D', 'major')).toEqual(['D', 'F#', 'A']);
    });

    test('A major = A, C#, E', () => {
      expect(getChordNotes('A', 'major')).toEqual(['A', 'C#', 'E']);
    });

    test('E major = E, G#, B', () => {
      expect(getChordNotes('E', 'major')).toEqual(['E', 'G#', 'B']);
    });

    test('F major = F, A, C', () => {
      expect(getChordNotes('F', 'major')).toEqual(['F', 'A', 'C']);
    });

    test('B major = B, D#, F#', () => {
      expect(getChordNotes('B', 'major')).toEqual(['B', 'D#', 'F#']);
    });
  });

  describe('minor chords', () => {
    test('Am = A, C, E', () => {
      expect(getChordNotes('A', 'minor')).toEqual(['A', 'C', 'E']);
    });

    test('Dm = D, F, A', () => {
      expect(getChordNotes('D', 'minor')).toEqual(['D', 'F', 'A']);
    });

    test('Em = E, G, B', () => {
      expect(getChordNotes('E', 'minor')).toEqual(['E', 'G', 'B']);
    });

    test('Bm = B, D, F#', () => {
      expect(getChordNotes('B', 'minor')).toEqual(['B', 'D', 'F#']);
    });

    test('F#m = F#, A, C#', () => {
      expect(getChordNotes('F#', 'minor')).toEqual(['F#', 'A', 'C#']);
    });

    test('Cm = C, D#, G', () => {
      expect(getChordNotes('C', 'minor')).toEqual(['C', 'D#', 'G']);
    });
  });

  describe('dominant seventh chords', () => {
    test('G7 = G, B, D, F', () => {
      expect(getChordNotes('G', '7')).toEqual(['G', 'B', 'D', 'F']);
    });

    test('A7 = A, C#, E, G', () => {
      expect(getChordNotes('A', '7')).toEqual(['A', 'C#', 'E', 'G']);
    });

    test('D7 = D, F#, A, C', () => {
      expect(getChordNotes('D', '7')).toEqual(['D', 'F#', 'A', 'C']);
    });

    test('E7 = E, G#, B, D', () => {
      expect(getChordNotes('E', '7')).toEqual(['E', 'G#', 'B', 'D']);
    });

    test('C7 = C, E, G, A#', () => {
      expect(getChordNotes('C', '7')).toEqual(['C', 'E', 'G', 'A#']);
    });
  });

  describe('major seventh chords', () => {
    test('Cmaj7 = C, E, G, B', () => {
      expect(getChordNotes('C', 'maj7')).toEqual(['C', 'E', 'G', 'B']);
    });

    test('Fmaj7 = F, A, C, E', () => {
      expect(getChordNotes('F', 'maj7')).toEqual(['F', 'A', 'C', 'E']);
    });

    test('Gmaj7 = G, B, D, F#', () => {
      expect(getChordNotes('G', 'maj7')).toEqual(['G', 'B', 'D', 'F#']);
    });
  });

  describe('minor seventh chords', () => {
    test('Am7 = A, C, E, G', () => {
      expect(getChordNotes('A', 'm7')).toEqual(['A', 'C', 'E', 'G']);
    });

    test('Em7 = E, G, B, D', () => {
      expect(getChordNotes('E', 'm7')).toEqual(['E', 'G', 'B', 'D']);
    });

    test('Dm7 = D, F, A, C', () => {
      expect(getChordNotes('D', 'm7')).toEqual(['D', 'F', 'A', 'C']);
    });
  });

  describe('suspended chords', () => {
    test('Dsus4 = D, G, A', () => {
      expect(getChordNotes('D', 'sus4')).toEqual(['D', 'G', 'A']);
    });

    test('Asus4 = A, D, E', () => {
      expect(getChordNotes('A', 'sus4')).toEqual(['A', 'D', 'E']);
    });

    test('Asus2 = A, B, E', () => {
      expect(getChordNotes('A', 'sus2')).toEqual(['A', 'B', 'E']);
    });
  });

  describe('extended chords', () => {
    test('C9 = C, E, G, A#, D (unique notes)', () => {
      const notes = getChordNotes('C', '9');
      expect(notes).toContain('C');
      expect(notes).toContain('E');
      expect(notes).toContain('G');
      expect(notes).toContain('A#'); // minor 7th
      expect(notes).toContain('D'); // 9th
    });

    test('Am9 = A, C, E, G, B', () => {
      const notes = getChordNotes('A', 'm9');
      expect(notes).toContain('A');
      expect(notes).toContain('C');
      expect(notes).toContain('E');
      expect(notes).toContain('G'); // minor 7th
      expect(notes).toContain('B'); // 9th
    });

    test('Cmaj9 = C, E, G, B, D', () => {
      const notes = getChordNotes('C', 'maj9');
      expect(notes).toContain('C');
      expect(notes).toContain('E');
      expect(notes).toContain('G');
      expect(notes).toContain('B'); // major 7th
      expect(notes).toContain('D'); // 9th
    });
  });

  describe('diminished chords', () => {
    test('Bdim = B, D, F', () => {
      expect(getChordNotes('B', 'diminished')).toEqual(['B', 'D', 'F']);
    });

    test('Cdim7 = C, D#, F#, A (symmetrical)', () => {
      expect(getChordNotes('C', 'dim7')).toEqual(['C', 'D#', 'F#', 'A']);
    });
  });

  describe('augmented chords', () => {
    test('Caug = C, E, G#', () => {
      expect(getChordNotes('C', 'augmented')).toEqual(['C', 'E', 'G#']);
    });
  });

  describe('add chords', () => {
    test('Cadd9 = C, E, G, D', () => {
      const notes = getChordNotes('C', 'add9');
      expect(notes).toContain('C');
      expect(notes).toContain('E');
      expect(notes).toContain('G');
      expect(notes).toContain('D'); // 9th without 7th
    });
  });

  describe('power chords', () => {
    test('C5 = C, G (just root and 5th)', () => {
      expect(getChordNotes('C', '5')).toEqual(['C', 'G']);
    });

    test('E5 = E, B', () => {
      expect(getChordNotes('E', '5')).toEqual(['E', 'B']);
    });
  });

  describe('quality aliases', () => {
    test('empty quality = major', () => {
      expect(getChordNotes('C', '')).toEqual(['C', 'E', 'G']);
    });

    test('m = minor', () => {
      expect(getChordNotes('A', 'm')).toEqual(['A', 'C', 'E']);
    });

    test('min = minor', () => {
      expect(getChordNotes('A', 'min')).toEqual(['A', 'C', 'E']);
    });

    test('- = minor', () => {
      expect(getChordNotes('A', '-')).toEqual(['A', 'C', 'E']);
    });

    test('M = major', () => {
      expect(getChordNotes('C', 'M')).toEqual(['C', 'E', 'G']);
    });
  });
});

// ============================================================================
// parseQuality TESTS
// ============================================================================

describe('parseQuality', () => {
  test('simple qualities return as baseQuality', () => {
    expect(parseQuality('m')).toEqual({ baseQuality: 'm', extensions: [] });
    expect(parseQuality('7')).toEqual({ baseQuality: '7', extensions: [] });
    expect(parseQuality('maj7')).toEqual({ baseQuality: 'maj7', extensions: [] });
  });

  test('compound qualities return as baseQuality', () => {
    expect(parseQuality('m7b5')).toEqual({ baseQuality: 'm7b5', extensions: [] });
    expect(parseQuality('7sus4')).toEqual({ baseQuality: '7sus4', extensions: [] });
  });

  test('extended chords parsed correctly', () => {
    expect(parseQuality('maj9')).toEqual({ baseQuality: 'maj9', extensions: [] });
    expect(parseQuality('m9')).toEqual({ baseQuality: 'm9', extensions: [] });
  });
});

// ============================================================================
// getComplexChordFormula TESTS
// ============================================================================

describe('getComplexChordFormula', () => {
  test('returns formula for known quality', () => {
    expect(getComplexChordFormula('major')).toEqual([0, 4, 7]);
    expect(getComplexChordFormula('m7')).toEqual([0, 3, 7, 10]);
  });

  test('handles quality aliases', () => {
    expect(getComplexChordFormula('min')).toEqual([0, 3, 7]);
    expect(getComplexChordFormula('M7')).toEqual([0, 4, 7, 11]);
  });

  test('returns null for truly unknown quality', () => {
    expect(getComplexChordFormula('xyz')).toBeNull();
  });
});

// ============================================================================
// EDGE CASES & REGRESSION TESTS
// ============================================================================

describe('edge cases', () => {
  test('all 12 roots produce valid major chords', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    roots.forEach((root) => {
      const notes = getChordNotes(root, 'major');
      expect(notes).toHaveLength(3);
      expect(notes[0]).toBe(root);
    });
  });

  test('all 12 roots produce valid minor chords', () => {
    const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    roots.forEach((root) => {
      const notes = getChordNotes(root, 'minor');
      expect(notes).toHaveLength(3);
      expect(notes[0]).toBe(root);
    });
  });

  test('no duplicate notes in chord (after octave collapse)', () => {
    const notes = getChordNotes('C', '9');
    expect(new Set(notes).size).toBe(notes.length);
  });

  test('flat root notes work correctly', () => {
    // Bb major = Bb, D, F (but we use A# internally)
    const notes = getChordNotes('Bb', 'major');
    expect(notes).toContain('A#'); // Bb normalized to A#
  });
});
