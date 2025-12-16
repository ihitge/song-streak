import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, Keyframe } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useRotaryKnobSound } from '@/hooks/useRotaryKnobSound';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay, SurfaceTextureOverlay } from '@/components/skia/primitives';
import type { RotaryKnobProps } from '@/types/filters';

const KNOB_SIZE = 44; // Increased from 38px
const READOUT_HEIGHT = 44; // Increased from 38px

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
  showGlassOverlay = false,
}: RotaryKnobProps<T> & { showGlassOverlay?: boolean }) => {
  const [readoutWidth, setReadoutWidth] = useState(100);
  const [direction, setDirection] = useState(1); // 1 = Next (Slide Left), -1 = Prev (Slide Right)
  const { playSound } = useRotaryKnobSound();

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

  const cycle = async (dir: number) => { // Renamed from 'direction' to 'dir' to avoid conflict with state
    if (disabled) return;

    setDirection(dir); // Set direction before calling onChange

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
        {/* Digital Readout */}
        <View style={styles.readoutContainer} onLayout={handleLayout}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Box
              box={rrect(rect(0, 0, readoutWidth, READOUT_HEIGHT), 6, 6)}
              color="#2a2a2a"
            >
              <BoxShadow dx={0} dy={2} blur={6} color="rgba(0,0,0,0.9)" inner />
              <BoxShadow dx={0} dy={-1} blur={2} color="rgba(255,255,255,0.1)" />
            </Box>
          </Canvas>

          {/* Glass overlay gradient */}
          <View style={styles.glassOverlay}>
            <Canvas style={StyleSheet.absoluteFill}>
              <Box box={rrect(rect(0, 0, readoutWidth, READOUT_HEIGHT / 2), 0, 0)}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, READOUT_HEIGHT / 2)}
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                />
              </Box>
            </Canvas>
          </View>

          {/* Enhanced overlays for realism */}
          {showGlassOverlay && (
            <>
              {/* Layer 1: Inset shadow for recessed depth */}
              <InsetShadowOverlay
                width={readoutWidth}
                height={READOUT_HEIGHT}
                borderRadius={6}
                insetDepth={6}
                shadowIntensity={0.9}
                variant="dark"
              />
              {/* Layer 2: Glass overlay */}
              <GlassOverlay
                width={readoutWidth}
                height={READOUT_HEIGHT}
                borderRadius={6}
                glareOpacity={0.2}
                specularOpacity={0.3}
                variant="dark"
              />
              {/* Layer 3: Surface texture for dust/scratches */}
              <SurfaceTextureOverlay
                width={readoutWidth}
                height={READOUT_HEIGHT}
                borderRadius={6}
                textureOpacity={0.03}
                variant="dark"
              />
            </>
          )}

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
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    pointerEvents: 'none',
  },
  readoutText: {
    fontSize: 10,
    fontFamily: 'LexendDecaBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#e0e0e0',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
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
    top: 6, // Adjusted from 4
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
