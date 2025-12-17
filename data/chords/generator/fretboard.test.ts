/**
 * Fretboard Model Tests
 * Validates note positions, fret span calculations, and playability checks
 */

import {
  STANDARD_TUNING,
  MAX_FRET,
  MAX_FRET_SPAN,
  STRING_COUNT,
  getNoteAtPosition,
  findNotePositions,
  getChordPositionsOnString,
  calculateFretSpan,
  isPlayable,
  getBassNote,
  countPlayedStrings,
  countMutedStrings,
  getBaseFret,
  isOpenStringChordTone,
} from './fretboard';
import type { NoteName } from './music-theory';

// ============================================================================
// CONSTANTS VALIDATION
// ============================================================================

describe('STANDARD_TUNING', () => {
  test('has 6 strings', () => {
    expect(STANDARD_TUNING).toHaveLength(6);
  });

  test('is E-A-D-G-B-E from low to high', () => {
    expect(STANDARD_TUNING).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
  });

  test('string 0 is low E', () => {
    expect(STANDARD_TUNING[0]).toBe('E');
  });

  test('string 5 is high E', () => {
    expect(STANDARD_TUNING[5]).toBe('E');
  });
});

describe('constants', () => {
  test('MAX_FRET is 15', () => {
    expect(MAX_FRET).toBe(15);
  });

  test('MAX_FRET_SPAN is 4', () => {
    expect(MAX_FRET_SPAN).toBe(4);
  });

  test('STRING_COUNT is 6', () => {
    expect(STRING_COUNT).toBe(6);
  });
});

// ============================================================================
// getNoteAtPosition TESTS
// ============================================================================

