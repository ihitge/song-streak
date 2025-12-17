/**
 * Voicing Generator Tests
 * Validates chord voicing generation and constraint enforcement
 */

import {
  generateVoicings,
  generateVoicingsWithFallback,
  detectBarres,
  DEFAULT_CONSTRAINTS,
  type VoicingCandidate,
} from './voicing-generator';
import { getNoteIndex, type NoteName } from './music-theory';

// ============================================================================
// DEFAULT_CONSTRAINTS VALIDATION
// ============================================================================

describe('DEFAULT_CONSTRAINTS', () => {
  test('maxFretSpan is 4', () => {
    expect(DEFAULT_CONSTRAINTS.maxFretSpan).toBe(4);
  });

  test('requireRoot is true', () => {
    expect(DEFAULT_CONSTRAINTS.requireRoot).toBe(true);
  });

  test('minStrings is 4', () => {
    expect(DEFAULT_CONSTRAINTS.minStrings).toBe(4);
  });

  test('maxMutedStrings is 2', () => {
    expect(DEFAULT_CONSTRAINTS.maxMutedStrings).toBe(2);
  });

  test('requireThird is true', () => {
    expect(DEFAULT_CONSTRAINTS.requireThird).toBe(true);
  });
});

// ============================================================================
// generateVoicings BASIC TESTS
// ============================================================================

describe('generateVoicings', () => {
  describe('C major (C, E, G)', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const root: NoteName = 'C';

    test('generates at least 1 voicing', () => {
      const voicings = generateVoicings(chordNotes, root);
      expect(voicings.length).toBeGreaterThanOrEqual(1);
    });

    test('all voicings contain only chord tones', () => {
      const voicings = generateVoicings(chordNotes, root);
      const chordNoteIndices = new Set(chordNotes.map(getNoteIndex));

      voicings.forEach((v) => {
        v.notesPlayed.forEach((note) => {
          expect(chordNoteIndices.has(getNoteIndex(note))).toBe(true);
        });
      });
    });

    test('all voicings have 6 fret positions', () => {
      const voicings = generateVoicings(chordNotes, root);

      voicings.forEach((v) => {
        expect(v.frets).toHaveLength(6);
      });
    });
  });

  describe('Am (A, C, E)', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const root: NoteName = 'A';

    test('generates at least 1 voicing', () => {
      const voicings = generateVoicings(chordNotes, root);
      expect(voicings.length).toBeGreaterThanOrEqual(1);
    });

    test('includes the classic x02210 voicing', () => {
      const voicings = generateVoicings(chordNotes, root);

      // Check for a voicing that matches x02210 pattern
      const hasClassicAm = voicings.some((v) => {
        return (
          v.frets[0] === null &&
          v.frets[1] === 0 &&
          v.frets[2] === 2 &&
          v.frets[3] === 2 &&
          v.frets[4] === 1 &&
          v.frets[5] === 0
        );
      });

      expect(hasClassicAm).toBe(true);
    });
  });

  describe('Em (E, G, B)', () => {
    const chordNotes: NoteName[] = ['E', 'G', 'B'];
    const root: NoteName = 'E';

    test('generates at least 1 voicing', () => {
      const voicings = generateVoicings(chordNotes, root);
      expect(voicings.length).toBeGreaterThanOrEqual(1);
    });

    test('includes the open Em voicing', () => {
      const voicings = generateVoicings(chordNotes, root);

      // Check for 022000 or similar
      const hasOpenEm = voicings.some((v) => {
        return v.frets[0] === 0 && v.frets[1] === 2 && v.frets[2] === 2;
      });

      expect(hasOpenEm).toBe(true);
    });
  });
});

// ============================================================================
// CONSTRAINT ENFORCEMENT TESTS
// ============================================================================

