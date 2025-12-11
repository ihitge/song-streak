/**
 * Metronome Type Definitions
 *
 * Core types for the combined metronome + practice timer feature.
 */

/**
 * Time signature representation
 */
export interface TimeSignature {
  beats: number;      // Numerator (e.g., 4 in 4/4)
  noteValue: number;  // Denominator (e.g., 4 in 4/4)
}

/**
 * Subdivision options for metronome clicks
 */
export type Subdivision = 1 | 2 | 3 | 4;

/**
 * Available time signature options
 */
export const TIME_SIGNATURE_OPTIONS = [
  { value: '2/4', label: '2/4', beats: 2, noteValue: 4 },
  { value: '3/4', label: '3/4', beats: 3, noteValue: 4 },
  { value: '4/4', label: '4/4', beats: 4, noteValue: 4 },
  { value: '5/4', label: '5/4', beats: 5, noteValue: 4 },
  { value: '6/8', label: '6/8', beats: 6, noteValue: 8 },
  { value: '7/8', label: '7/8', beats: 7, noteValue: 8 },
] as const;

/**
 * Subdivision options for GangSwitch
 */
export const SUBDIVISION_OPTIONS = [
  { value: 1 as Subdivision, label: '1' },  // Quarter notes
  { value: 2 as Subdivision, label: '2' },  // Eighth notes
  { value: 3 as Subdivision, label: '3' },  // Triplets
  { value: 4 as Subdivision, label: '4' },  // Sixteenth notes
] as const;

/**
 * Metronome state
 */
export interface MetronomeState {
  bpm: number;                    // Beats per minute (40-240)
  timeSignature: string;          // e.g., '4/4'
  subdivision: Subdivision;       // Clicks per beat
  currentBeat: number;            // Current beat in measure (1-indexed)
  currentSubdivision: number;     // Current subdivision within beat (1-indexed)
  isPlaying: boolean;             // Whether metronome is active
  beatPosition: number;           // 0 or 1 for VU meter (left/right pendulum)
}

/**
 * Options for useMetronome hook
 */
export interface UseMetronomeOptions {
  initialBpm?: number;              // Default: 120
  initialTimeSignature?: string;    // Default: '4/4'
  initialSubdivision?: Subdivision; // Default: 1
  onBeat?: (beat: number, isDownbeat: boolean) => void;
  onSubdivision?: (subdivisionTick: number, beat: number) => void;
  onStateChange?: (isPlaying: boolean) => void;
}

/**
 * Return type for useMetronome hook
 */
export interface UseMetronomeReturn {
  // State
  bpm: number;
  timeSignature: string;
  subdivision: Subdivision;
  currentBeat: number;
  currentSubdivision: number;
  isPlaying: boolean;
  beatPosition: number;
  beatsPerMeasure: number;

  // Actions
  start: () => void;
  stop: () => void;
  toggle: () => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: string) => void;
  setSubdivision: (sub: Subdivision) => void;
  tapTempo: () => number | null;  // Returns calculated BPM or null
}

/**
 * Sound pool for low-latency audio playback
 */
export interface MetronomeSoundPool {
  accentSounds: any[];     // Pool of accent click sounds (downbeat)
  tickSounds: any[];       // Pool of regular click sounds
  subdivisionSounds: any[]; // Pool of subdivision tick sounds
  currentAccentIndex: number;
  currentTickIndex: number;
  currentSubdivisionIndex: number;
}

/**
 * Metronome settings for persistence
 */
export interface MetronomeSettings {
  defaultBpm: number;              // Default: 120
  defaultTimeSignature: string;    // Default: '4/4'
  defaultSubdivision: Subdivision; // Default: 1
  accentDownbeat: boolean;         // Default: true
  autoStartTimer: boolean;         // Default: true (auto-couple with practice timer)
  visualFlash: boolean;            // Default: true (LED flash on beat)
}

/**
 * Default metronome settings
 */
export const DEFAULT_METRONOME_SETTINGS: MetronomeSettings = {
  defaultBpm: 120,
  defaultTimeSignature: '4/4',
  defaultSubdivision: 1,
  accentDownbeat: true,
  autoStartTimer: true,
  visualFlash: true,
};

/**
 * BPM constraints
 */
export const BPM_MIN = 40;
export const BPM_MAX = 240;

/**
 * Parse time signature string to TimeSignature object
 */
export function parseTimeSignature(ts: string): TimeSignature {
  const match = ts.match(/(\d+)\/(\d+)/);
  if (match) {
    return {
      beats: parseInt(match[1], 10),
      noteValue: parseInt(match[2], 10),
    };
  }
  return { beats: 4, noteValue: 4 }; // Default to 4/4
}

/**
 * Get beats per measure from time signature string
 */
export function getBeatsPerMeasure(ts: string): number {
  const { beats } = parseTimeSignature(ts);
  return beats;
}

/**
 * Calculate interval between clicks in milliseconds
 */
export function calculateClickInterval(bpm: number, subdivision: Subdivision): number {
  const beatInterval = 60000 / bpm;
  return beatInterval / subdivision;
}

/**
 * Parse BPM from tempo string (e.g., "120 BPM", "~115-120 BPM")
 */
export function parseBpm(tempoString: string | undefined): number {
  if (!tempoString) return 120;

  // Handle various formats: "120 BPM", "~115-120 BPM", "Moderato (108-120)"
  const match = tempoString.match(/(\d+)/);
  if (match) {
    const bpm = parseInt(match[1], 10);
    return bpm >= BPM_MIN && bpm <= BPM_MAX ? bpm : 120;
  }
  return 120;
}

/**
 * Parse time signature from string (e.g., "4/4", "3/4")
 */
export function parseTimeSignatureString(tsString: string | undefined): string {
  if (!tsString) return '4/4';
  const match = tsString.match(/(\d+)\/(\d+)/);
  return match ? `${match[1]}/${match[2]}` : '4/4';
}
