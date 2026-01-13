/**
 * Web Audio API Type Definitions
 *
 * These types represent the Web Audio API interfaces used by
 * react-native-audio-api and the browser's native Web Audio API.
 *
 * They provide type safety for audio playback in the metronome and
 * other audio features.
 */

/**
 * AudioContext - The main interface for audio processing
 * Used by both react-native-audio-api (native) and Web Audio API (browser)
 */
export interface AudioContextType {
  /** Current time in seconds (high-precision hardware clock) */
  readonly currentTime: number;

  /** Sample rate of the audio context */
  readonly sampleRate: number;

  /** The destination node (speakers/headphones) */
  readonly destination: AudioDestinationNodeType;

  /** State of the audio context */
  readonly state: 'suspended' | 'running' | 'closed';

  /** Create a gain node for volume control */
  createGain(): GainNodeType;

  /** Create a buffer source node for playback */
  createBufferSource(): AudioBufferSourceNodeType;

  /** Decode audio data from an ArrayBuffer */
  decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBufferType>;

  /** Close the audio context and release resources */
  close(): Promise<void>;

  /** Resume the audio context if suspended */
  resume(): Promise<void>;

  /** Suspend the audio context */
  suspend(): Promise<void>;
}

/**
 * AudioBuffer - Holds decoded audio data in memory
 */
export interface AudioBufferType {
  /** Duration of the audio in seconds */
  readonly duration: number;

  /** Length in sample frames */
  readonly length: number;

  /** Number of channels (1 = mono, 2 = stereo) */
  readonly numberOfChannels: number;

  /** Sample rate of the audio data */
  readonly sampleRate: number;

  /** Get channel data as Float32Array */
  getChannelData(channel: number): Float32Array;
}

/**
 * AudioDestinationNode - The final output (speakers/headphones)
 */
export interface AudioDestinationNodeType {
  /** Maximum number of channels */
  readonly maxChannelCount: number;
}

/**
 * GainNode - Controls audio volume
 */
export interface GainNodeType {
  /** The gain (volume) parameter */
  readonly gain: AudioParamType;

  /** Connect this node to another node or destination */
  connect(destination: AudioDestinationNodeType | GainNodeType): void;

  /** Disconnect from all connected nodes */
  disconnect(): void;
}

/**
 * AudioBufferSourceNode - Plays an AudioBuffer
 */
export interface AudioBufferSourceNodeType {
  /** The buffer to play (set before starting) */
  buffer: AudioBufferType | null;

  /** Whether to loop the audio */
  loop: boolean;

  /** Playback rate (1.0 = normal speed) */
  readonly playbackRate: AudioParamType;

  /** Connect to a destination node */
  connect(destination: GainNodeType | AudioDestinationNodeType): void;

  /** Start playback at the specified time */
  start(when?: number, offset?: number, duration?: number): void;

  /** Stop playback at the specified time */
  stop(when?: number): void;

  /** Disconnect from all connected nodes */
  disconnect(): void;
}

/**
 * AudioParam - An automatable audio parameter
 */
export interface AudioParamType {
  /** Current value */
  value: number;

  /** Default value */
  readonly defaultValue: number;

  /** Minimum value */
  readonly minValue: number;

  /** Maximum value */
  readonly maxValue: number;

  /** Set value at a specific time */
  setValueAtTime(value: number, startTime: number): AudioParamType;

  /** Linear ramp to a value */
  linearRampToValueAtTime(value: number, endTime: number): AudioParamType;

  /** Exponential ramp to a value */
  exponentialRampToValueAtTime(value: number, endTime: number): AudioParamType;
}

/**
 * Audio asset module type (from require())
 */
export type AudioAssetModule = number;

/**
 * Audio buffers collection for metronome sounds
 */
export interface MetronomeAudioBuffers {
  clickAccent: AudioBufferType | null;
  clickTick: AudioBufferType | null;
  clickSubdiv: AudioBufferType | null;
  snare: AudioBufferType | null;
  kick: AudioBufferType | null;
  hihat: AudioBufferType | null;
}
