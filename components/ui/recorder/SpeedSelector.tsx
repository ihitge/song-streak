/**
 * SpeedSelector Component
 *
 * Playback speed selector for the voice recorder.
 * Matches the FrequencyTuner style with SLOW/NORMAL/FAST options.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec, Line } from '@shopify/react-native-skia';
import Animated from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { EnterFromRight, ExitToLeft, EnterFromLeft, ExitToRight } from '@/constants/Animations';
import { useClickSound } from '@/hooks/useClickSound';
import { PlaybackSpeed, PLAYBACK_SPEED_MULTIPLIERS } from '@/types/voiceMemo';

interface SpeedSelectorProps {
  /** Current speed value */
  value: PlaybackSpeed;
  /** Called when speed changes */
  onChange: (speed: PlaybackSpeed) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Custom label */
  label?: string;
}

// Speed options with display labels
const SPEED_OPTIONS: { value: PlaybackSpeed; label: string; multiplier: string }[] = [
  { value: 'slow', label: 'SLOW', multiplier: '0.75x' },
  { value: 'normal', label: 'NORMAL', multiplier: '1x' },
  { value: 'fast', label: 'FAST', multiplier: '1.5x' },
];

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  compact = false,
  label = 'SPEED',
}) => {
  const [width, setWidth] = useState(160);
  const [direction, setDirection] = useState(1);
  const { playSound } = useClickSound();

  const selectedIndex = SPEED_OPTIONS.findIndex((opt) => opt.value === value);
  const currentOption = SPEED_OPTIONS[selectedIndex] || SPEED_OPTIONS[1];
  const height = compact ? 36 : 44;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const cycle = async (dir: number) => {
    if (disabled) return;

    setDirection(dir);

    let nextIndex = selectedIndex + dir;
    if (nextIndex < 0) nextIndex = SPEED_OPTIONS.length - 1;
    if (nextIndex >= SPEED_OPTIONS.length) nextIndex = 0;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onChange(SPEED_OPTIONS[nextIndex].value);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Label */}
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>

      {/* Selector window */}
      <View
        style={[styles.selectorWindow, { height }]}
        onLayout={handleLayout}
      >
        {/* Background with inset shadows */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Box
            box={rrect(rect(0, 0, width, height), 6, 6)}
            color={Colors.deepSpaceBlue}
          >
            <BoxShadow dx={0} dy={2} blur={6} color="rgba(0,0,0,0.9)" inner />
            <BoxShadow dx={0} dy={-1} blur={2} color="rgba(255,255,255,0.1)" />
          </Box>

          {/* Scale markings */}
          {[0, 1, 2].map((i) => {
            const x = 20 + (i * (width - 40)) / 2;
            return (
              <Line
                key={i}
                p1={vec(x, height - 8)}
                p2={vec(x, height - 4)}
                color="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
            );
          })}

          {/* Center indicator line */}
          <Line
            p1={vec(width / 2, 4)}
            p2={vec(width / 2, height - 4)}
            color={Colors.vermilion}
            strokeWidth={1.5}
          />
        </Canvas>

        {/* Glass overlay gradient */}
        <View style={styles.glassOverlay}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box box={rrect(rect(0, 0, width, height / 2), 0, 0)}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, height / 2)}
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
              />
            </Box>
          </Canvas>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => cycle(-1)}
            style={styles.chevronButton}
            disabled={disabled}
            accessibilityLabel="Slower playback speed"
            accessibilityRole="button"
            accessibilityHint="Decrease playback speed"
          >
            <ChevronLeft size={compact ? 12 : 14} color={Colors.graphite} />
          </Pressable>

          <View style={styles.valueContainer}>
            <Animated.View
              key={value}
              entering={direction > 0 ? EnterFromRight : EnterFromLeft}
              exiting={direction > 0 ? ExitToLeft : ExitToRight}
              style={styles.textWrapper}
            >
              <Text style={[styles.valueText, compact && styles.valueTextCompact]}>
                {currentOption.label}
              </Text>
              <Text style={[styles.multiplierText, compact && styles.multiplierTextCompact]}>
                {currentOption.multiplier}
              </Text>
            </Animated.View>
          </View>

          <Pressable
            onPress={() => cycle(1)}
            style={styles.chevronButton}
            disabled={disabled}
            accessibilityLabel="Faster playback speed"
            accessibilityRole="button"
            accessibilityHint="Increase playback speed"
          >
            <ChevronRight size={compact ? 12 : 14} color={Colors.graphite} />
          </Pressable>
        </View>

        {/* Inner ring */}
        <View style={styles.innerRing} pointerEvents="none" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  containerCompact: {
    gap: 2,
  },
  label: {
    ...Typography.label,
    color: Colors.warmGray,
  },
  labelCompact: {
    fontSize: 8,
  },
  selectorWindow: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 120,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    pointerEvents: 'none',
  },
  controlsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  chevronButton: {
    padding: 4,
    opacity: 0.6,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#e0e0e0',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  valueTextCompact: {
    fontSize: 9,
  },
  multiplierText: {
    fontSize: 8,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    marginTop: -2,
  },
  multiplierTextCompact: {
    fontSize: 7,
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
});

export default SpeedSelector;
