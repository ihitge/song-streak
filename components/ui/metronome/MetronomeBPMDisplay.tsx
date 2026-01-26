/**
 * MetronomeBPMDisplay Component
 *
 * Large digital BPM display with industrial aesthetic.
 * Features:
 * - Dark inset well with glass overlay
 * - Large, readable BPM number
 * - Animated text transition on BPM change
 * - Increment/decrement buttons
 */

import React, { useState, memo } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
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
  const [displayWidth, setDisplayWidth] = useState(200);

  const handleLayout = (event: LayoutChangeEvent) => {
    setDisplayWidth(event.nativeEvent.layout.width);
  };

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

        {/* BPM Display */}
        <View style={styles.displayContainer} onLayout={handleLayout}>
          {/* Background with inset shadow */}
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, displayWidth, DISPLAY_HEIGHT), 8, 8)}
              color={Colors.charcoal}
            >
              <BoxShadow dx={0} dy={3} blur={8} color="rgba(0,0,0,0.9)" inner />
              <BoxShadow dx={0} dy={-1} blur={2} color="rgba(255,255,255,0.1)" />
            </Box>
          </Canvas>

          {/* Glass overlay gradient */}
          <View style={styles.glassOverlay}>
            <Canvas style={StyleSheet.absoluteFill}>
              <Box box={rrect(rect(0, 0, displayWidth, DISPLAY_HEIGHT / 2), 0, 0)}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, DISPLAY_HEIGHT / 2)}
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                />
              </Box>
            </Canvas>
          </View>

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
    width: '50%',
    alignSelf: 'center',
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
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
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
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    pointerEvents: 'none',
  },
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
    textShadowColor: 'rgba(238, 108, 77, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  bpmUnit: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.graphite,
    letterSpacing: 2,
    marginTop: -2,
  },
});

export default MetronomeBPMDisplay;
