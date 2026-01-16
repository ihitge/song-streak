/**
 * FAB (Floating Action Button) Component
 *
 * Shared circular action button used throughout the app:
 * - Add Song button on Songs page
 * - Start/Stop button on Tuner page
 *
 * Features:
 * - 72x72 size with white border ring (+ 12px hitSlop for 96x96 touch target)
 * - Primary (vermilion) and secondary (graphite) variants
 * - Built-in haptic feedback with press animation
 * - Accessibility labels and hints
 *
 * Follows Industrial Play aesthetic.
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface FABProps {
  /** Press handler */
  onPress: () => void;
  /** Icon to display inside the button */
  icon: React.ReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Color variant: primary (vermilion) or secondary (graphite) */
  variant?: 'primary' | 'secondary';
  /** Additional styles (e.g., positioning) */
  style?: ViewStyle;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  disabled = false,
  variant = 'primary',
  style,
  accessibilityLabel = 'Action button',
  accessibilityHint,
}) => {
  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        variant === 'secondary' && styles.fabSecondary,
        disabled && styles.fabDisabled,
        pressed && !disabled && styles.fabPressed,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.vermilion,
    justifyContent: 'center',
    alignItems: 'center',
    // Elevation/Shadow
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    // White ring effect
    borderWidth: 3,
    borderColor: Colors.rimHighlight,
  },
  fabSecondary: {
    backgroundColor: Colors.graphite,
  },
  fabDisabled: {
    opacity: 0.5,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
