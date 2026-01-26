/**
 * Metronome Type Definitions
 *
 * TypeScript interfaces for the professional-grade metronome feature.
 */

/**
 * Metronome playback state
 */
export type MetronomeState = 'idle' | 'playing' | 'stopping';

/**
 * Core metronome configuration
 */
export interface MetronomeConfig {
  /** Minimum BPM (Largo) */
  bpmMin: number;
  /** Maximum BPM (Prestissimo) */
  bpmMax: number;
  /** Default starting BPM */
  bpmDefault: number;
  /** How far ahead to schedule beats (ms) - critical for sample-accurate timing */
  lookaheadMs: number;
  /** How often to check for beats to schedule (ms) */
  schedulerIntervalMs: number;
  /** Reset tap tempo after this many ms without a tap */
  tapTimeoutMs: number;
  /** Minimum number of taps to calculate BPM */
  tapMinCount: number;
  /** Maximum taps to keep (rolling window) */
  tapMaxCount: number;
}

/**
 * Information about a scheduled beat
 */
export interface BeatEvent {
  /** AudioContext time when beat should play */
  time: number;
  /** Beat index within the measure (0-based, e.g., 0-3 for 4/4) */
  beatIndex: number;
  /** Whether this is an accented beat (typically beat 1) */
  isAccent: boolean;
}

/**
 * Pendulum animation state
 */
export interface PendulumState {
  /** Current angle in degrees (-30 to +30) */
  angle: number;
  /** Direction of swing */
  direction: 'left' | 'right';
  /** Current velocity for physics-based animation */
  velocity: number;
}

/**
 * Available click sound types
 * Future enhancement: allow users to select click sound
 */
export type ClickSound = 'woodblock' | 'cowbell' | 'rimshot' | 'hihat' | 'synth';

/**
 * Audio engine status
 */
export interface AudioEngineStatus {
  /** Whether the audio context is ready */
  isReady: boolean;
  /** Error message if initialization failed */
  error: string | null;
  /** Whether audio buffers are loaded */
  buffersLoaded: boolean;
}

/**
 * Tap tempo hook return type
 */
export interface UseTapTempoReturn {
  /** Handle a tap event, returns calculated BPM or null if not enough taps */
  handleTap: () => number | null;
  /** Number of taps in current session */
  tapCount: number;
  /** Reset tap tempo state */
  reset: () => void;
}

/**
 * Main metronome hook return type
 */
export interface UseMetronomeReturn {
  // State
  /** Current metronome state */
  state: MetronomeState;
  /** Current BPM */
  bpm: number;
  /** Whether metronome is playing */
  isPlaying: boolean;
  /** Current beat index (0-3 for 4/4 time) */
  currentBeat: number;
  /** Pendulum angle for visual sync (-30 to +30 degrees) */
  pendulumAngle: number;

  // Actions
  /** Start the metronome */
  start: () => void;
  /** Stop the metronome */
  stop: () => void;
  /** Toggle play/stop */
  toggle: () => void;
  /** Set BPM directly */
  setBpm: (bpm: number) => void;
  /** Increment/decrement BPM */
  incrementBpm: (delta: number) => void;
  /** Handle tap tempo */
  handleTapTempo: () => void;

  // Status
  /** Number of taps in current tap tempo session */
  tapCount: number;
  /** Whether audio engine is ready */
  isAudioReady: boolean;
  /** Audio initialization error */
  audioError: string | null;
}

/**
 * Audio engine hook return type
 */
export interface UseMetronomeAudioReturn {
  // Status
  /** Whether the audio engine is ready */
  isReady: boolean;
  /** Error message if any */
  error: string | null;

  // Control
  /** Start playback with given BPM and beat callback */
  start: (bpm: number, onBeat: (beatIndex: number, isAccent: boolean) => void) => void;
  /** Stop playback */
  stop: () => void;
  /** Update BPM during playback (seamless transition) */
  updateBpm: (bpm: number) => void;

  // Lifecycle
  /** Initialize audio context and load buffers */
  initialize: () => Promise<void>;
  /** Cleanup resources */
  cleanup: () => void;
}
