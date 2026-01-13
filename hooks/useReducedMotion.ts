/**
 * useReducedMotion Hook
 *
 * Detects user's preference for reduced motion (accessibility setting).
 * Components should use this to disable or simplify animations.
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * const animationDuration = prefersReducedMotion ? 0 : 300;
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to detect if the user prefers reduced motion
 * @returns boolean - true if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Get initial value
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setPrefersReducedMotion(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setPrefersReducedMotion(enabled);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