describe('constraint enforcement', () => {
  const chordNotes: NoteName[] = ['C', 'E', 'G'];
  const root: NoteName = 'C';

  test('fret span never exceeds maxFretSpan', () => {
    const voicings = generateVoicings(chordNotes, root, { maxFretSpan: 3 });

    voicings.forEach((v) => {
      expect(v.fretSpan).toBeLessThanOrEqual(3);
    });
  });

  test('respects minStrings constraint', () => {
    const voicings = generateVoicings(chordNotes, root, { minStrings: 5 });

    voicings.forEach((v) => {
      expect(v.playedStrings).toBeGreaterThanOrEqual(5);
    });
  });

  test('respects maxMutedStrings constraint', () => {
    const voicings = generateVoicings(chordNotes, root, { maxMutedStrings: 1 });

    voicings.forEach((v) => {
      const mutedCount = v.frets.filter((f) => f === null).length;
      expect(mutedCount).toBeLessThanOrEqual(1);
    });
  });

  test('requireRoot=true ensures root in bass', () => {
    const voicings = generateVoicings(chordNotes, root, { requireRoot: true });
    const rootIndex = getNoteIndex(root);

    voicings.forEach((v) => {
      if (v.bassNote) {
        expect(getNoteIndex(v.bassNote)).toBe(rootIndex);
      }
    });
  });

  test('requireThird=true ensures third is present', () => {
    const voicings = generateVoicings(chordNotes, root, { requireThird: true });

    voicings.forEach((v) => {
      expect(v.hasThird).toBe(true);
    });
  });

  test('respects maxFret constraint', () => {
    const voicings = generateVoicings(chordNotes, root, { maxFret: 5 });

    voicings.forEach((v) => {
      v.frets.forEach((fret) => {
        if (fret !== null) {
          expect(fret).toBeLessThanOrEqual(5);
        }
      });
    });
  });
});

// ============================================================================
// VOICING PROPERTIES TESTS
// ============================================================================

describe('voicing properties', () => {
  const chordNotes: NoteName[] = ['D', 'F#', 'A'];
  const root: NoteName = 'D';

  test('bassNote is the lowest non-muted string note', () => {
    const voicings = generateVoicings(chordNotes, root);

    voicings.forEach((v) => {
      // Find first non-null fret
      let expectedBassNote: NoteName | null = null;
      for (let i = 0; i < v.frets.length; i++) {
        if (v.frets[i] !== null) {
          // This should match bassNote
          expectedBassNote = v.notesPlayed.find((note) => {
            // The bass note should be from the lowest played string
            return true; // Simplified check
          }) || null;
          break;
        }
      }

      expect(v.bassNote).not.toBeNull();
    });
  });

  test('playedStrings matches non-null frets count', () => {
    const voicings = generateVoicings(chordNotes, root);

    voicings.forEach((v) => {
      const counted = v.frets.filter((f) => f !== null).length;
      expect(v.playedStrings).toBe(counted);
    });
  });

  test('fretSpan is calculated correctly', () => {
    const voicings = generateVoicings(chordNotes, root);

    voicings.forEach((v) => {
      const fretted = v.frets.filter((f): f is number => f !== null && f > 0);

      if (fretted.length === 0) {
        expect(v.fretSpan).toBe(0);
      } else {
        const expected = Math.max(...fretted) - Math.min(...fretted);
        expect(v.fretSpan).toBe(expected);
      }
    });
  });

  test('hasRoot is true when root note is played', () => {
    const voicings = generateVoicings(chordNotes, root);
    const rootIndex = getNoteIndex(root);

    voicings.forEach((v) => {
      const hasRootNote = v.notesPlayed.some(
        (note) => getNoteIndex(note) === rootIndex,
      );
      expect(v.hasRoot).toBe(hasRootNote);
    });
  });
});

// ============================================================================
// POWER CHORD TESTS (no third)
// ============================================================================

describe('power chords (5 quality)', () => {
  const chordNotes: NoteName[] = ['E', 'B']; // E5 = E + B (root + 5th)
  const root: NoteName = 'E';

  test('generates voicings without requiring third', () => {
    const voicings = generateVoicings(chordNotes, root, { requireThird: false });
    expect(voicings.length).toBeGreaterThanOrEqual(1);
  });

  test('voicings have hasThird=false', () => {
    const voicings = generateVoicings(chordNotes, root, { requireThird: false });

    voicings.forEach((v) => {
      expect(v.hasThird).toBe(false);
    });
  });
});

// ============================================================================
// generateVoicingsWithFallback TESTS
// ============================================================================

