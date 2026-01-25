/**
 * PrimaryButton Component
 *
 * Universal action button for primary actions throughout the app.
 * Built with the most basic React Native components for maximum
 * cross-platform compatibility (especially iOS native builds).
 *
 * Design Principles:
 * - TouchableOpacity for reliable cross-platform behavior
 * - NO shadows, borders, or transforms initially
 * - Simple solid background colors
 * - Basic flexbox centering
 *
 * Usage:
 * - ADD SONG button on Songs page
 * - START/STOP button on Tuner page
 * - RECORD button on Idea Bank
 * - ENABLE MIC permission prompt
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface PrimaryButtonProps {
  /** Press handler */
  onPress: () => void;

  /** Button label text */
  label?: string;

  /** Icon to display (renders before label) */
  icon?: React.ReactNode;

  /** Color variant */
  variant?: 'primary' | 'secondary' | 'success';

  /** Size variant */
  size?: 'standard' | 'compact' | 'circle';

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - shows spinner */
  loading?: boolean;

  /** Accessibility label (required for screen readers) */
  accessibilityLabel: string;

  /** Accessibility hint */
  accessibilityHint?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  label,
  icon,
  variant = 'primary',
  size = 'standard',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Determine background color based on variant
  const backgroundColor =
    variant === 'primary'
      ? Colors.vermilion
      : variant === 'secondary'
        ? Colors.graphite
        : Colors.moss;

  // Build style array
  const buttonStyle = [
    styles.base,
    size === 'standard' && styles.standard,
    size === 'compact' && styles.compact,
    size === 'circle' && styles.circle,
    { backgroundColor },
    (disabled || loading) && styles.disabled,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={buttonStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityHint={accessibilityHint}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  standard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
  },
  compact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LexendDecaBold',
    letterSpacing: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default PrimaryButton;
