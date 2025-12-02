import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import type { RotaryKnobProps } from '@/types/filters';

const KNOB_SIZE = 48;
const READOUT_HEIGHT = 48; // Match FrequencyTuner height

export const RotaryKnob = <T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  size = KNOB_SIZE,
  showNotches = true,
  hapticFeedback = true,
}: RotaryKnobProps<T>) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const rotation = useMemo(() => {
    // Calculate rotation: spread options across 270 degrees (-135 to +135)
    const step = 270 / (options.length - 1 || 1);
    return -135 + selectedIndex * step;
  }, [selectedIndex, options.length]);

  const animatedRotation = useSharedValue(rotation);

  // Update animated rotation when value changes
  React.useEffect(() => {
    animatedRotation.value = withSpring(rotation, { damping: 15, stiffness: 150 });
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedRotation.value}deg` }],
  }));

  const cycle = (direction: number) => {
    if (disabled) return;

    let nextIndex = selectedIndex + direction;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onChange(options[nextIndex].value);
  };

  const currentOption = options[selectedIndex];

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {/* Digital Readout */}
        <View style={styles.readoutContainer}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, 100, READOUT_HEIGHT), 8, 8)}
              color={Colors.alloy}
            >
              <BoxShadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.15)" inner />
              <BoxShadow dx={-1} dy={-1} blur={3} color="rgba(255,255,255,0.5)" inner />
            </Box>
          </Canvas>
          <Text style={styles.readoutText} numberOfLines={1}>
            {currentOption?.label || value}
          </Text>
        </View>

        {/* Physical Knob */}
        <View style={[styles.knobContainer, { width: size, height: size }]}>
          {/* Knob shadow/glow */}
          <View style={styles.knobShadow} />

          {/* Rotating knob */}
          <Animated.View style={[styles.knobBody, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}>
            {/* Black knob background */}
            <View style={[styles.knobFace, { width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }]} />

            {/* Orange position indicator dot */}
            <View style={styles.indicatorDot} />
          </Animated.View>

          {/* Touch targets - left decreases, right increases */}
          <Pressable
            style={styles.touchTargetLeft}
            onPress={() => cycle(-1)}
            disabled={disabled}
          />
          <Pressable
            style={styles.touchTargetRight}
            onPress={() => cycle(1)}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.graphite,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: READOUT_HEIGHT,
  },
  readoutContainer: {
    flex: 1,
    height: READOUT_HEIGHT,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  readoutText: {
    fontSize: 8,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.charcoal,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  knobContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobShadow: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    transform: [{ translateY: 2 }],
  },
  knobBody: {
    borderRadius: KNOB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knobFace: {
    backgroundColor: Colors.charcoal,
    position: 'absolute',
  },
  indicatorDot: {
    position: 'absolute',
    top: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.vermilion,
  },
  touchTargetLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 10,
  },
  touchTargetRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
    height: '100%',
    zIndex: 10,
  },
});
