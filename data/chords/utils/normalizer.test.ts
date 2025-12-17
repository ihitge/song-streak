/**
 * Chord Name Normalizer Tests
 * Validates chord parsing and normalization for various input formats
 */

import {
  parseChordName,
  normalizeChordName,
  getDisplayName,
  chordsEqual,
} from './normalizer';

// ============================================================================
// parseChordName TESTS
// ============================================================================

describe('parseChordName', () => {
  describe('major chords', () => {
    test('C parses as C major', () => {
      const result = parseChordName('C');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('major');
    });

    test('G parses as G major', () => {
      const result = parseChordName('G');
      expect(result?.root).toBe('G');
      expect(result?.quality).toBe('major');
    });

    test('Cmaj parses as C major', () => {
      const result = parseChordName('Cmaj');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('major');
    });

    test('CM parses as C major', () => {
      const result = parseChordName('CM');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('major');
    });
  });

  describe('minor chords', () => {
    test('Am parses as A minor', () => {
      const result = parseChordName('Am');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });

    test('Amin parses as A minor', () => {
      const result = parseChordName('Amin');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });

    test('A- parses as A minor', () => {
      const result = parseChordName('A-');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });

    test('Ami parses as A minor', () => {
      const result = parseChordName('Ami');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });

    test('F#m parses as F# minor', () => {
      const result = parseChordName('F#m');
      expect(result?.root).toBe('F#');
      expect(result?.quality).toBe('minor');
    });

    test('Bbm parses as Bb minor', () => {
      const result = parseChordName('Bbm');
      expect(result?.root).toBe('Bb');
      expect(result?.quality).toBe('minor');
    });
  });

  describe('diminished chords', () => {
    test('Bdim parses as B diminished', () => {
      const result = parseChordName('Bdim');
      expect(result?.root).toBe('B');
      expect(result?.quality).toBe('diminished');
    });

    test('Bo parses as B diminished', () => {
      const result = parseChordName('Bo');
      expect(result?.root).toBe('B');
      expect(result?.quality).toBe('diminished');
    });

    test('B° parses as B diminished', () => {
      const result = parseChordName('B°');
      expect(result?.root).toBe('B');
      expect(result?.quality).toBe('diminished');
    });
  });

  describe('augmented chords', () => {
    test('Caug parses as C augmented', () => {
      const result = parseChordName('Caug');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('augmented');
    });

    test('C+ parses as C augmented', () => {
      const result = parseChordName('C+');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('augmented');
    });
  });

  describe('suspended chords', () => {
    test('Dsus4 parses correctly', () => {
      const result = parseChordName('Dsus4');
      expect(result?.root).toBe('D');
      expect(result?.quality).toBe('suspended');
      // Extensions captured separately or via quality
    });

    test('Asus2 parses correctly', () => {
      const result = parseChordName('Asus2');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('suspended');
    });
  });

  describe('seventh chords', () => {
    test('Am7 parses correctly', () => {
      const result = parseChordName('Am7');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
      expect(result?.extensions).toContain('7');
    });

    test('Cmaj7 parses correctly', () => {
      const result = parseChordName('Cmaj7');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('major');
      // maj7 may be parsed as maj + 7
      expect(result?.extensions).toContain('7');
    });

    test('G7 parses correctly', () => {
      const result = parseChordName('G7');
      expect(result?.root).toBe('G');
      expect(result?.quality).toBe('major');
      expect(result?.extensions).toContain('7');
    });
  });

  describe('extended chords', () => {
    test('Am9 parses correctly', () => {
      const result = parseChordName('Am9');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
      expect(result?.extensions).toContain('9');
    });

    test('Cmaj9 parses correctly', () => {
      const result = parseChordName('Cmaj9');
      expect(result?.root).toBe('C');
      // maj9 parsed with 9 in extensions
      expect(result?.extensions).toContain('9');
    });
  });

  describe('add chords', () => {
    test('Cadd9 parses correctly', () => {
      const result = parseChordName('Cadd9');
      expect(result?.root).toBe('C');
      expect(result?.quality).toBe('add');
      // add9 captured in extensions or quality
    });
  });

  describe('sharp and flat roots', () => {
    test('F# parses correctly', () => {
      const result = parseChordName('F#');
      expect(result?.root).toBe('F#');
    });

    test('Bb parses correctly', () => {
      const result = parseChordName('Bb');
      expect(result?.root).toBe('Bb');
    });

    test('C# parses correctly', () => {
      const result = parseChordName('C#');
      expect(result?.root).toBe('C#');
    });

    test('Eb parses correctly', () => {
      const result = parseChordName('Eb');
      expect(result?.root).toBe('Eb');
    });

    test('Ab parses correctly', () => {
      const result = parseChordName('Ab');
      expect(result?.root).toBe('Ab');
    });
  });

  describe('unicode accidentals', () => {
    test('C♯ parses as C#', () => {
      const result = parseChordName('C♯');
      expect(result?.root).toBe('C#');
    });

    test('B♭ parses as Bb', () => {
      const result = parseChordName('B♭');
      expect(result?.root).toBe('Bb');
    });
  });

  describe('edge cases', () => {
    test('empty string returns null', () => {
      expect(parseChordName('')).toBeNull();
    });

    test('whitespace only returns null', () => {
      expect(parseChordName('   ')).toBeNull();
    });

    test('invalid root returns null', () => {
      expect(parseChordName('Hm')).toBeNull(); // H is not a valid note
    });

    test('lowercase input works', () => {
      const result = parseChordName('am');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });

    test('leading/trailing whitespace is trimmed', () => {
      const result = parseChordName('  Am  ');
      expect(result?.root).toBe('A');
      expect(result?.quality).toBe('minor');
    });
  });
});

