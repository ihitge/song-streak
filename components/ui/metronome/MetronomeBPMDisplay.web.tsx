/**
 * MetronomeBPMDisplay Component (Web Version)
 *
 * Simplified CSS-based version for web since Skia is not fully supported.
 * Uses standard React Native styles for the display visualization.
 */

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { METRONOME_CONFIG } from '@/constants/MetronomeConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Minus, Plus } from 'lucide-react-native';

const DISPLAY_HEIGHT = 60;
const BUTTON_SIZE = 32;

interface MetronomeBPMDisplayProps {
  /** Current BPM value */
  bpm: number;
  /** Callback when BPM changes */
  onBpmChange: (bpm: number) => void;
  /** Whether the control is disabled */
  disabled?: boolean;
}

export const MetronomeBPMDisplay = memo(function MetronomeBPMDisplay({
  bpm,
  onBpmChange,
  disabled = false,
}: MetronomeBPMDisplayProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleIncrement = async (delta: number) => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newBpm = Math.max(
      METRONOME_CONFIG.bpmMin,
      Math.min(METRONOME_CONFIG.bpmMax, bpm + delta)
    );
    onBpmChange(newBpm);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>TEMPO</Text>

      <View style={styles.row}>
        {/* Decrement Button */}
        <Pressable
          onPress={() => handleIncrement(-1)}
          onLongPress={() => handleIncrement(-10)}
          disabled={disabled || bpm <= METRONOME_CONFIG.bpmMin}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            (disabled || bpm <= METRONOME_CONFIG.bpmMin) && styles.buttonDisabled,
          ]}
          accessibilityLabel="Decrease tempo"
          accessibilityRole="button"
          accessibilityHint="Tap to decrease by 1, hold for 10"
        >
          <Minus size={16} color={Colors.softWhite} strokeWidth={2.5} />
        </Pressable>

        {/* BPM Display - CSS version */}
        <View style={styles.displayContainer}>
          {/* Glass overlay gradient */}
          <View style={styles.glassOverlay} />

          {/* BPM Value */}
          <View style={styles.valueContainer}>
            <Animated.Text
              key={bpm}
              entering={prefersReducedMotion ? undefined : FadeIn.duration(100)}
              exiting={prefersReducedMotion ? undefined : FadeOut.duration(50)}
              style={styles.bpmValue}
            >
              {bpm}
            </Animated.Text>
            <Text style={styles.bpmUnit}>BPM</Text>
          </View>
        </View>

        {/* Increment Button */}
        <Pressable
          onPress={() => handleIncrement(1)}
          onLongPress={() => handleIncrement(10)}
          disabled={disabled || bpm >= METRONOME_CONFIG.bpmMax}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            (disabled || bpm >= METRONOME_CONFIG.bpmMax) && styles.buttonDisabled,
          ]}
          accessibilityLabel="Increase tempo"
          accessibilityRole="button"
          accessibilityHint="Tap to increase by 1, hold for 10"
        >
          <Plus size={16} color={Colors.softWhite} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  } as any,
  buttonPressed: {
    backgroundColor: Colors.graphiteDark,
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  displayContainer: {
    flex: 1,
    height: DISPLAY_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.charcoal,
    boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.9), 0 -1px 2px rgba(255,255,255,0.1)',
  } as any,
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    // @ts-ignore - web only property
    pointerEvents: 'none',
  } as any,
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmValue: {
    fontSize: 28,
    fontFamily: 'LexendDecaBold',
    color: Colors.softWhite,
    letterSpacing: 1,
    textShadow: '0 0 6px rgba(238, 108, 77, 0.5)',
  } as any,
  bpmUnit: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.graphite,
    letterSpacing: 2,
    marginTop: -2,
  },
});

export default MetronomeBPMDisplay;
