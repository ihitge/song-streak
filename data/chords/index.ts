/**
 * Chord Data Module
 * Re-exports all chord-related data and utilities
 */

// Types (re-export from types/chords.ts)
export type {
  ChordFingering,
  ChordDefinition,
  ChordLookupResult,
  BarrePosition,
  ChordDifficulty,
  ChordQuality,
  FretboardInstrument,
  InstrumentType,
} from '@/types/chords';

export { INSTRUMENT_CONFIGS } from '@/types/chords';

// Guitar chord dictionary
export {
  GUITAR_CHORDS,
  getGuitarChordNames,
  hasGuitarChord,
  getGuitarChord,
} from './guitar';

// Utilities
export {
  parseChordName,
  normalizeChordName,
  getDisplayName,
  chordsEqual,
} from './utils/normalizer';

export {
  lookupChord,
  lookupChords,
  getDefaultVoicing,
  hasAnyDiagrams,
} from './utils/lookup';

// Chord generator (for algorithmic chord generation)
export {
  generateChord,
  canGenerateChord,
  parseChordName as parseChordNameForGenerator,
  getChordNotes,
} from './generator';
