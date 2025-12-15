/**
 * Audio Volume Configuration
 *
 * Centralized volume levels for consistent audio output across the app.
 * Values are 0.0 to 1.0, tuned for balanced perceived loudness.
 *
 * Note: UI sounds can be muted via settings.soundEnabled.
 * Metronome sounds always play regardless of this setting.
 */

/**
 * UI Sound Volumes
 * Used by UI feedback sound hooks (clicks, switches, etc.)
 */
export const UI_VOLUMES = {
  navButton: 0.7, // Primary navigation buttons - prominent
  fab: 0.7, // Floating action button - prominent
  gangSwitch: 0.5, // Toggle switches - subtle, frequent interaction
  rotaryKnob: 0.4, // Rotary knob detents - very subtle, fires often
  sharedClick: 0.6, // General UI clicks - moderate
} as const;

/**
 * Metronome Sound Volumes
 * All beats at same level for consistent volume
 */
export const METRONOME_VOLUMES = {
  accent: 1.0, // Downbeat (beat 1)
  tick: 1.0, // Regular beats (2, 3, 4)
  subdivision: 1.0, // Subdivision clicks
} as const;

export type UISoundType = keyof typeof UI_VOLUMES;
export type MetronomeVolumeType = keyof typeof METRONOME_VOLUMES;
