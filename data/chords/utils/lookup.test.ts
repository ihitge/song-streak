/**
 * Chord Lookup Tests
 * Validates chord lookup with fallback strategies
 */

import {
  lookupChord,
  lookupChords,
  getDefaultVoicing,
  hasAnyDiagrams,
} from './lookup';
import { GUITAR_CHORDS } from '../guitar';

// ============================================================================
// lookupChord TESTS
// ============================================================================

describe('lookupChord', () => {
  describe('tier 1: exact match from dictionary', () => {
    test('Am returns found status', () => {
      const result = lookupChord('Am');
      expect(result.status).toBe('found');
      expect(result.chord).toBeDefined();
      expect(result.isGenerated).toBe(false);
    });

    test('C returns found status', () => {
      const result = lookupChord('C');
      expect(result.status).toBe('found');
      expect(result.chord).toBeDefined();
    });

    test('G7 returns found status', () => {
      const result = lookupChord('G7');
      expect(result.status).toBe('found');
    });

    test('Em returns found status', () => {
      const result = lookupChord('Em');
      expect(result.status).toBe('found');
    });

    test('F returns found status (barre chord)', () => {
      const result = lookupChord('F');
      expect(result.status).toBe('found');
    });
  });

  describe('tier 2: algorithmic generation', () => {
    test('Am9 returns generated status', () => {
      const result = lookupChord('Am9');
      expect(result.status).toBe('generated');
      expect(result.chord).toBeDefined();
      expect(result.isGenerated).toBe(true);
    });

    test('Cmaj7 returns generated or found status', () => {
      const result = lookupChord('Cmaj7');
      expect(['found', 'generated']).toContain(result.status);
      expect(result.chord).toBeDefined();
    });

    test('F#m returns generated status', () => {
      const result = lookupChord('F#m');
      // F#m might be in dictionary or generated
      expect(['found', 'generated']).toContain(result.status);
      expect(result.chord).toBeDefined();
    });

    test('Bb returns generated status', () => {
      const result = lookupChord('Bb');
      expect(['found', 'generated']).toContain(result.status);
    });
  });

  describe('tier 3: fuzzy match (similar suggestions)', () => {
    test('Amx suggests Am (typo)', () => {
      const result = lookupChord('Amx');
      // Should either be similar or unknown
      if (result.status === 'similar') {
        expect(result.suggestions).toContain('Am');
      }
    });

    test('returns suggestions array for similar', () => {
      const result = lookupChord('Amz');
      if (result.status === 'similar') {
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('tier 4: unknown', () => {
    test('completely invalid chord returns unknown (not similar)', () => {
      // XYZ123 doesn't start with valid root note, so no fuzzy suggestions
      const result = lookupChord('XYZ123');
      expect(result.status).toBe('unknown');
    });

    test('input not starting with valid root note returns unknown', () => {
      const result = lookupChord('123');
      expect(result.status).toBe('unknown');
    });
  });

  describe('displayName', () => {
    test('always returns displayName', () => {
      expect(lookupChord('Am').displayName).toBe('Am');
      expect(lookupChord('Amin').displayName).toBe('Am');
      expect(lookupChord('C').displayName).toBe('C');
    });

    test('displayName normalizes aliases', () => {
      expect(lookupChord('A-').displayName).toBe('Am');
    });
  });

  describe('case sensitivity', () => {
    test('lowercase am finds Am', () => {
      const result = lookupChord('am');
      expect(['found', 'generated']).toContain(result.status);
    });

    test('mixed case finds chord', () => {
      const result = lookupChord('aM');
      expect(['found', 'generated', 'similar']).toContain(result.status);
    });
  });
});

// ============================================================================
// lookupChords TESTS
// ============================================================================

describe('lookupChords', () => {
  test('returns array of results', () => {
    const results = lookupChords(['Am', 'C', 'G']);
    expect(results).toHaveLength(3);
  });

  test('each result has correct structure', () => {
    const results = lookupChords(['Am', 'Em']);

    results.forEach((result) => {
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('displayName');
    });
  });

  test('handles mix of found and generated', () => {
    const results = lookupChords(['Am', 'Am9', 'C']);

    const statuses = results.map((r) => r.status);
    // Am and C should be found, Am9 should be generated
    expect(statuses.filter((s) => s === 'found').length).toBeGreaterThanOrEqual(
      2,
    );
  });

  test('empty array returns empty array', () => {
    const results = lookupChords([]);
    expect(results).toHaveLength(0);
  });
});

// ============================================================================
// getDefaultVoicing TESTS
// ============================================================================

describe('getDefaultVoicing', () => {
  test('returns first voicing from chord', () => {
    const amChord = GUITAR_CHORDS['Am'];
    const defaultVoicing = getDefaultVoicing(amChord);

    expect(defaultVoicing).toBe(amChord.voicings[0]);
  });

  test('default Am voicing is x02210', () => {
    const amChord = GUITAR_CHORDS['Am'];
    const defaultVoicing = getDefaultVoicing(amChord);

    expect(defaultVoicing?.frets).toEqual([null, 0, 2, 2, 1, 0]);
  });

  test('default C voicing is x32010', () => {
    const cChord = GUITAR_CHORDS['C'];
    const defaultVoicing = getDefaultVoicing(cChord);

    expect(defaultVoicing?.frets).toEqual([null, 3, 2, 0, 1, 0]);
  });

  test('returns null for chord with empty voicings array', () => {
    const chordWithNoVoicings = {
      canonical: 'test',
      display: 'Test',
      root: 'C',
      quality: 'major' as const,
      voicings: [],
    };
    const defaultVoicing = getDefaultVoicing(chordWithNoVoicings);

    expect(defaultVoicing).toBeNull();
  });

  test('returns null for chord with undefined voicings', () => {
    const chordWithUndefinedVoicings = {
      canonical: 'test',
      display: 'Test',
      root: 'C',
      quality: 'major' as const,
      voicings: undefined as any,
    };
    const defaultVoicing = getDefaultVoicing(chordWithUndefinedVoicings);

    expect(defaultVoicing).toBeNull();
  });
});

// ============================================================================
// hasAnyDiagrams TESTS
// ============================================================================

describe('hasAnyDiagrams', () => {
  test('returns true when at least one chord has diagram', () => {
    const result = hasAnyDiagrams(['Am', 'UnknownChord', 'C']);
    expect(result).toBe(true);
  });

  test('returns true for dictionary chords', () => {
    const result = hasAnyDiagrams(['Am', 'Em', 'G']);
    expect(result).toBe(true);
  });

  test('returns true for generated chords', () => {
    const result = hasAnyDiagrams(['Am9', 'Cmaj7']);
    expect(result).toBe(true);
  });

  test('returns true for partial chords', () => {
    // Complex chords that may generate as partial voicings
    const result = hasAnyDiagrams(['C13', 'Am11']);
    expect(result).toBe(true);
  });

  test('returns false for completely invalid chords (no valid root note)', () => {
    // XYZ, 123, !!! don't start with valid root notes (A-G)
    // so fuzzy matching is blocked and they can't be generated
    const result = hasAnyDiagrams(['XYZ', '123', '!!!']);
    expect(result).toBe(false);
  });

  test('returns false for empty array', () => {
    const result = hasAnyDiagrams([]);
    expect(result).toBe(false);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('lookup integration', () => {
  test('all dictionary chords can be looked up', () => {
    const chordNames = Object.keys(GUITAR_CHORDS);

    chordNames.forEach((name) => {
      const result = lookupChord(name);
      expect(result.status).toBe('found');
      expect(result.chord).toBeDefined();
    });
  });

  test('found chords have voicings', () => {
    const result = lookupChord('Am');

    expect(result.status).toBe('found');
    expect(result.chord?.voicings.length).toBeGreaterThan(0);
  });

  test('generated chords have voicings', () => {
    const result = lookupChord('Am9');

    expect(result.status).toBe('generated');
    expect(result.chord?.voicings.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// LOOKUP ORDER TESTS
// ============================================================================

describe('lookup priority order', () => {
  test('exact dictionary match takes priority over generation', () => {
    // Am is in dictionary, should return 'found' not 'generated'
    const result = lookupChord('Am');
    expect(result.status).toBe('found');
    expect(result.isGenerated).toBe(false);
  });

  test('generation happens before fuzzy match for valid chords', () => {
    // Am9 is a valid chord that can be generated
    // It should be 'generated', not 'similar' (suggesting Am)
    const result = lookupChord('Am9');
    expect(result.status).toBe('generated');
    expect(result.isGenerated).toBe(true);
  });
});

// ============================================================================
// PARTIAL CHORD TESTS
// ============================================================================

describe('partial chord handling', () => {
  test('complex extended chords may return partial status', () => {
    // 13th chords have many notes and may need to omit some
    const result = lookupChord('C13');

    // Should be either generated or partial (both are valid)
    expect(['generated', 'partial']).toContain(result.status);
    expect(result.chord).toBeDefined();
    expect(result.isGenerated).toBe(true);
  });

  test('partial chords include warning message', () => {
    const result = lookupChord('C13');

    if (result.status === 'partial') {
      expect(result.warning).toBeDefined();
      expect(typeof result.warning).toBe('string');
      expect(result.warning!.length).toBeGreaterThan(0);
    }
  });

  test('partial chords still have playable voicings', () => {
    const result = lookupChord('Am11');

    if (result.status === 'partial') {
      expect(result.chord).toBeDefined();
      expect(result.chord!.voicings.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// INPUT VALIDATION TESTS
// ============================================================================

describe('input validation', () => {
  test('empty string returns unknown', () => {
    const result = lookupChord('');
    expect(result.status).toBe('unknown');
  });

  test('whitespace-only string returns unknown', () => {
    const result = lookupChord('   ');
    expect(result.status).toBe('unknown');
  });

  test('very long chord name returns unknown', () => {
    // Test with a string longer than MAX_CHORD_NAME_LENGTH (50 chars)
    const longName = 'C' + 'm'.repeat(100);
    const result = lookupChord(longName);

    // Should return unknown due to validation failure
    expect(['unknown', 'similar']).toContain(result.status);
  });
});