describe('getNoteAtPosition', () => {
  describe('open strings (fret 0)', () => {
    test.each([
      [0, 0, 'E'], // low E string open
      [1, 0, 'A'], // A string open
      [2, 0, 'D'], // D string open
      [3, 0, 'G'], // G string open
      [4, 0, 'B'], // B string open
      [5, 0, 'E'], // high E string open
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('low E string (string 0)', () => {
    test.each([
      [0, 0, 'E'],
      [0, 1, 'F'],
      [0, 2, 'F#'],
      [0, 3, 'G'],
      [0, 4, 'G#'],
      [0, 5, 'A'],
      [0, 6, 'A#'],
      [0, 7, 'B'],
      [0, 8, 'C'],
      [0, 9, 'C#'],
      [0, 10, 'D'],
      [0, 11, 'D#'],
      [0, 12, 'E'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('A string (string 1)', () => {
    test.each([
      [1, 0, 'A'],
      [1, 2, 'B'],
      [1, 3, 'C'],
      [1, 5, 'D'],
      [1, 7, 'E'],
      [1, 12, 'A'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('D string (string 2)', () => {
    test.each([
      [2, 0, 'D'],
      [2, 2, 'E'],
      [2, 3, 'F'],
      [2, 5, 'G'],
      [2, 7, 'A'],
      [2, 12, 'D'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('G string (string 3)', () => {
    test.each([
      [3, 0, 'G'],
      [3, 2, 'A'],
      [3, 4, 'B'],
      [3, 5, 'C'],
      [3, 7, 'D'],
      [3, 12, 'G'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('B string (string 4)', () => {
    test.each([
      [4, 0, 'B'],
      [4, 1, 'C'],
      [4, 3, 'D'],
      [4, 5, 'E'],
      [4, 7, 'F#'],
      [4, 12, 'B'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });

  describe('high E string (string 5)', () => {
    test.each([
      [5, 0, 'E'],
      [5, 1, 'F'],
      [5, 3, 'G'],
      [5, 5, 'A'],
      [5, 7, 'B'],
      [5, 12, 'E'], // octave
    ])('string %d, fret %d = %s', (string, fret, expected) => {
      expect(getNoteAtPosition(string, fret)).toBe(expected);
    });
  });
});

// ============================================================================
// findNotePositions TESTS
// ============================================================================

describe('findNotePositions', () => {
  test('finds E on multiple strings and frets', () => {
    const positions = findNotePositions('E');

    // E should appear on string 0 at frets 0, 12
    expect(positions.some((p) => p.string === 0 && p.fret === 0)).toBe(true);
    expect(positions.some((p) => p.string === 0 && p.fret === 12)).toBe(true);

    // E should appear on string 1 at fret 7
    expect(positions.some((p) => p.string === 1 && p.fret === 7)).toBe(true);

    // E should appear on string 5 at frets 0, 12
    expect(positions.some((p) => p.string === 5 && p.fret === 0)).toBe(true);
  });

  test('finds C on multiple positions', () => {
    const positions = findNotePositions('C');

    // C on low E string at fret 8
    expect(positions.some((p) => p.string === 0 && p.fret === 8)).toBe(true);

    // C on A string at fret 3
    expect(positions.some((p) => p.string === 1 && p.fret === 3)).toBe(true);

    // C on B string at fret 1
    expect(positions.some((p) => p.string === 4 && p.fret === 1)).toBe(true);
  });

  test('respects maxFret parameter', () => {
    const positions = findNotePositions('E', 5);

    // Should not find E at fret 12
    expect(positions.some((p) => p.fret === 12)).toBe(false);

    // Should find E at fret 0
    expect(positions.some((p) => p.fret === 0)).toBe(true);
  });

  test('all positions have correct note property', () => {
    const positions = findNotePositions('G');

    positions.forEach((pos) => {
      expect(pos.note).toBe('G');
    });
  });

  test('each note exists on each string within fret range', () => {
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    notes.forEach((note) => {
      const positions = findNotePositions(note);

      // Each note should appear on all 6 strings (within fret 0-15)
      const stringsWithNote = new Set(positions.map((p) => p.string));
      expect(stringsWithNote.size).toBe(6);
    });
  });
});

// ============================================================================
// getChordPositionsOnString TESTS
// ============================================================================

describe('getChordPositionsOnString', () => {
  test('finds C major notes on low E string', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const positions = getChordPositionsOnString(0, chordNotes);

    // E at fret 0
    expect(positions.some((p) => p.fret === 0 && p.note === 'E')).toBe(true);

    // G at fret 3
    expect(positions.some((p) => p.fret === 3 && p.note === 'G')).toBe(true);

    // C at fret 8
    expect(positions.some((p) => p.fret === 8 && p.note === 'C')).toBe(true);
  });

  test('finds Am notes on A string', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const positions = getChordPositionsOnString(1, chordNotes);

    // A at fret 0 (open A string)
    expect(positions.some((p) => p.fret === 0 && p.note === 'A')).toBe(true);

    // C at fret 3
    expect(positions.some((p) => p.fret === 3 && p.note === 'C')).toBe(true);

    // E at fret 7
    expect(positions.some((p) => p.fret === 7 && p.note === 'E')).toBe(true);
  });

  test('respects maxFret parameter', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const positions = getChordPositionsOnString(0, chordNotes, 5);

    // Should find E at 0, G at 3, but NOT C at 8
    expect(positions.some((p) => p.fret === 8)).toBe(false);
    expect(positions.length).toBeLessThan(
      getChordPositionsOnString(0, chordNotes).length,
    );
  });

  test('all returned positions have chord notes', () => {
    const chordNotes: NoteName[] = ['D', 'F#', 'A'];
    const positions = getChordPositionsOnString(0, chordNotes);

    positions.forEach((pos) => {
      expect(chordNotes).toContain(pos.note);
    });
  });
});

// ============================================================================
// calculateFretSpan TESTS
// ============================================================================

describe('calculateFretSpan', () => {
  test('all open strings = 0 span', () => {
    expect(calculateFretSpan([0, 0, 0, 0, 0, 0])).toBe(0);
  });

  test('all muted strings = 0 span', () => {
    expect(calculateFretSpan([null, null, null, null, null, null])).toBe(0);
  });

  test('single fretted position = 0 span', () => {
    expect(calculateFretSpan([null, 3, null, null, null, null])).toBe(0);
  });

  test('frets 1 and 3 = span of 2', () => {
    expect(calculateFretSpan([null, null, 1, 3, null, null])).toBe(2);
  });

  test('frets 2 and 5 = span of 3', () => {
    expect(calculateFretSpan([2, null, null, 5, null, null])).toBe(3);
  });

  test('ignores open strings in span calculation', () => {
    // Open strings (0) should not affect fret span
    expect(calculateFretSpan([0, 3, 2, 0, 1, 0])).toBe(2); // span is 3-1=2
  });

  test('C major open chord has span of 2', () => {
    // x32010
    expect(calculateFretSpan([null, 3, 2, 0, 1, 0])).toBe(2);
  });

  test('Am open chord has span of 1', () => {
    // x02210
    expect(calculateFretSpan([null, 0, 2, 2, 1, 0])).toBe(1);
  });

  test('G major open chord has span of 2', () => {
    // 320003
    expect(calculateFretSpan([3, 2, 0, 0, 0, 3])).toBe(1); // only 3 and 2 are fretted
  });
});

// ============================================================================
// isPlayable TESTS
// ============================================================================

describe('isPlayable', () => {
  test('open chords are playable', () => {
    expect(isPlayable([0, 0, 0, 0, 0, 0])).toBe(true);
    expect(isPlayable([null, 0, 2, 2, 1, 0])).toBe(true); // Am
    expect(isPlayable([null, 3, 2, 0, 1, 0])).toBe(true); // C
  });

  test('span of 4 is playable with default maxSpan', () => {
    expect(isPlayable([1, 1, 1, 1, 5, null])).toBe(true); // span of 4
  });

  test('span of 5 is NOT playable with default maxSpan', () => {
    expect(isPlayable([1, 1, 1, 1, 6, null])).toBe(false); // span of 5
  });

  test('respects custom maxSpan', () => {
    expect(isPlayable([1, 1, 1, 6, null, null], 5)).toBe(true);
    expect(isPlayable([1, 1, 1, 7, null, null], 5)).toBe(false);
  });

  test('barre chords are playable', () => {
    // F major barre: 133211
    expect(isPlayable([1, 3, 3, 2, 1, 1])).toBe(true); // span of 2
  });
});

// ============================================================================
// getBassNote TESTS
// ============================================================================

describe('getBassNote', () => {
  test('returns first non-muted string note', () => {
    expect(getBassNote([0, 0, 0, 0, 0, 0])).toBe('E'); // Low E open
    expect(getBassNote([3, 2, 0, 0, 0, 3])).toBe('G'); // G major, bass is G
  });

  test('skips muted strings', () => {
    // x32010 (C major) - bass is A string fret 3 = C
    expect(getBassNote([null, 3, 2, 0, 1, 0])).toBe('C');
  });

  test('returns null if all strings muted', () => {
    expect(getBassNote([null, null, null, null, null, null])).toBeNull();
  });

  test('Am chord has A as bass', () => {
    // x02210
    expect(getBassNote([null, 0, 2, 2, 1, 0])).toBe('A');
  });

  test('E major has E as bass', () => {
    // 022100
    expect(getBassNote([0, 2, 2, 1, 0, 0])).toBe('E');
  });
});

// ============================================================================
// countPlayedStrings TESTS
// ============================================================================

describe('countPlayedStrings', () => {
  test('all strings played = 6', () => {
    expect(countPlayedStrings([0, 2, 2, 1, 0, 0])).toBe(6);
  });

  test('C major (x32010) = 5 strings', () => {
    expect(countPlayedStrings([null, 3, 2, 0, 1, 0])).toBe(5);
  });

  test('D major (xx0232) = 4 strings', () => {
    expect(countPlayedStrings([null, null, 0, 2, 3, 2])).toBe(4);
  });

  test('all muted = 0 strings', () => {
    expect(countPlayedStrings([null, null, null, null, null, null])).toBe(0);
  });
});

// ============================================================================
// countMutedStrings TESTS
// ============================================================================

describe('countMutedStrings', () => {
  test('all strings played = 0 muted', () => {
    expect(countMutedStrings([0, 2, 2, 1, 0, 0])).toBe(0);
  });

  test('C major (x32010) = 1 muted', () => {
    expect(countMutedStrings([null, 3, 2, 0, 1, 0])).toBe(1);
  });

  test('D major (xx0232) = 2 muted', () => {
    expect(countMutedStrings([null, null, 0, 2, 3, 2])).toBe(2);
  });

  test('all muted = 6 muted', () => {
    expect(countMutedStrings([null, null, null, null, null, null])).toBe(6);
  });
});

// ============================================================================
// getBaseFret TESTS
// ============================================================================

describe('getBaseFret', () => {
  test('all open strings = base fret 1', () => {
    expect(getBaseFret([0, 0, 0, 0, 0, 0])).toBe(1);
  });

  test('C major (x32010) = base fret 1', () => {
    expect(getBaseFret([null, 3, 2, 0, 1, 0])).toBe(1);
  });

  test('F major barre (133211) = base fret 1', () => {
    expect(getBaseFret([1, 3, 3, 2, 1, 1])).toBe(1);
  });

  test('B major barre (x24442) = base fret 2', () => {
    expect(getBaseFret([null, 2, 4, 4, 4, 2])).toBe(2);
  });

  test('chord at 5th position = base fret 5', () => {
    expect(getBaseFret([5, 7, 7, 6, 5, 5])).toBe(5);
  });
});

// ============================================================================
// isOpenStringChordTone TESTS
// ============================================================================

describe('isOpenStringChordTone', () => {
  describe('C major (C, E, G)', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];

    test('low E string (E) is a chord tone', () => {
      expect(isOpenStringChordTone(0, chordNotes)).toBe(true);
    });

    test('A string (A) is NOT a chord tone', () => {
      expect(isOpenStringChordTone(1, chordNotes)).toBe(false);
    });

    test('G string (G) is a chord tone', () => {
      expect(isOpenStringChordTone(3, chordNotes)).toBe(true);
    });

    test('high E string (E) is a chord tone', () => {
      expect(isOpenStringChordTone(5, chordNotes)).toBe(true);
    });
  });

  describe('Am (A, C, E)', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];

    test('A string (A) is a chord tone', () => {
      expect(isOpenStringChordTone(1, chordNotes)).toBe(true);
    });

    test('low E string (E) is a chord tone', () => {
      expect(isOpenStringChordTone(0, chordNotes)).toBe(true);
    });

    test('D string (D) is NOT a chord tone', () => {
      expect(isOpenStringChordTone(2, chordNotes)).toBe(false);
    });
  });

  describe('G major (G, B, D)', () => {
    const chordNotes: NoteName[] = ['G', 'B', 'D'];

    test('G string (G) is a chord tone', () => {
      expect(isOpenStringChordTone(3, chordNotes)).toBe(true);
    });

    test('B string (B) is a chord tone', () => {
      expect(isOpenStringChordTone(4, chordNotes)).toBe(true);
    });

    test('D string (D) is a chord tone', () => {
      expect(isOpenStringChordTone(2, chordNotes)).toBe(true);
    });

    test('A string (A) is NOT a chord tone', () => {
      expect(isOpenStringChordTone(1, chordNotes)).toBe(false);
    });
  });
});

// ============================================================================
// INTEGRATION / REGRESSION TESTS
// ============================================================================

describe('integration tests', () => {
  test('fretboard is consistent: note at position matches note search', () => {
    // Pick random positions and verify getNoteAtPosition matches findNotePositions
    const testCases = [
      { string: 0, fret: 5 }, // A on low E
      { string: 1, fret: 3 }, // C on A string
      { string: 2, fret: 7 }, // A on D string
      { string: 3, fret: 4 }, // B on G string
      { string: 4, fret: 1 }, // C on B string
      { string: 5, fret: 3 }, // G on high E
    ];

    testCases.forEach(({ string, fret }) => {
      const noteAtPos = getNoteAtPosition(string, fret);
      const positions = findNotePositions(noteAtPos);

      expect(positions.some((p) => p.string === string && p.fret === fret)).toBe(
        true,
      );
    });
  });

  test('octave equivalence: fret 0 and fret 12 produce same note', () => {
    for (let string = 0; string < 6; string++) {
      const open = getNoteAtPosition(string, 0);
      const octave = getNoteAtPosition(string, 12);
      expect(open).toBe(octave);
    }
  });
});
