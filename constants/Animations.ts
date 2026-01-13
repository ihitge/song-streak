/**
 * Shared Animation Constants
 *
 * Centralized animation keyframes for consistent UI behavior across components.
 * Used by FrequencyTuner, RotaryKnob, and other filter controls.
 */

import { Keyframe } from 'react-native-reanimated';

// --- Glitch Transition Animations ---
// Used for cycling through options with a retro-tech flicker effect

/**
 * Enter from Right - Used when navigating to the NEXT option
 * Creates a glitchy entrance with opacity flickers
 */
export const EnterFromRight = new Keyframe({
  0: { transform: [{ translateX: 20 }], opacity: 0 },
  20: { transform: [{ translateX: 15 }], opacity: 0.5 },
  40: { transform: [{ translateX: 10 }], opacity: 0.1 }, // flicker
  60: { transform: [{ translateX: 5 }], opacity: 0.9 },
  80: { transform: [{ translateX: 2 }], opacity: 0.4 },
  100: { transform: [{ translateX: 0 }], opacity: 1 },
}).duration(250);

/**
 * Exit to Left - Used when the current option exits for NEXT
 */
export const ExitToLeft = new Keyframe({
  0: { transform: [{ translateX: 0 }], opacity: 1 },
  40: { transform: [{ translateX: -10 }], opacity: 0.5 },
  100: { transform: [{ translateX: -20 }], opacity: 0 },
}).duration(200);

/**
 * Enter from Left - Used when navigating to the PREVIOUS option
 * Creates a glitchy entrance with opacity flickers
 */
export const EnterFromLeft = new Keyframe({
  0: { transform: [{ translateX: -20 }], opacity: 0 },
  20: { transform: [{ translateX: -15 }], opacity: 0.5 },
  40: { transform: [{ translateX: -10 }], opacity: 0.1 }, // flicker
  60: { transform: [{ translateX: -5 }], opacity: 0.9 },
  80: { transform: [{ translateX: -2 }], opacity: 0.4 },
  100: { transform: [{ translateX: 0 }], opacity: 1 },
}).duration(250);

/**
 * Exit to Right - Used when the current option exits for PREVIOUS
 */
export const ExitToRight = new Keyframe({
  0: { transform: [{ translateX: 0 }], opacity: 1 },
  40: { transform: [{ translateX: 10 }], opacity: 0.5 },
  100: { transform: [{ translateX: 20 }], opacity: 0 },
}).duration(200);

// --- Animation Timing Constants ---

export const ANIMATION_DURATIONS = {
  /** Instant - for reduced motion or immediate state changes */
  instant: 0,
  /** Fast - quick feedback animations (150ms) */
  fast: 150,
  /** Glitch enter animation (250ms) */
  glitchEnter: 250,
  /** Glitch exit animation (200ms) */
  glitchExit: 200,
  /** Standard fade animation (200ms) */
  fade: 200,
  /** Standard slide animation (300ms) */
  slide: 300,
  /** Spring-based animation (400ms) */
  spring: 400,
  /** Slow animation for emphasis (500ms) */
  slow: 500,
} as const;

// --- Easing Presets ---
// These can be used with withTiming() for consistent easing across the app

export const EASING_PRESETS = {
  // Sharp, industrial feel
  sharp: { duration: 200 },
  // Smooth, natural movement
  smooth: { duration: 300 },
  // Bouncy, playful
  bouncy: { duration: 400 },
} as const;
