/**
 * Tuner Configuration Constants
 *
 * Optimized for guitar frequency range (82Hz - 330Hz)
 * Based on YIN algorithm tuning parameters
 */

/**
 * Audio capture and processing configuration
 */
export const AUDIO_CONFIG = {
  /** Sample rate in Hz - standard rate for excellent guitar frequency resolution */
  sampleRate: 44100,

  /** Buffer size for audio stream - we accumulate to larger buffer for pitch detection */
  bufferSize: 2048,

  /** Number of audio channels (mono for tuning) */
  channels: 1,

  /** Bits per sample for PCM audio */
  bitsPerSample: 16,

  /**
   * Target buffer size for pitch detection
   * Low E (82Hz) needs ~12.1ms per cycle, so 4096 samples (~93ms)
   * gives ~7.7 cycles for reliable detection
   */
  pitchDetectionBufferSize: 4096,

  /** FFT size for web audio analyzer (must be power of 2) */
  fftSize: 2048,
} as const;

/**
 * YIN algorithm configuration
 */
export const YIN_CONFIG = {
  /**
   * Threshold for YIN algorithm (0.0 - 1.0)
   * Lower = more lenient (accepts quieter notes)
   * Higher = stricter (rejects more noise)
   * 0.06-0.10 is the sweet spot for guitar
   */
  threshold: 0.06,

  /** Sample rate must match audio config */
  sampleRate: AUDIO_CONFIG.sampleRate,

  /** Minimum frequency to detect (below Low E) */
  minFrequency: 60,

  /** Maximum frequency to detect (above High E harmonics) */
  maxFrequency: 1500,
} as const;

/**
 * Volume thresholds for noise gating
 */
export const VOLUME_THRESHOLD = {
  /** dB level to start detecting (onset) - sensitive for quiet playing */
  onset: -50,

  /** dB level to stop detecting (release) - lower to maintain detection */
  release: -60,

  /** Minimum ms above threshold before accepting signal */
  minDuration: 20,

  /** Very lenient threshold for mobile mic input */
  mobileFloor: -85,
} as const;

/**
 * Tuning detection thresholds
 */
export const TUNING_CONFIG = {
  /** Cents deviation to enter "in tune" state */
  inTuneEnter: 5,

  /** Cents deviation to exit "in tune" state (prevents toggling) */
  inTuneExit: 8,

  /** Milliseconds of stability required */
  stableTime: 100,

  /** Maximum cents change per update (allow any jump for responsiveness) */
  maxCentsChangePerUpdate: 200,

  /** Minimum hold duration in ms */
  holdDuration: 50,

  /** Maximum cents from target to even consider as a match */
  maxCentsForMatch: 400,

  /** Cents tolerance for string matching */
  stringMatchTolerance: 50,
} as const;

/**
 * Pitch smoothing configuration
 * Currently disabled for zero-latency response
 */
export const SMOOTHING_CONFIG = {
  /** Alpha for fast response (higher = faster) */
  fastAlpha: 0.9,

  /** Alpha for slow/stable response */
  slowAlpha: 0.5,

  /** Cents threshold to switch between fast/slow */
  changeThreshold: 5,
} as const;

/**
 * Processing throttle to prevent overloading JS thread
 */
export const PROCESSING_CONFIG = {
  /** Minimum ms between pitch detection runs */
  interval: 50, // 20 fps

  /** Debug log limit (first N packets only) */
  debugLogLimit: 2,
} as const;