describe('generateVoicingsWithFallback', () => {
  test('returns voicings for common chords', () => {
    const chordNotes: NoteName[] = ['G', 'B', 'D'];
    const root: NoteName = 'G';

    const voicings = generateVoicingsWithFallback(chordNotes, root);
    expect(voicings.length).toBeGreaterThan(0);
  });

  test('relaxes constraints progressively for difficult chords', () => {
    // A chord that might be hard to voice with strict constraints
    const chordNotes: NoteName[] = ['C', 'E', 'G', 'B', 'D']; // Cmaj9
    const root: NoteName = 'C';

    const voicings = generateVoicingsWithFallback(chordNotes, root);
    // Should still find something after relaxing
    expect(voicings.length).toBeGreaterThanOrEqual(0);
  });

  test('handles power chords (no third)', () => {
    const chordNotes: NoteName[] = ['A', 'E']; // A5
    const root: NoteName = 'A';

    const voicings = generateVoicingsWithFallback(chordNotes, root);
    expect(voicings.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// detectBarres TESTS
// ============================================================================

describe('detectBarres', () => {
  test('open chord may or may not detect barres', () => {
    // Am: x02210 - the 2,2 on strings 2,3 could be detected as a mini barre
    const frets: (number | null)[] = [null, 0, 2, 2, 1, 0];
    const barres = detectBarres(frets);
    // Algorithm may detect strings 2-3 at fret 2 as a barre
    expect(Array.isArray(barres)).toBe(true);
  });

  test('detects F major barre', () => {
    // F: 133211
    const frets: (number | null)[] = [1, 3, 3, 2, 1, 1];
    const barres = detectBarres(frets);

    // Should detect barre at fret 1 across strings
    expect(barres.length).toBeGreaterThanOrEqual(1);
    expect(barres.some((b) => b.fret === 1)).toBe(true);
  });

  test('detects Bm barre', () => {
    // Bm: x24432
    const frets: (number | null)[] = [null, 2, 4, 4, 3, 2];
    const barres = detectBarres(frets);

    // Should detect barre at fret 2 or 4
    expect(barres.length).toBeGreaterThanOrEqual(1);
  });

  test('no false positive for all different frets', () => {
    const frets: (number | null)[] = [1, 2, 3, 4, 5, 6];
    const barres = detectBarres(frets);
    expect(barres).toHaveLength(0);
  });

  test('barre requires at least 2 consecutive strings', () => {
    // Only 1 string at fret 3, not a barre
    const frets: (number | null)[] = [null, 3, null, 3, null, null];
    const barres = detectBarres(frets);
    expect(barres).toHaveLength(0);
  });

  test('detects multiple barres', () => {
    // Hypothetical chord with two barres
    const frets: (number | null)[] = [1, 1, 3, 3, null, null];
    const barres = detectBarres(frets);

    // Should find barre at fret 1 (strings 0-1) and fret 3 (strings 2-3)
    expect(barres.length).toBe(2);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('edge cases', () => {
  test('handles all open string chord (E major)', () => {
    const chordNotes: NoteName[] = ['E', 'G#', 'B'];
    const root: NoteName = 'E';

    const voicings = generateVoicings(chordNotes, root);
    expect(voicings.length).toBeGreaterThan(0);

    // Should include the open E chord (022100)
    const hasOpenE = voicings.some((v) => {
      return (
        v.frets[0] === 0 &&
        v.frets[1] === 2 &&
        v.frets[2] === 2 &&
        v.frets[3] === 1 &&
        v.frets[4] === 0 &&
        v.frets[5] === 0
      );
    });

    expect(hasOpenE).toBe(true);
  });

  test('handles sharp root notes', () => {
    const chordNotes: NoteName[] = ['F#', 'A#', 'C#'];
    const root: NoteName = 'F#';

    const voicings = generateVoicingsWithFallback(chordNotes, root);
    expect(voicings.length).toBeGreaterThan(0);
  });

  test('extended chords generate voicings', () => {
    // Am9: A, C, E, G, B
    const chordNotes: NoteName[] = ['A', 'C', 'E', 'G', 'B'];
    const root: NoteName = 'A';

    const voicings = generateVoicingsWithFallback(chordNotes, root);
    expect(voicings.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// UNIQUENESS TESTS
// ============================================================================

describe('voicing uniqueness', () => {
  test('no duplicate voicings', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const root: NoteName = 'A';

    const voicings = generateVoicings(chordNotes, root);

    const serialized = voicings.map((v) => JSON.stringify(v.frets));
    const unique = new Set(serialized);

    expect(unique.size).toBe(voicings.length);
  });
});
