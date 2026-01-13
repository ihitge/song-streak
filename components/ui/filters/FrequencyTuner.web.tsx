import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import type { FrequencyTunerProps } from '@/types/filters';

type TunerVariant = 'dark' | 'light';

const TUNER_HEIGHT = 44;

export const FrequencyTuner = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  showValueLabel = true,
  size = 'standard',
  variant = 'dark',
  showGlassOverlay = false,
  labelColor,
  height: customHeight,
}: FrequencyTunerProps<T> & { variant?: TunerVariant; showGlassOverlay?: boolean; labelColor?: string }) => {
  const [width, setWidth] = useState(200);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const currentOption = options[selectedIndex];
  const height = customHeight ?? (size === 'compact' ? 40 : TUNER_HEIGHT);

  // Variant-specific colors
  const isDark = variant === 'dark';
  const backgroundColor = isDark ? Colors.charcoal : Colors.softWhite;
  const scaleMarkingColor = isDark ? 'rgba(255,255,255,0.2)' : Colors.charcoal;
  const textColor = isDark ? '#e0e0e0' : Colors.charcoal;
  const chevronColor = isDark ? Colors.graphite : Colors.charcoal;
  const innerRingColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const cycle = async (dir: number) => {
    if (disabled) return;

    let nextIndex = selectedIndex + dir;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(options[nextIndex].value);
  };

  // Generate scale markings for web (CSS-based)
  const scaleMarkings = [...Array(10)].map((_, i) => {
    const spacing = (width - 40) / 9;
    return (
      <View
        key={i}
        style={[
          styles.scaleMark,
          {
            left: 20 + i * spacing,
            backgroundColor: scaleMarkingColor,
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.label, labelColor && { color: labelColor }]}>{label}</Text>

      {/* Tuner Window */}
      <View style={[
        styles.tunerWindow,
        { height, backgroundColor },
        // @ts-ignore - web-specific CSS for radial gradient with darker corners
        isDark && { backgroundImage: 'radial-gradient(circle, #333333 0%, #2a2a2a 100%)' }
      ]} onLayout={handleLayout}>
        {/* Inset shadow effect (CSS) */}
        <View style={[styles.insetShadow, isDark ? styles.insetShadowDark : styles.insetShadowLight]} />

        {/* Scale markings */}
        {scaleMarkings}

        {/* Orange hairline indicator - centered */}
        <View style={[styles.hairlineIndicator, { left: width / 2 - 0.75, height: height - 8 }]} />

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Left chevron */}
          <Pressable
            onPress={() => cycle(-1)}
            style={styles.chevronButton}
            disabled={disabled}
          >
            <ChevronLeft size={14} color={chevronColor} />
          </Pressable>

          {/* Value display */}
          <View style={styles.valueContainer}>
            <Text style={[styles.valueText, { color: textColor }]}>
              {currentOption?.label || value}
            </Text>
          </View>

          {/* Right chevron */}
          <Pressable
            onPress={() => cycle(1)}
            style={styles.chevronButton}
            disabled={disabled}
          >
            <ChevronRight size={14} color={chevronColor} />
          </Pressable>
        </View>

        {/* Inner ring/border effect */}
        <View style={[styles.innerRing, { borderColor: innerRingColor }]} pointerEvents="none" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: '100%',
  },
  label: {
    ...Typography.label,
    textAlign: 'left',
  },
  tunerWindow: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  insetShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  insetShadowDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  insetShadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  scaleMark: {
    position: 'absolute',
    bottom: 4,
    width: 1,
    height: 4,
  },
  hairlineIndicator: {
    position: 'absolute',
    top: 4,
    width: 1.5,
    backgroundColor: Colors.vermilion,
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
  valueText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#e0e0e0',
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
});
