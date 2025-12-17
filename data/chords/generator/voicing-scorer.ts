/**
 * Voicing Scorer
 * Ranks chord voicings by playability and musicality
 */

import { NoteName, getNoteIndex } from './music-theory';
import { VoicingCandidate } from './voicing-generator';

/** Breakdown of scoring factors */
export interface VoicingScore {
  total: number;
  breakdown: {
    playability: number; // 0-30: Lower fret span, open strings, low position
    voiceLeading: number; // -15 to 30: Root in bass, third present (critical!), fifth
    ergonomics: number; // 0-20: Common shapes, finger comfort
    completeness: number; // 0-25: All chord tones present (increased weight)
    sonority: number; // 0-10: Good spread, 4+ notes
  };
}

/**
 * Common chord shape patterns (fret distances from base fret)
 * These are the classic CAGED shapes that are comfortable to play
 */
const COMMON_SHAPES = [
  // E shape major barre
  [0, 2, 2, 1, 0, 0],
  // A shape major barre
  [null, 0, 2, 2, 2, 0],
  // C shape
  [null, 3, 2, 0, 1, 0],
  // G shape
  [3, 2, 0, 0, 0, 3],
  // D shape
  [null, null, 0, 2, 3, 2],
  // Am shape
  [null, 0, 2, 2, 1, 0],
  // Em shape
  [0, 2, 2, 0, 0, 0],
  // Dm shape
  [null, null, 0, 2, 3, 1],
];

/**
 * Calculate how similar a voicing is to common shapes
 */
function shapeMatchScore(frets: (number | null)[]): number {
  let bestMatch = 0;

  for (const shape of COMMON_SHAPES) {
    let matches = 0;
    let comparisons = 0;

    for (let i = 0; i < 6; i++) {
      const voicingFret = frets[i];
      const shapeFret = shape[i];

      // Both muted
      if (voicingFret === null && shapeFret === null) {
        matches++;
        comparisons++;
        continue;
      }

      // One muted, one not
      if (voicingFret === null || shapeFret === null) {
        comparisons++;
        continue;
      }

      // Both fretted - compare relative positions
      comparisons++;
      // For shape matching, we care about relative distances, not absolute frets
      // So we just check if the pattern of muted/open/fretted matches
      if (
        (voicingFret === 0 && shapeFret === 0) ||
        (voicingFret > 0 && shapeFret > 0)
      ) {
        matches++;
      }
    }

    const matchRatio = comparisons > 0 ? matches / comparisons : 0;
    bestMatch = Math.max(bestMatch, matchRatio);
  }

  return bestMatch;
}

/**
 * Count open strings in a voicing
 */
function countOpenStrings(frets: (number | null)[]): number {
  return frets.filter((f) => f === 0).length;
}

/**
 * Check if voicing has adjacent string skips (muted strings between played)
 */
function hasAdjacentSkips(frets: (number | null)[]): boolean {
  let lastPlayed = -1;

  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== null) {
      if (lastPlayed !== -1 && i - lastPlayed > 1) {
        // Check if there's a muted string between played strings
        // This is generally harder to play cleanly
        return true;
      }
      lastPlayed = i;
    }
  }

  return false;
}

/**
 * Calculate finger stretch difficulty based on fret positions
 */
function calculateStretchDifficulty(frets: (number | null)[]): number {
  const frettedPositions: { string: number; fret: number }[] = [];

  for (let i = 0; i < frets.length; i++) {
    if (frets[i] !== null && frets[i]! > 0) {
      frettedPositions.push({ string: i, fret: frets[i]! });
    }
  }

  if (frettedPositions.length <= 1) return 0;

  // Check for difficult stretches (large fret span with small string span)
  let maxDifficulty = 0;

  for (let i = 0; i < frettedPositions.length; i++) {
    for (let j = i + 1; j < frettedPositions.length; j++) {
      const fretDiff = Math.abs(
        frettedPositions[i].fret - frettedPositions[j].fret,
      );
      const stringDiff = Math.abs(
        frettedPositions[i].string - frettedPositions[j].string,
      );

      // Large fret diff with small string diff = difficult stretch
      if (stringDiff > 0 && fretDiff > 2) {
        const difficulty = fretDiff / stringDiff;
        maxDifficulty = Math.max(maxDifficulty, difficulty);
      }
    }
  }

  return maxDifficulty;
}

/**
 * Score a voicing candidate (higher = better)
 */
