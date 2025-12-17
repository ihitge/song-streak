/**
 * Chord Name Normalizer
 * Handles variations in chord naming from Gemini API
 */

import type { ChordQuality } from '@/types/chords';

interface ParsedChord {
  root: string;
  quality: ChordQuality;
  extensions: string[];
  canonical: string;
  display: string;
}

/** Map common quality aliases to canonical quality */
const QUALITY_ALIASES: Record<string, ChordQuality> = {
  m: 'minor',
  min: 'minor',
  '-': 'minor',
  mi: 'minor',
  M: 'major',
  maj: 'major',
  Maj: 'major',
  dim: 'diminished',
  o: 'diminished',
  '°': 'diminished',
  aug: 'augmented',
  '+': 'augmented',
  sus: 'suspended',
  add: 'add',
};

/** Valid root notes */
const VALID_ROOTS = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

/** Normalize sharp/flat notation */
const normalizeAccidental = (note: string): string => {
  // Convert common variations
  return note
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b')
    .replace(/s$/i, '#'); // Handle "Cs" -> "C#"
};

/**
 * Parse a chord string into its components
 * Handles: Am, Amin, A-, Am7, Amaj7, Asus4, Cadd9, F#m, etc.
 */
export const parseChordName = (input: string): ParsedChord | null => {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  // Normalize accidentals
  const normalized = normalizeAccidental(trimmed);

  // Extract root note (1-2 chars: letter + optional # or b)
  const rootMatch = normalized.match(/^([A-Ga-g][#b]?)/);
  if (!rootMatch) return null;

  let root = rootMatch[1].charAt(0).toUpperCase();
  if (rootMatch[1].length > 1) {
    root += rootMatch[1].charAt(1);
  }

  // Validate root
  if (!VALID_ROOTS.includes(root)) return null;

  // Get remainder after root
  const remainder = normalized.slice(root.length);

  // Default to major if no quality specified
  let quality: ChordQuality = 'major';
  const extensions: string[] = [];
  let qualityPart = '';

  // Check for quality indicators
  if (remainder.length > 0) {
    // Check for minor variations first (must be before 'maj' check)
    if (/^(m(?!aj)|min|-|mi)/.test(remainder)) {
      quality = 'minor';
      qualityPart = remainder.match(/^(m(?!aj)|min|-|mi)/)?.[0] || '';
    }
    // Check for major explicit (including maj7, maj9, etc.)
    else if (/^(M|maj|Maj)/.test(remainder)) {
      quality = 'major';
      // Check for maj7, maj9 specifically to capture full extension
      const majExtMatch = remainder.match(/^(maj|Maj)(7|9|11|13)?/i);
      if (majExtMatch) {
        qualityPart = majExtMatch[0];
        // If followed by 7, 9, etc., capture as maj7, maj9
        if (majExtMatch[2]) {
          extensions.push('maj' + majExtMatch[2]);
        }
      } else {
        qualityPart = remainder.match(/^(M|maj|Maj)/)?.[0] || '';
      }
    }
    // Check for diminished
    else if (/^(dim|o|°)/.test(remainder)) {
      quality = 'diminished';
      qualityPart = remainder.match(/^(dim|o|°)/)?.[0] || '';
    }
    // Check for augmented
    else if (/^(aug|\+)/.test(remainder)) {
      quality = 'augmented';
      qualityPart = remainder.match(/^(aug|\+)/)?.[0] || '';
    }
    // Check for suspended (sus2, sus4)
    else if (/^sus/.test(remainder)) {
      quality = 'suspended';
      const susMatch = remainder.match(/^sus([24])?/);
      qualityPart = susMatch ? susMatch[0] : 'sus';
      // Capture the full extension (sus2 or sus4)
      if (susMatch?.[1]) {
        extensions.push('sus' + susMatch[1]);
      }
    }
    // Check for add chords (add9, add2)
    else if (/^add/.test(remainder)) {
      quality = 'add';
      const addMatch = remainder.match(/^add([29])?/);
      qualityPart = addMatch ? addMatch[0] : 'add';
      // Capture the full extension (add9 or add2)
      if (addMatch?.[1]) {
        extensions.push('add' + addMatch[1]);
      }
    }
  }

  // Extract extensions (7, 9, 11, 13, sus2, sus4, add9, etc.)
  const extensionPart = remainder.slice(qualityPart.length);
  if (extensionPart.length > 0) {
    // Match common extensions
    const extMatches = extensionPart.match(/(sus[24]|add[29]|maj7|7|9|11|13|6)/gi);
    if (extMatches) {
      extensions.push(...extMatches.map((e) => e.toLowerCase()));
    }
  }

  // Build canonical name
  let canonical = root;
  if (quality === 'minor') canonical += 'm';
  if (extensions.length > 0) {
    canonical += extensions.join('');
  }

  // Build display name (user-friendly)
  let display = root;
  if (quality === 'minor') display += 'm';
  else if (quality === 'diminished') display += 'dim';
  else if (quality === 'augmented') display += 'aug';
  if (extensions.length > 0) {
    display += extensions.join('');
  }

  return {
    root,
    quality,
    extensions,
    canonical,
    display,
  };
};

/**
 * Normalize a chord name to its canonical form for dictionary lookup
 */
export const normalizeChordName = (input: string): string => {
  const parsed = parseChordName(input);
  return parsed?.canonical || input;
};

/**
 * Get display-friendly chord name
 */
export const getDisplayName = (input: string): string => {
  const parsed = parseChordName(input);
  return parsed?.display || input;
};

/**
 * Check if two chord names refer to the same chord
 */
export const chordsEqual = (chord1: string, chord2: string): boolean => {
  return normalizeChordName(chord1) === normalizeChordName(chord2);
};
