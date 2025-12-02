import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, Keyframe } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import type { RotaryKnobProps } from '@/types/filters';

const KNOB_SIZE = 38;
const READOUT_HEIGHT = 38; // Match FrequencyTuner height

// --- Glitch Animations (Adapted from FrequencyTuner) ---

const EnterFromRight = new Keyframe({
  0: { transform: [{ translateX: 20 }], opacity: 0 },
  20: { transform: [{ translateX: 15 }], opacity: 0.5 },
  40: { transform: [{ translateX: 10 }], opacity: 0.1 }, // flicker
  60: { transform: [{ translateX: 5 }], opacity: 0.9 },
  80: { transform: [{ translateX: 2 }], opacity: 0.4 },
  100: { transform: [{ translateX: 0 }], opacity: 1 },
}).duration(250);

const ExitToLeft = new Keyframe({
  0: { transform: [{ translateX: 0 }], opacity: 1 },
  40: { transform: [{ translateX: -10 }], opacity: 0.5 },
  100: { transform: [{ translateX: -20 }], opacity: 0 },
}).duration(200);

const EnterFromLeft = new Keyframe({
  0: { transform: [{ translateX: -20 }], opacity: 0 },
  20: { transform: [{ translateX: -15 }], opacity: 0.5 },
  40: { transform: [{ translateX: -10 }], opacity: 0.1 }, // flicker
  60: { transform: [{ translateX: -5 }], opacity: 0.9 },
  80: { transform: [{ translateX: -2 }], opacity: 0.4 },
  100: { transform: [{ translateX: 0 }], opacity: 1 },
}).duration(250);

const ExitToRight = new Keyframe({
  0: { transform: [{ translateX: 0 }], opacity: 1 },
  40: { transform: [{ translateX: 10 }], opacity: 0.5 },
  100: { transform: [{ translateX: 20 }], opacity: 0 },
}).duration(200);


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
  const [readoutWidth, setReadoutWidth] = useState(100);
  const [direction, setDirection] = useState(1); // 1 = Next (Slide Left), -1 = Prev (Slide Right)


  const handleLayout = (event: LayoutChangeEvent) => {
    setReadoutWidth(event.nativeEvent.layout.width);
  };

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const safeIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const rotation = useMemo(() => {
    // Calculate rotation: spread options across 270 degrees (-135 to +135)
    // Each option gets a fixed position like clock positions
    const step = options.length > 1 ? 270 / (options.length - 1) : 0;
    return -135 + safeIndex * step;
  }, [safeIndex, options.length]);

  const animatedRotation = useSharedValue(rotation);

  // Update animated rotation when value changes - snap animation
  useEffect(() => {
    animatedRotation.value = withTiming(rotation, {
      duration: 100,
      easing: Easing.out(Easing.quad)
    });
  }, [rotation, animatedRotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedRotation.value}deg` }],
  }));

  const cycle = (dir: number) => { // Renamed from 'direction' to 'dir' to avoid conflict with state
    if (disabled) return;

    setDirection(dir); // Set direction before calling onChange

    let nextIndex = selectedIndex + dir;
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
        <View style={styles.readoutContainer} onLayout={handleLayout}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, readoutWidth, READOUT_HEIGHT), 6, 6)}
              color={Colors.alloy}
            >
              <BoxShadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.15)" inner />
              <BoxShadow dx={-1} dy={-1} blur={3} color="rgba(255,255,255,0.5)" inner />
            </Box>
          </Canvas>
          <Animated.View
                key={value} // Trigger animation on value change
                entering={direction > 0 ? EnterFromRight : EnterFromLeft}
                exiting={direction > 0 ? ExitToLeft : ExitToRight}
                style={styles.readoutTextWrapper}
            >
                <Text style={styles.readoutText} numberOfLines={1}>
                    {currentOption?.label || value}
                </Text>
            </Animated.View>
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
    gap: 6,
    width: '100%',
  },
  label: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: Colors.warmGray,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: READOUT_HEIGHT,
    width: '100%',
  },
  readoutContainer: {
    flex: 1,
    height: READOUT_HEIGHT,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  readoutText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.charcoal,
    textAlign: 'center',
    // Underline
    borderBottomWidth: 2,
    borderBottomColor: Colors.vermilion,
    paddingBottom: 2, // Add a little space between text and underline
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
    top: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.vermilion,
  },
  readoutTextWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8, // Keep padding from original Text style
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