// ============================================================================
// normalizeChordName TESTS
// ============================================================================

describe('normalizeChordName', () => {
  test('Am normalizes to Am', () => {
    expect(normalizeChordName('Am')).toBe('Am');
  });

  test('Amin normalizes to Am', () => {
    expect(normalizeChordName('Amin')).toBe('Am');
  });

  test('A- normalizes to Am', () => {
    expect(normalizeChordName('A-')).toBe('Am');
  });

  test('C normalizes to C', () => {
    expect(normalizeChordName('C')).toBe('C');
  });

  test('Cmaj normalizes to C', () => {
    expect(normalizeChordName('Cmaj')).toBe('C');
  });

  test('Am7 normalizes to Am7', () => {
    expect(normalizeChordName('Am7')).toBe('Am7');
  });

  test('F#m normalizes to F#m', () => {
    expect(normalizeChordName('F#m')).toBe('F#m');
  });

  test('Bbm normalizes to Bbm', () => {
    expect(normalizeChordName('Bbm')).toBe('Bbm');
  });
});

// ============================================================================
// getDisplayName TESTS
// ============================================================================

describe('getDisplayName', () => {
  test('C displays as C', () => {
    expect(getDisplayName('C')).toBe('C');
  });

  test('Am displays as Am', () => {
    expect(getDisplayName('Am')).toBe('Am');
  });

  test('Amin displays as Am', () => {
    expect(getDisplayName('Amin')).toBe('Am');
  });

  test('Bdim displays as Bdim', () => {
    expect(getDisplayName('Bdim')).toBe('Bdim');
  });

  test('Caug displays as Caug', () => {
    expect(getDisplayName('Caug')).toBe('Caug');
  });

  test('Am7 displays as Am7', () => {
    expect(getDisplayName('Am7')).toBe('Am7');
  });

  test('invalid chord returns original', () => {
    expect(getDisplayName('xyz')).toBe('xyz');
  });
});

// ============================================================================
// chordsEqual TESTS
// ============================================================================

describe('chordsEqual', () => {
  test('Am equals Amin', () => {
    expect(chordsEqual('Am', 'Amin')).toBe(true);
  });

  test('Am equals A-', () => {
    expect(chordsEqual('Am', 'A-')).toBe(true);
  });

  test('C equals Cmaj', () => {
    expect(chordsEqual('C', 'Cmaj')).toBe(true);
  });

  test('Am does not equal Em', () => {
    expect(chordsEqual('Am', 'Em')).toBe(false);
  });

  test('Am does not equal A', () => {
    expect(chordsEqual('Am', 'A')).toBe(false);
  });

  test('same chord is equal', () => {
    expect(chordsEqual('G7', 'G7')).toBe(true);
  });
});

// ============================================================================
// COMPREHENSIVE CHORD LIST TESTS
// ============================================================================

describe('comprehensive chord parsing', () => {
  const validChords = [
    // Major
    'C', 'D', 'E', 'F', 'G', 'A', 'B',
    'C#', 'D#', 'F#', 'G#', 'A#',
    'Db', 'Eb', 'Gb', 'Ab', 'Bb',
    // Minor
    'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
    'F#m', 'C#m', 'G#m',
    // Seventh
    'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
    'Cmaj7', 'Dmaj7', 'Gmaj7',
    'Am7', 'Bm7', 'Em7', 'Dm7',
    // Suspended
    'Dsus4', 'Asus4', 'Esus4',
    'Dsus2', 'Asus2',
    // Extended
    'C9', 'G9', 'Am9',
  ];

  validChords.forEach((chord) => {
    test(`${chord} parses successfully`, () => {
      const result = parseChordName(chord);
      expect(result).not.toBeNull();
      expect(result?.root).toBeTruthy();
    });
  });
});
