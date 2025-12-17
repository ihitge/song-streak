/**
 * Voicing Scorer Tests
 * Validates chord voicing scoring and ranking algorithms
 */

import {
  scoreVoicing,
  rankVoicings,
  getBestVoicing,
  type VoicingScore,
} from './voicing-scorer';
import { type VoicingCandidate } from './voicing-generator';
import { type NoteName } from './music-theory';

// Helper to create a VoicingCandidate for testing
function createCandidate(
  overrides: Partial<VoicingCandidate>,
): VoicingCandidate {
  return {
    frets: [null, 0, 2, 2, 1, 0],
    notesPlayed: ['A', 'C', 'E'] as NoteName[],
    bassNote: 'A' as NoteName,
    fretSpan: 1,
    baseFret: 1,
    playedStrings: 5,
    hasRoot: true,
    hasThird: true,
    hasFifth: true,
    ...overrides,
  };
}

// ============================================================================
// scoreVoicing TESTS
// ============================================================================

describe('scoreVoicing', () => {
  describe('playability scoring', () => {
    test('lower fret span scores higher', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      const lowSpan = createCandidate({ fretSpan: 1 });
      const highSpan = createCandidate({ fretSpan: 4 });

      const lowScore = scoreVoicing(lowSpan, chordNotes);
      const highScore = scoreVoicing(highSpan, chordNotes);

      expect(lowScore.breakdown.playability).toBeGreaterThan(
        highScore.breakdown.playability,
      );
    });

    test('open strings add to playability', () => {
      const chordNotes: NoteName[] = ['E', 'G', 'B'];

      const withOpen = createCandidate({
        frets: [0, 2, 2, 0, 0, 0],
        fretSpan: 0,
      });
      const noOpen = createCandidate({
        frets: [null, 7, 9, 9, 8, 7],
        fretSpan: 2,
        baseFret: 7,
      });

      const openScore = scoreVoicing(withOpen, chordNotes);
      const closedScore = scoreVoicing(noOpen, chordNotes);

      expect(openScore.breakdown.playability).toBeGreaterThan(
        closedScore.breakdown.playability,
      );
    });

    test('lower position scores higher', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      const lowPos = createCandidate({ baseFret: 1 });
      const highPos = createCandidate({ baseFret: 10 });

      const lowScore = scoreVoicing(lowPos, chordNotes);
      const highScore = scoreVoicing(highPos, chordNotes);

      expect(lowScore.breakdown.playability).toBeGreaterThan(
        highScore.breakdown.playability,
      );
    });
  });

  describe('voice leading scoring', () => {
    test('root in bass scores higher', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      const rootBass = createCandidate({
        bassNote: 'A' as NoteName,
        hasRoot: true,
      });
      const thirdBass = createCandidate({
        bassNote: 'C' as NoteName,
        hasRoot: true,
      });

      const rootScore = scoreVoicing(rootBass, chordNotes);
      const thirdScore = scoreVoicing(thirdBass, chordNotes);

      expect(rootScore.breakdown.voiceLeading).toBeGreaterThan(
        thirdScore.breakdown.voiceLeading,
      );
    });

    test('having third is critical', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      const withThird = createCandidate({ hasThird: true });
      const noThird = createCandidate({ hasThird: false });

      const thirdScore = scoreVoicing(withThird, chordNotes);
      const noThirdScore = scoreVoicing(noThird, chordNotes);

      // Missing third should be heavily penalized
      expect(thirdScore.breakdown.voiceLeading).toBeGreaterThan(
        noThirdScore.breakdown.voiceLeading,
      );
    });

    test('having fifth adds points', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      const withFifth = createCandidate({ hasFifth: true });
      const noFifth = createCandidate({ hasFifth: false });

      const fifthScore = scoreVoicing(withFifth, chordNotes);
      const noFifthScore = scoreVoicing(noFifth, chordNotes);

      expect(fifthScore.breakdown.voiceLeading).toBeGreaterThan(
        noFifthScore.breakdown.voiceLeading,
      );
    });
  });

  describe('completeness scoring', () => {
    test('full coverage scores highest', () => {
      const chordNotes: NoteName[] = ['C', 'E', 'G'];

      const fullCoverage = createCandidate({
        notesPlayed: ['C', 'E', 'G'] as NoteName[],
      });
      const partialCoverage = createCandidate({
        notesPlayed: ['C', 'G'] as NoteName[],
      });

      const fullScore = scoreVoicing(fullCoverage, chordNotes);
      const partialScore = scoreVoicing(partialCoverage, chordNotes);

      expect(fullScore.breakdown.completeness).toBeGreaterThan(
        partialScore.breakdown.completeness,
      );
    });

    test('missing notes reduce completeness', () => {
      const chordNotes: NoteName[] = ['C', 'E', 'G', 'B']; // Cmaj7

      const allNotes = createCandidate({
        notesPlayed: ['C', 'E', 'G', 'B'] as NoteName[],
      });
      const missingOne = createCandidate({
        notesPlayed: ['C', 'E', 'G'] as NoteName[],
      });

      const allScore = scoreVoicing(allNotes, chordNotes);
      const missingScore = scoreVoicing(missingOne, chordNotes);

      expect(allScore.breakdown.completeness).toBeGreaterThan(
        missingScore.breakdown.completeness,
      );
    });
  });

  describe('sonority scoring', () => {
    test('more strings played scores higher', () => {
      const chordNotes: NoteName[] = ['C', 'E', 'G'];

      const sixStrings = createCandidate({ playedStrings: 6 });
      const fourStrings = createCandidate({ playedStrings: 4 });

      const sixScore = scoreVoicing(sixStrings, chordNotes);
      const fourScore = scoreVoicing(fourStrings, chordNotes);

      expect(sixScore.breakdown.sonority).toBeGreaterThanOrEqual(
        fourScore.breakdown.sonority,
      );
    });
  });

  describe('total score', () => {
    test('total is sum of all breakdown components', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];
      const candidate = createCandidate({});

      const score = scoreVoicing(candidate, chordNotes);

      const summedTotal =
        score.breakdown.playability +
        score.breakdown.voiceLeading +
        score.breakdown.ergonomics +
        score.breakdown.completeness +
        score.breakdown.sonority;

      expect(score.total).toBe(summedTotal);
    });

    test('Am open chord scores well', () => {
      const chordNotes: NoteName[] = ['A', 'C', 'E'];

      // Classic Am: x02210
      const amOpen = createCandidate({
        frets: [null, 0, 2, 2, 1, 0],
        notesPlayed: ['A', 'E', 'A', 'C', 'E'] as NoteName[],
        bassNote: 'A' as NoteName,
        fretSpan: 1,
        baseFret: 1,
        playedStrings: 5,
        hasRoot: true,
        hasThird: true,
        hasFifth: true,
      });

      const score = scoreVoicing(amOpen, chordNotes);

      // Should have a good total score
      expect(score.total).toBeGreaterThan(50);
    });
  });
});

