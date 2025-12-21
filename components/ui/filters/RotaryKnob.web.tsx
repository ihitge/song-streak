import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, Keyframe } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useRotaryKnobSound } from '@/hooks/useRotaryKnobSound';
import type { RotaryKnobProps } from '@/types/filters';

const KNOB_SIZE = 44;
const READOUT_HEIGHT = 44;

// --- Glitch Animations ---
const EnterFromRight = new Keyframe({
  0: { transform: [{ translateX: 20 }], opacity: 0 },
  20: { transform: [{ translateX: 15 }], opacity: 0.5 },
  40: { transform: [{ translateX: 10 }], opacity: 0.1 },
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
  40: { transform: [{ translateX: -10 }], opacity: 0.1 },
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
  const [direction, setDirection] = useState(1);
  const { playSound } = useRotaryKnobSound();

  const handleLayout = (event: LayoutChangeEvent) => {
    setReadoutWidth(event.nativeEvent.layout.width);
  };

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const safeIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const rotation = useMemo(() => {
    const step = options.length > 1 ? 270 / (options.length - 1) : 0;
    return -135 + safeIndex * step;
  }, [safeIndex, options.length]);

  const animatedRotation = useSharedValue(rotation);

  useEffect(() => {
    animatedRotation.value = withTiming(rotation, {
      duration: 100,
      easing: Easing.out(Easing.quad)
    });
  }, [rotation, animatedRotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedRotation.value}deg` }],
  }));

  const cycle = async (dir: number) => {
    if (disabled) return;

    setDirection(dir);

    let nextIndex = selectedIndex + dir;
    if (nextIndex < 0) nextIndex = options.length - 1;
    if (nextIndex >= options.length) nextIndex = 0;

    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await playSound();
    onChange(options[nextIndex].value);
  };

  const currentOption = options[selectedIndex];

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {/* Digital Readout - CSS version */}
        <View style={[styles.readoutContainer, { backgroundColor: '#2a2a2a' }]} onLayout={handleLayout}>
          {/* Inset shadow effect (CSS) */}
          <View style={styles.insetShadow} />

          <Animated.View
            key={value}
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

          {/* Touch targets */}
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
  label: Typography.label,
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
  insetShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  readoutText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#e0e0e0',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.vermilion,
    paddingBottom: 2,
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
  readoutTextWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
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
