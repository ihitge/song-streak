/**
 * MetronomeTapButton Component
 *
 * Large tap tempo button designed for instrument-in-hand use.
 * Features:
 * - Minimum 80pt touch target (per metronome skill)
 * - Visual press feedback
 * - Tap count display during active session
 * - Haptic feedback on tap
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TAP_BUTTON_SIZE } from '@/constants/MetronomeConfig';
import { Hand } from 'lucide-react-native';

interface MetronomeTapButtonProps {
  /** Tap handler */
  onTap: () => void;
  /** Number of taps in current session */
  tapCount: number;
  /** Whether the button is disabled */
  disabled?: boolean;
}

export const MetronomeTapButton = memo(function MetronomeTapButton({
  onTap,
  tapCount,
  disabled = false,
}: MetronomeTapButtonProps) {
  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>TAP TEMPO</Text>

      {/* Tap Button */}
      <Pressable
        onPress={onTap}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
        accessibilityLabel="Tap tempo"
        accessibilityRole="button"
        accessibilityHint="Tap repeatedly to set tempo"
      >
        <Hand
          size={28}
          color={Colors.softWhite}
          strokeWidth={1.5}
          style={styles.icon}
        />
        <Text style={styles.buttonText}>TAP</Text>
      </Pressable>

      {/* Tap Count Indicator */}
      <View style={styles.tapCountContainer}>
        {tapCount > 0 ? (
          <Text style={styles.tapCount}>
            {tapCount} tap{tapCount !== 1 ? 's' : ''}
          </Text>
        ) : (
          <Text style={styles.tapHint}>Tap to set tempo</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  button: {
    width: TAP_BUTTON_SIZE,
    height: TAP_BUTTON_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    // Raised button effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    // Subtle border for definition
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonPressed: {
    backgroundColor: Colors.graphiteDark,
    transform: [{ scale: 0.97 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'LexendDecaBold',
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  tapCountContainer: {
    height: 20,
    justifyContent: 'center',
  },
  tapCount: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
    letterSpacing: 1,
  },
  tapHint: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    letterSpacing: 0.5,
  },
});

export default MetronomeTapButton;