// ============================================================================
// rankVoicings TESTS
// ============================================================================

describe('rankVoicings', () => {
  test('returns voicings sorted by score descending', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];

    const candidates: VoicingCandidate[] = [
      createCandidate({ fretSpan: 4, baseFret: 10 }), // Lower score
      createCandidate({ fretSpan: 1, baseFret: 1 }), // Higher score
      createCandidate({ fretSpan: 2, baseFret: 5 }), // Medium score
    ];

    const ranked = rankVoicings(candidates, chordNotes);

    // Should be sorted descending by total score
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].score.total).toBeGreaterThanOrEqual(
        ranked[i].score.total,
      );
    }
  });

  test('respects limit parameter', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];

    const candidates: VoicingCandidate[] = [
      createCandidate({ fretSpan: 1 }),
      createCandidate({ fretSpan: 2 }),
      createCandidate({ fretSpan: 3 }),
      createCandidate({ fretSpan: 4 }),
    ];

    const ranked = rankVoicings(candidates, chordNotes, 2);

    expect(ranked).toHaveLength(2);
  });

  test('returns empty array for empty input', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const ranked = rankVoicings([], chordNotes);

    expect(ranked).toHaveLength(0);
  });

  test('includes both candidate and score in result', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const candidates = [createCandidate({})];

    const ranked = rankVoicings(candidates, chordNotes);

    expect(ranked[0]).toHaveProperty('candidate');
    expect(ranked[0]).toHaveProperty('score');
    expect(ranked[0].score).toHaveProperty('total');
    expect(ranked[0].score).toHaveProperty('breakdown');
  });
});

