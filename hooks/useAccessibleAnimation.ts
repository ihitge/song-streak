/**
 * useAccessibleAnimation Hook
 *
 * Returns animation duration based on user's reduced motion preference.
 * Works on both iOS and Android via AccessibilityInfo.
 *
 * Usage:
 * const duration = useAccessibleAnimation(300);
 * // Returns 0 if reduced motion enabled, 300 otherwise
 *
 * With custom reduced value:
 * const duration = useAccessibleAnimation(300, 50);
 * // Returns 50 if reduced motion enabled (faster but not instant)
 */

import { useMemo } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { ANIMATION_DURATIONS } from '@/constants/Animations';

/**
 * Hook to get accessible animation duration
 * @param duration - Default animation duration in ms
 * @param reducedDuration - Optional duration when reduced motion is preferred (default: 0)
 * @returns Appropriate duration based on accessibility settings
 */
export function useAccessibleAnimation(
  duration: number = ANIMATION_DURATIONS.fade,
  reducedDuration: number = ANIMATION_DURATIONS.instant
): number {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => {
    return prefersReducedMotion ? reducedDuration : duration;
  }, [prefersReducedMotion, duration, reducedDuration]);
}

/**
 * Hook to get animation config object with accessible duration
 * Useful for Animated.timing() calls
 *
 * Usage:
 * const config = useAccessibleTimingConfig(300);
 * Animated.timing(value, { toValue: 1, ...config }).start();
 */
export function useAccessibleTimingConfig(
  duration: number = ANIMATION_DURATIONS.fade,
  reducedDuration: number = ANIMATION_DURATIONS.instant
): { duration: number; useNativeDriver: boolean } {
  const accessibleDuration = useAccessibleAnimation(duration, reducedDuration);

  return useMemo(() => ({
    duration: accessibleDuration,
    useNativeDriver: true,
  }), [accessibleDuration]);
}

/**
 * Hook to get spring config with accessible tension
 * Higher tension = faster animation for reduced motion users
 *
 * Usage:
 * const config = useAccessibleSpringConfig();
 * Animated.spring(value, { toValue: 1, ...config }).start();
 */
export function useAccessibleSpringConfig(
  tension: number = 100,
  friction: number = 10
): { tension: number; friction: number; useNativeDriver: boolean } {
  const prefersReducedMotion = useReducedMotion();

  return useMemo(() => ({
    // Very high tension for instant-like springs when reduced motion preferred
    tension: prefersReducedMotion ? 999 : tension,
    friction: prefersReducedMotion ? 50 : friction,
    useNativeDriver: true,
  }), [prefersReducedMotion, tension, friction]);
}

export default useAccessibleAnimation;
