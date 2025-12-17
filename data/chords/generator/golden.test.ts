/**
 * Golden Fixture Tests
 * Uses the 21 static dictionary chords as ground truth to validate the generator
 * These are the MOST CRITICAL tests for chord accuracy
 */

import { GUITAR_CHORDS } from '../guitar';
import { generateChord, canGenerateChord, parseChordName } from './index';
import { getChordNotes, getNoteIndex, type NoteName } from './music-theory';
import { getNoteAtPosition } from './fretboard';

// ============================================================================
// STATIC DICTIONARY VALIDATION
// ============================================================================

describe('static dictionary chords', () => {
  test('dictionary has 21 chords', () => {
    const chordCount = Object.keys(GUITAR_CHORDS).length;
    expect(chordCount).toBe(21);
  });

  test('each chord has at least one voicing', () => {
    Object.entries(GUITAR_CHORDS).forEach(([name, chord]) => {
      expect(chord.voicings.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('each voicing has 6 fret positions', () => {
    Object.entries(GUITAR_CHORDS).forEach(([name, chord]) => {
      chord.voicings.forEach((voicing) => {
        expect(voicing.frets).toHaveLength(6);
      });
    });
  });
});

// ============================================================================
// GENERATOR PRODUCES EQUIVALENT VOICINGS
// ============================================================================

describe('generator matches static dictionary', () => {
  const staticChords = Object.entries(GUITAR_CHORDS);

  describe.each(staticChords)('%s chord', (name, staticChord) => {
    test('can be generated', () => {
      expect(canGenerateChord(name)).toBe(true);
    });

    test('generates at least one voicing', () => {
      const generated = generateChord(name);
      expect(generated).not.toBeNull();
      expect(generated!.voicings.length).toBeGreaterThan(0);
    });

    test('generated voicings play the correct notes', () => {
      const generated = generateChord(name);
      if (!generated) return;

      // Parse the chord to get expected notes
      const parsed = parseChordName(name);
      if (!parsed) return;

      const expectedNotes = getChordNotes(parsed.root, parsed.quality);
      const expectedIndices = new Set(expectedNotes.map(getNoteIndex));

      // Check each generated voicing
      generated.voicings.forEach((voicing) => {
        // Get actual notes played
        voicing.frets.forEach((fret, stringIndex) => {
          if (fret !== null) {
            const actualNote = getNoteAtPosition(stringIndex, fret);
            const actualIndex = getNoteIndex(actualNote);

            // Each played note should be a chord tone
            expect(expectedIndices.has(actualIndex)).toBe(true);
          }
        });
      });
    });
  });
});

// ============================================================================
// STATIC VOICINGS ARE CORRECT
// ============================================================================

describe('static voicing accuracy', () => {
  test('Am: x02210 plays A, C, E', () => {
    const am = GUITAR_CHORDS['Am'];
    const voicing = am.voicings[0];

    expect(voicing.frets).toEqual([null, 0, 2, 2, 1, 0]);

    // Verify notes: A(open), E(2nd fret), A(2nd fret), C(1st fret), E(open)
    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('A');
    expect(notes).toContain('C');
    expect(notes).toContain('E');
  });

  test('C: x32010 plays C, E, G', () => {
    const c = GUITAR_CHORDS['C'];
    const voicing = c.voicings[0];

    expect(voicing.frets).toEqual([null, 3, 2, 0, 1, 0]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('C');
    expect(notes).toContain('E');
    expect(notes).toContain('G');
  });

  test('G: 320003 plays G, B, D', () => {
    const g = GUITAR_CHORDS['G'];
    const voicing = g.voicings[0];

    expect(voicing.frets).toEqual([3, 2, 0, 0, 0, 3]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('G');
    expect(notes).toContain('B');
    expect(notes).toContain('D');
  });

  test('D: xx0232 plays D, F#, A', () => {
    const d = GUITAR_CHORDS['D'];
    const voicing = d.voicings[0];

    expect(voicing.frets).toEqual([null, null, 0, 2, 3, 2]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('D');
    expect(notes).toContain('F#');
    expect(notes).toContain('A');
  });

  test('E: 022100 plays E, G#, B', () => {
    const e = GUITAR_CHORDS['E'];
    const voicing = e.voicings[0];

    expect(voicing.frets).toEqual([0, 2, 2, 1, 0, 0]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('E');
    expect(notes).toContain('G#');
    expect(notes).toContain('B');
  });

  test('Em: 022000 plays E, G, B', () => {
    const em = GUITAR_CHORDS['Em'];
    const voicing = em.voicings[0];

    expect(voicing.frets).toEqual([0, 2, 2, 0, 0, 0]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('E');
    expect(notes).toContain('G');
    expect(notes).toContain('B');
  });

  test('Dm: xx0231 plays D, F, A', () => {
    const dm = GUITAR_CHORDS['Dm'];
    const voicing = dm.voicings[0];

    expect(voicing.frets).toEqual([null, null, 0, 2, 3, 1]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('D');
    expect(notes).toContain('F');
    expect(notes).toContain('A');
  });
});

// ============================================================================
// SEVENTH CHORD ACCURACY
// ============================================================================

describe('seventh chord accuracy', () => {
  test('G7: 320001 plays G, B, D, F', () => {
    const g7 = GUITAR_CHORDS['G7'];
    const voicing = g7.voicings[0];

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('G');
    expect(notes).toContain('B');
    expect(notes).toContain('D');
    expect(notes).toContain('F');
  });

  test('Am7: x02010 plays A, C, E, G', () => {
    const am7 = GUITAR_CHORDS['Am7'];
    const voicing = am7.voicings[0];

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('A');
    expect(notes).toContain('C');
    expect(notes).toContain('E');
    expect(notes).toContain('G');
  });

  test('E7: 020100 plays E, G#, B, D', () => {
    const e7 = GUITAR_CHORDS['E7'];
    const voicing = e7.voicings[0];

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('E');
    expect(notes).toContain('G#');
    expect(notes).toContain('B');
    expect(notes).toContain('D');
  });
});

// ============================================================================
// BARRE CHORD ACCURACY
// ============================================================================

describe('barre chord accuracy', () => {
  test('F: 133211 plays F, A, C', () => {
    const f = GUITAR_CHORDS['F'];
    const voicing = f.voicings[0];

    expect(voicing.frets).toEqual([1, 3, 3, 2, 1, 1]);

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('F');
    expect(notes).toContain('A');
    expect(notes).toContain('C');
  });

  test('Bm: x24432 plays B, D, F#', () => {
    const bm = GUITAR_CHORDS['Bm'];
    const voicing = bm.voicings[0];

    const notes: NoteName[] = [];
    voicing.frets.forEach((fret, string) => {
      if (fret !== null) {
        notes.push(getNoteAtPosition(string, fret));
      }
    });

    expect(notes).toContain('B');
    expect(notes).toContain('D');
    expect(notes).toContain('F#');
  });
});

// ============================================================================
// NO WRONG NOTES IN ANY VOICING
// ============================================================================

describe('no wrong notes in static dictionary', () => {
  Object.entries(GUITAR_CHORDS).forEach(([name, chord]) => {
    test(`${name} contains only chord tones`, () => {
      // Parse to get expected notes
      const parsed = parseChordName(name);
      if (!parsed) {
        console.warn(`Could not parse chord: ${name}`);
        return;
      }

      const expectedNotes = getChordNotes(parsed.root, parsed.quality);
      const expectedIndices = new Set(expectedNotes.map(getNoteIndex));

      // Check each voicing
      chord.voicings.forEach((voicing, voicingIndex) => {
        voicing.frets.forEach((fret, stringIndex) => {
          if (fret !== null) {
            const actualNote = getNoteAtPosition(stringIndex, fret);
            const actualIndex = getNoteIndex(actualNote);

            expect(expectedIndices.has(actualIndex)).toBe(true);
          }
        });
      });
    });
  });
});

// ============================================================================
// GENERATOR PRODUCES PLAYABLE VOICINGS
// ============================================================================

describe('generator playability', () => {
  const commonChords = ['C', 'G', 'Am', 'Em', 'D', 'A', 'E', 'F'];

  commonChords.forEach((name) => {
    test(`${name} generator produces playable fret spans`, () => {
      const generated = generateChord(name);
      if (!generated) return;

      generated.voicings.forEach((voicing) => {
        const fretted = voicing.frets.filter(
          (f): f is number => f !== null && f > 0,
        );

        if (fretted.length > 0) {
          const span = Math.max(...fretted) - Math.min(...fretted);
          expect(span).toBeLessThanOrEqual(4); // Human hand limit
        }
      });
    });
  });
});