// ============================================================================
// getBestVoicing TESTS
// ============================================================================

describe('getBestVoicing', () => {
  test('returns highest scoring voicing', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];

    const best = createCandidate({ fretSpan: 1, baseFret: 1 });
    const worst = createCandidate({ fretSpan: 4, baseFret: 10, hasThird: false });

    const candidates = [worst, best];
    const result = getBestVoicing(candidates, chordNotes);

    expect(result).not.toBeNull();
    expect(result!.candidate.fretSpan).toBe(1);
  });

  test('returns null for empty candidates', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const result = getBestVoicing([], chordNotes);

    expect(result).toBeNull();
  });

  test('returns single candidate when only one provided', () => {
    const chordNotes: NoteName[] = ['A', 'C', 'E'];
    const candidate = createCandidate({});

    const result = getBestVoicing([candidate], chordNotes);

    expect(result).not.toBeNull();
    expect(result!.candidate).toBe(candidate);
  });
});

// ============================================================================
// SCORE BREAKDOWN TESTS
// ============================================================================

describe('score breakdown ranges', () => {
  test('playability is non-negative', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const candidate = createCandidate({});

    const score = scoreVoicing(candidate, chordNotes);
    expect(score.breakdown.playability).toBeGreaterThanOrEqual(0);
  });

  test('completeness is within expected range', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const candidate = createCandidate({});

    const score = scoreVoicing(candidate, chordNotes);
    expect(score.breakdown.completeness).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.completeness).toBeLessThanOrEqual(25);
  });

  test('sonority is within expected range', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];
    const candidate = createCandidate({});

    const score = scoreVoicing(candidate, chordNotes);
    expect(score.breakdown.sonority).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.sonority).toBeLessThanOrEqual(10);
  });
});

// ============================================================================
// COMMON CHORD SCORING TESTS
// ============================================================================

describe('common chord voicing scores', () => {
  test('C major open chord scores reasonably', () => {
    const chordNotes: NoteName[] = ['C', 'E', 'G'];

    // x32010
    const cMajor = createCandidate({
      frets: [null, 3, 2, 0, 1, 0],
      notesPlayed: ['C', 'E', 'G', 'C', 'E'] as NoteName[],
      bassNote: 'C' as NoteName,
      fretSpan: 2,
      baseFret: 1,
      playedStrings: 5,
      hasRoot: true,
      hasThird: true,
      hasFifth: true,
    });

    const score = scoreVoicing(cMajor, chordNotes);
    expect(score.total).toBeGreaterThan(40);
  });

  test('G major open chord scores reasonably', () => {
    const chordNotes: NoteName[] = ['G', 'B', 'D'];

    // 320003
    const gMajor = createCandidate({
      frets: [3, 2, 0, 0, 0, 3],
      notesPlayed: ['G', 'B', 'D', 'G', 'B', 'G'] as NoteName[],
      bassNote: 'G' as NoteName,
      fretSpan: 1,
      baseFret: 2,
      playedStrings: 6,
      hasRoot: true,
      hasThird: true,
      hasFifth: true,
    });

    const score = scoreVoicing(gMajor, chordNotes);
    expect(score.total).toBeGreaterThan(40);
  });

  test('E major open chord scores well', () => {
    const chordNotes: NoteName[] = ['E', 'G#', 'B'];

    // 022100
    const eMajor = createCandidate({
      frets: [0, 2, 2, 1, 0, 0],
      notesPlayed: ['E', 'B', 'E', 'G#', 'B', 'E'] as NoteName[],
      bassNote: 'E' as NoteName,
      fretSpan: 1,
      baseFret: 1,
      playedStrings: 6,
      hasRoot: true,
      hasThird: true,
      hasFifth: true,
    });

    const score = scoreVoicing(eMajor, chordNotes);
    expect(score.total).toBeGreaterThan(50);
  });
});
