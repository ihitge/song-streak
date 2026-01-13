/**
 * Audio Volume Configuration
 *
 * Centralized volume levels for consistent audio output across the app.
 * Values are 0.0 to 1.0, tuned for balanced perceived loudness.
 */

/**
 * Metronome Sound Volumes
 * All beats at same level for consistent volume
 */
export const METRONOME_VOLUMES = {
  accent: 1.0, // Downbeat (beat 1)
  tick: 1.0, // Regular beats (2, 3, 4)
  subdivision: 1.0, // Subdivision clicks
} as const;

export type MetronomeVolumeType = keyof typeof METRONOME_VOLUMES;
