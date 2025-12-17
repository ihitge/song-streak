/**
 * Chord Type Definitions
 * Core types for chord visualization across instruments
 */

/** Barre chord position on the fretboard */
export interface BarrePosition {
  fret: number;
  fromString: number; // 0 = low E (thickest), 5 = high e (thinnest)
  toString: number;
}

/** Single chord voicing/fingering */
export interface ChordFingering {
  id: string;
  name: string; // "Open", "Barre", "Jazz", etc.
  frets: (number | null)[]; // null = muted, 0 = open, 1+ = fret position
  fingers?: (number | null)[]; // 1 = index, 2 = middle, 3 = ring, 4 = pinky
  barres?: BarrePosition[];
  baseFret?: number; // Starting fret for movable shapes (default: 1)
  difficulty?: ChordDifficulty;
}

export type ChordDifficulty = 'easy' | 'intermediate' | 'advanced';

/** Chord quality/type */
export type ChordQuality =
  | 'major'
  | 'minor'
  | 'diminished'
  | 'augmented'
  | 'dominant'
  | 'suspended'
  | 'add';

/** Full chord definition with multiple voicings */
export interface ChordDefinition {
  canonical: string; // Normalized key for lookup
  display: string; // User-friendly display name
  root: string; // Root note (C, D, E, F, G, A, B with optional # or b)
  quality: ChordQuality;
  extensions?: string[]; // "7", "9", "sus4", "add9", etc.
  voicings: ChordFingering[]; // First voicing is default
}

/** Chord lookup result with fallback info */
export interface ChordLookupResult {
  status: 'found' | 'similar' | 'generated' | 'unknown';
  chord?: ChordDefinition;
  suggestions?: string[]; // Similar chord names if not found
  displayName: string; // Always available for display
  isGenerated?: boolean; // True if chord was algorithmically generated
}

/** Fretboard-based instruments */
export type FretboardInstrument = 'guitar' | 'bass' | 'ukulele';

/** Keyboard-based instruments */
export type KeyboardInstrument = 'piano';

/** All supported instrument types */
export type InstrumentType =
  | FretboardInstrument
  | KeyboardInstrument
  | 'drums'
  | 'vocals';

/** Guitar-specific configuration */
export interface GuitarConfig {
  stringCount: 6;
  tuning: ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning (low to high)
  fretRange: [number, number]; // Typically [0, 4] for chord diagrams
}

/** Bass-specific configuration (future) */
export interface BassConfig {
  stringCount: 4;
  tuning: ['E', 'A', 'D', 'G']; // Standard 4-string bass
  fretRange: [number, number];
}

/** Instrument configuration map */
export const INSTRUMENT_CONFIGS: Record<
  FretboardInstrument,
  { stringCount: number; tuning: string[]; fretRange: [number, number] }
> = {
  guitar: {
    stringCount: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    fretRange: [0, 4],
  },
  bass: {
    stringCount: 4,
    tuning: ['E', 'A', 'D', 'G'],
    fretRange: [0, 4],
  },
  ukulele: {
    stringCount: 4,
    tuning: ['G', 'C', 'E', 'A'],
    fretRange: [0, 4],
  },
};