export function scoreVoicing(
  candidate: VoicingCandidate,
  chordNotes: NoteName[],
): VoicingScore {
  const breakdown = {
    playability: 0,
    voiceLeading: 0,
    ergonomics: 0,
    completeness: 0,
    sonority: 0,
  };

  // === PLAYABILITY (0-30 points) ===
  // Fret span scoring
  if (candidate.fretSpan <= 2) {
    breakdown.playability += 15;
  } else if (candidate.fretSpan <= 3) {
    breakdown.playability += 10;
  } else if (candidate.fretSpan <= 4) {
    breakdown.playability += 5;
  }

  // Open strings bonus
  const openStrings = countOpenStrings(candidate.frets);
  breakdown.playability += Math.min(openStrings * 2, 6);

  // Low position bonus (easier to play)
  if (candidate.baseFret <= 3) {
    breakdown.playability += 6;
  } else if (candidate.baseFret <= 5) {
    breakdown.playability += 4;
  } else if (candidate.baseFret <= 7) {
    breakdown.playability += 2;
  }

  // Stretch difficulty penalty
  const stretchDifficulty = calculateStretchDifficulty(candidate.frets);
  breakdown.playability -= Math.min(stretchDifficulty * 2, 6);

  // Ensure non-negative
  breakdown.playability = Math.max(0, breakdown.playability);

  // === VOICE LEADING (0-25 points) ===
  // Root in bass is highly valued
  if (candidate.hasRoot && candidate.bassNote) {
    const bassIndex = getNoteIndex(candidate.bassNote);
    const rootIndex = getNoteIndex(chordNotes[0]);
    if (bassIndex === rootIndex) {
      breakdown.voiceLeading += 15;
    } else {
      breakdown.voiceLeading += 8; // Root present but not in bass
    }
  }

  // Third present (defines major/minor quality) - CRITICAL for chord identity
  if (candidate.hasThird) {
    breakdown.voiceLeading += 10;
  } else {
    // Heavily penalize missing the third - it defines the chord quality!
    breakdown.voiceLeading -= 15;
  }

  // Fifth present (adds fullness)
  if (candidate.hasFifth) {
    breakdown.voiceLeading += 5;
  }

  // === ERGONOMICS (0-20 points) ===
  // Shape matching
  const shapeMatch = shapeMatchScore(candidate.frets);
  breakdown.ergonomics += Math.round(shapeMatch * 12);

  // No adjacent string skips
  if (!hasAdjacentSkips(candidate.frets)) {
    breakdown.ergonomics += 5;
  }

  // Bonus for having bass strings muted cleanly (easier than middle)
  const firstMuted =
    candidate.frets[0] === null || candidate.frets[1] === null;
  const middleMuted =
    candidate.frets[2] === null || candidate.frets[3] === null;
  if (firstMuted && !middleMuted) {
    breakdown.ergonomics += 3;
  }

  // === COMPLETENESS (0-25 points) ===
  // Increased weight to prioritize voicings with all chord tones
  const uniqueNotesPlayed = new Set(
    candidate.notesPlayed.map((n) => getNoteIndex(n)),
  );
  const totalChordNotes = new Set(chordNotes.map((n) => getNoteIndex(n))).size;
  const coverage = uniqueNotesPlayed.size / totalChordNotes;

  if (coverage >= 1) {
    breakdown.completeness = 25; // Full coverage - highly rewarded
  } else if (coverage >= 0.8) {
    breakdown.completeness = 15;
  } else if (coverage >= 0.6) {
    breakdown.completeness = 8;
  } else {
    breakdown.completeness = 2; // Missing too many notes - penalized
  }

  // === SONORITY (0-10 points) ===
  // 4+ notes sounding
  if (candidate.playedStrings >= 5) {
    breakdown.sonority += 5;
  } else if (candidate.playedStrings >= 4) {
    breakdown.sonority += 4;
  } else if (candidate.playedStrings >= 3) {
    breakdown.sonority += 2;
  }

  // Good note spread (not all clustered on adjacent strings)
  const playedIndices = candidate.frets
    .map((f, i) => (f !== null ? i : -1))
    .filter((i) => i >= 0);

  if (playedIndices.length > 0) {
    const spread =
      playedIndices[playedIndices.length - 1] - playedIndices[0] + 1;
    if (spread >= 5) {
      breakdown.sonority += 5;
    } else if (spread >= 4) {
      breakdown.sonority += 3;
    } else if (spread >= 3) {
      breakdown.sonority += 2;
    }
  }

  // Calculate total
  const total =
    breakdown.playability +
    breakdown.voiceLeading +
    breakdown.ergonomics +
    breakdown.completeness +
    breakdown.sonority;

  return { total, breakdown };
}

/**
 * Rank voicings by score and return top N
 */
export function rankVoicings(
  candidates: VoicingCandidate[],
  chordNotes: NoteName[],
  limit: number = 5,
): { candidate: VoicingCandidate; score: VoicingScore }[] {
  const scored = candidates.map((candidate) => ({
    candidate,
    score: scoreVoicing(candidate, chordNotes),
  }));

  // Sort by total score descending
  scored.sort((a, b) => b.score.total - a.score.total);

  return scored.slice(0, limit);
}

/**
 * Get the best voicing for a chord
 */
export function getBestVoicing(
  candidates: VoicingCandidate[],
  chordNotes: NoteName[],
): { candidate: VoicingCandidate; score: VoicingScore } | null {
  const ranked = rankVoicings(candidates, chordNotes, 1);
  return ranked.length > 0 ? ranked[0] : null;
}
