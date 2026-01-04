/**
 * FAB (Floating Action Button) Component
 *
 * Shared circular action button used throughout the app:
 * - Add Song button on Songs page
 * - Start/Stop button on Tuner page
 *
 * Features:
 * - Consistent 64x64 size with white border ring
 * - Primary (vermilion) and secondary (graphite) variants
 * - Built-in haptic and audio feedback
 *
 * Follows Industrial Play aesthetic.
 */

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useFABSound } from '@/hooks/useFABSound';

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
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  disabled = false,
  variant = 'primary',
  style,
}) => {
  const { playSound } = useFABSound();

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onPress();
  };

  return (
    <Pressable
      style={[
        styles.fab,
        variant === 'secondary' && styles.fabSecondary,
        disabled && styles.fabDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    borderWidth: 2,
    borderColor: '#fff',
  },
  fabSecondary: {
    backgroundColor: Colors.graphite,
  },
  fabDisabled: {
    opacity: 0.5,
  },
});
