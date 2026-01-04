/**
 * SpeedSelector Web Component
 *
 * CSS-based fallback for the speed selector on web.
 * Matches FrequencyTuner light variant styling with vermilion label.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { EnterFromRight, ExitToLeft, EnterFromLeft, ExitToRight } from '@/constants/Animations';
import { useClickSound } from '@/hooks/useClickSound';
import { PlaybackSpeed } from '@/types/voiceMemo';

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
        {/* Background with inset shadows (CSS version) */}
        <View style={styles.windowBackground}>
          {/* Scale markings */}
          <View style={styles.scaleMarks}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.scaleMark} />
            ))}
          </View>

          {/* Center indicator line */}
          <View style={styles.centerIndicator} />
        </View>

        {/* Glass overlay gradient (CSS version) */}
        <View style={styles.glassOverlay} />

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
            <ChevronLeft size={compact ? 12 : 14} color={Colors.charcoal} />
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
            <ChevronRight size={compact ? 12 : 14} color={Colors.charcoal} />
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
  // Label - Vermilion color (matches FrequencyTuner)
  label: {
    ...Typography.label,
    color: Colors.vermilion,
  },
  labelCompact: {
    fontSize: 8,
  },
  selectorWindow: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 180,
  },
  // Light variant background
  windowBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.softWhite,
    borderRadius: 6,
    // Inset shadow simulation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    // Top highlight
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,1)',
  },
  scaleMarks: {
    position: 'absolute',
    bottom: 4,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleMark: {
    width: 1,
    height: 4,
    backgroundColor: Colors.charcoal,
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    top: 4,
    bottom: 4,
    width: 1.5,
    marginLeft: -0.75,
    backgroundColor: Colors.vermilion,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    // CSS gradient fallback - light variant
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
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
  // Text colors - Dark for light variant
  valueText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.charcoal,
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
    borderColor: 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  },
});

export default SpeedSelector;
