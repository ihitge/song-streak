import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec, Line, Fill } from '@shopify/react-native-skia';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import type { FrequencyTunerProps } from '@/types/filters';

const TUNER_HEIGHT = 48;

export const FrequencyTuner = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  showValueLabel = true,
  size = 'standard',
}: FrequencyTunerProps<T>) => {
  const [width, setWidth] = useState(200); // default fallback
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const currentOption = options[selectedIndex];
  const height = size === 'compact' ? 40 : TUNER_HEIGHT;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const cycle = (direction: number) => {
    if (disabled) return;

    let nextIndex = selectedIndex + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(options[nextIndex].value);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Tuner Window */}
      <View style={[styles.tunerWindow, { height }]} onLayout={handleLayout}>
        {/* Dark background with inset shadows */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Box
            box={rrect(rect(0, 0, width, height), 6, 6)}
            color="#2a2a2a"
          >
            <BoxShadow dx={0} dy={2} blur={6} color="rgba(0,0,0,0.9)" inner />
            <BoxShadow dx={0} dy={-1} blur={2} color="rgba(255,255,255,0.1)" />
          </Box>

          {/* Scale markings at bottom */}
          {[...Array(10)].map((_, i) => {
            const spacing = (width - 40) / 9;
            return (
              <Line
                key={i}
                p1={vec(20 + i * spacing, height - 8)}
                p2={vec(20 + i * spacing, height - 4)}
                color="rgba(255,255,255,0.2)"
                strokeWidth={1}
              />
            );
          })}

          {/* Orange hairline indicator - centered */}
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

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Left chevron */}
          <Pressable
            onPress={() => cycle(-1)}
            style={styles.chevronButton}
            disabled={disabled}
          >
            <ChevronLeft size={14} color={Colors.graphite} />
          </Pressable>

          {/* Value display */}
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {currentOption?.label || value}
            </Text>
          </View>

          {/* Right chevron */}
          <Pressable
            onPress={() => cycle(1)}
            style={styles.chevronButton}
            disabled={disabled}
          >
            <ChevronRight size={14} color={Colors.graphite} />
          </Pressable>
        </View>

        {/* Inner ring/border effect */}
        <View style={styles.innerRing} pointerEvents="none" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.graphite,
  },
  tunerWindow: {
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
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
    paddingHorizontal: 4,
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
    fontSize: 8,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#e0e0e0',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  },
});
