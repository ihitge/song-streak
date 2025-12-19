/**
 * Tactile Feedback Utility
 *
 * Provides consistent haptic + audio feedback for interactive UI elements.
 * This utility reduces code duplication across the 31+ components that use
 * the same haptic → sound → action pattern.
 *
 * Usage:
 *   import { withTactileFeedback, triggerHaptic } from '@/utils/feedback';
 *
 *   // With a sound hook
 *   const { playSound } = useClickSound();
 *   const handlePress = withTactileFeedback(playSound, () => {
 *     // Your action here
 *   });
 *
 *   // Just haptic (no sound)
 *   const handlePress = async () => {
 *     await triggerHaptic();
 *     // Your action here
 *   };
 */

import * as Haptics from 'expo-haptics';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';

/**
 * Trigger haptic feedback
 * @param style - The haptic feedback intensity
 */
export async function triggerHaptic(style: HapticStyle = 'light'): Promise<void> {
  const styleMap: Record<HapticStyle, Haptics.ImpactFeedbackStyle> = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
    soft: Haptics.ImpactFeedbackStyle.Soft,
    rigid: Haptics.ImpactFeedbackStyle.Rigid,
  };

  await Haptics.impactAsync(styleMap[style]);
}

/**
 * Trigger selection feedback (for toggles, selections)
 */
export async function triggerSelectionFeedback(): Promise<void> {
  await Haptics.selectionAsync();
}

/**
 * Trigger notification feedback (for success/error/warning)
 */
export async function triggerNotificationFeedback(
  type: 'success' | 'warning' | 'error'
): Promise<void> {
  const typeMap: Record<string, Haptics.NotificationFeedbackType> = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  };

  await Haptics.notificationAsync(typeMap[type]);
}

/**
 * Create a handler with haptic + sound feedback
 *
 * This is the main utility for consistent tactile feedback.
 * Order: Haptic (immediate) → Sound (async) → Action
 *
 * @param playSound - Function to play sound (from sound hooks)
 * @param action - The action to perform after feedback
 * @param hapticStyle - The haptic intensity (default: 'light')
 * @returns An async function that triggers feedback then executes the action
 *
 * @example
 * const { playSound } = useClickSound();
 * const handlePress = withTactileFeedback(playSound, () => {
 *   navigation.navigate('Settings');
 * });
 */
export function withTactileFeedback(
  playSound: () => Promise<void> | void,
  action: () => void | Promise<void>,
  hapticStyle: HapticStyle = 'light'
): () => Promise<void> {
  return async () => {
    // 1. Haptic first (immediate tactile response)
    await triggerHaptic(hapticStyle);

    // 2. Sound (async, non-blocking)
    await playSound();

    // 3. Execute the action
    await action();
  };
}

/**
 * Create a handler with just haptic feedback (no sound)
 *
 * @param action - The action to perform after haptic
 * @param hapticStyle - The haptic intensity (default: 'light')
 */
export function withHapticFeedback(
  action: () => void | Promise<void>,
  hapticStyle: HapticStyle = 'light'
): () => Promise<void> {
  return async () => {
    await triggerHaptic(hapticStyle);
    await action();
  };
}
