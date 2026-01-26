/**
 * MetronomePendulum Component
 *
 * Analog pendulum visualization providing predictive visual cue for musicians.
 * The swinging motion helps the brain anticipate the beat before it sounds.
 *
 * Features:
 * - Smooth sinusoidal swing animation
 * - Beat indicator flash on downbeat
 * - Respects reduced motion preference
 * - Industrial metal aesthetic
 *
 * Note: Uses simplified CSS-based rendering on web (Skia not fully supported)
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { PENDULUM_MAX_ANGLE, PENDULUM_HEIGHT, PENDULUM_BOB_SIZE, BEAT_FLASH_DURATION_MS } from '@/constants/MetronomeConfig';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Conditionally import Skia (not fully supported on web)
let Canvas: any;
let Box: any;
let BoxShadow: any;
let rrect: any;
let rect: any;
let Circle: any;
let LinearGradient: any;
let vec: any;
let Line: any;
let skiaAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const skia = require('@shopify/react-native-skia');
    Canvas = skia.Canvas;
    Box = skia.Box;
    BoxShadow = skia.BoxShadow;
    rrect = skia.rrect;
    rect = skia.rect;
    Circle = skia.Circle;
    LinearGradient = skia.LinearGradient;
    vec = skia.vec;
    Line = skia.Line;
    skiaAvailable = true;
  } catch (e) {
    console.warn('[MetronomePendulum] Skia not available');
  }
}

// Housing dimensions
const HOUSING_WIDTH = 160;
const HOUSING_HEIGHT = 200;
const HOUSING_PADDING = 20;

// Pendulum dimensions
const PIVOT_SIZE = 16;
const ARM_WIDTH = 6;

interface MetronomePendulumProps {
  /** Current pendulum angle in degrees (-30 to +30) */
  angle: number;
  /** Whether metronome is playing */
  isPlaying: boolean;
  /** Current beat index (0-3) */
  currentBeat: number;
  /** Current BPM for reference */
  bpm: number;
}

export const MetronomePendulum = memo(function MetronomePendulum({
  angle,
  isPlaying,
  currentBeat,
  bpm,
}: MetronomePendulumProps) {
  const prefersReducedMotion = useReducedMotion();

  // Animated values
  const pendulumAngle = useSharedValue(0);
  const beatFlash = useSharedValue(0);

  // Update pendulum angle with smooth animation
  useEffect(() => {
    if (prefersReducedMotion) {
      // No animation - just show static indicator
      pendulumAngle.value = 0;
    } else if (isPlaying) {
      pendulumAngle.value = angle;
    } else {
      // Return to center when stopped
      pendulumAngle.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [angle, isPlaying, pendulumAngle, prefersReducedMotion]);

  // Flash on beat (especially downbeat)
  useEffect(() => {
    if (isPlaying && currentBeat === 0) {
      beatFlash.value = 1;
      beatFlash.value = withTiming(0, {
        duration: BEAT_FLASH_DURATION_MS,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [currentBeat, isPlaying, beatFlash]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      cancelAnimation(pendulumAngle);
      cancelAnimation(beatFlash);
    };
  }, [pendulumAngle, beatFlash]);

  // Animated pendulum style
  const pendulumStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${pendulumAngle.value}deg` }],
  }));

  // Animated flash style for beat indicator
  const flashStyle = useAnimatedStyle(() => ({
    opacity: beatFlash.value,
  }));

  return (
    <View style={styles.container}>
      {/* Housing background with depth - Skia for native, CSS for web */}
      {skiaAvailable && Platform.OS !== 'web' ? (
        <Canvas style={styles.housingCanvas}>
          {/* Outer housing with shadow */}
          <Box
            box={rrect(rect(0, 0, HOUSING_WIDTH, HOUSING_HEIGHT), 12, 12)}
            color={Colors.charcoal}
          >
            <BoxShadow dx={0} dy={4} blur={12} color="rgba(0,0,0,0.5)" />
            <BoxShadow dx={0} dy={2} blur={6} color="rgba(0,0,0,0.8)" inner />
          </Box>

          {/* Glass overlay gradient */}
          <Box box={rrect(rect(0, 0, HOUSING_WIDTH, HOUSING_HEIGHT / 3), 12, 12)}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, HOUSING_HEIGHT / 3)}
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
            />
          </Box>

          {/* Scale markings - simplified tick marks */}
          <Line
            p1={vec(HOUSING_WIDTH / 2 - 40, HOUSING_HEIGHT - 30)}
            p2={vec(HOUSING_WIDTH / 2 - 40, HOUSING_HEIGHT - 20)}
            color="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
          <Line
            p1={vec(HOUSING_WIDTH / 2, HOUSING_HEIGHT - 30)}
            p2={vec(HOUSING_WIDTH / 2, HOUSING_HEIGHT - 15)}
            color={Colors.vermilion}
            strokeWidth={2}
          />
          <Line
            p1={vec(HOUSING_WIDTH / 2 + 40, HOUSING_HEIGHT - 30)}
            p2={vec(HOUSING_WIDTH / 2 + 40, HOUSING_HEIGHT - 20)}
            color="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />

          {/* Pivot point */}
          <Circle
            cx={HOUSING_WIDTH / 2}
            cy={HOUSING_PADDING}
            r={PIVOT_SIZE / 2}
            color={Colors.graphite}
          >
            <BoxShadow dx={0} dy={1} blur={2} color="rgba(0,0,0,0.5)" />
          </Circle>
          <Circle
            cx={HOUSING_WIDTH / 2}
            cy={HOUSING_PADDING}
            r={PIVOT_SIZE / 4}
            color={Colors.charcoal}
          />
        </Canvas>
      ) : (
        /* Web fallback - CSS-based housing */
        <View style={styles.housingWeb}>
          {/* Scale markings */}
          <View style={styles.scaleMarksContainer}>
            <View style={styles.scaleMark} />
            <View style={[styles.scaleMark, styles.scaleMarkCenter]} />
            <View style={styles.scaleMark} />
          </View>
          {/* Pivot point */}
          <View style={styles.pivotWeb}>
            <View style={styles.pivotInner} />
          </View>
        </View>
      )}

      {/* Pendulum arm and bob (animated) */}
      <Animated.View
        style={[
          styles.pendulumContainer,
          pendulumStyle,
        ]}
      >
        <View style={styles.pendulumArm} />
        <View style={[styles.pendulumBob, isPlaying && currentBeat === 0 && styles.pendulumBobActive]} />
      </Animated.View>

      {/* Beat flash overlay */}
      <Animated.View style={[styles.beatFlash, flashStyle]} pointerEvents="none" />

      {/* Beat indicators (4 dots for 4/4 time) */}
      <View style={styles.beatIndicators}>
        {[0, 1, 2, 3].map((beat) => (
          <View
            key={beat}
            style={[
              styles.beatDot,
              isPlaying && currentBeat === beat && styles.beatDotActive,
              beat === 0 && styles.beatDotAccent,
            ]}
          />
        ))}
      </View>

      {/* Reduced motion indicator */}
      {prefersReducedMotion && isPlaying && (
        <View style={styles.reducedMotionIndicator}>
          <View
            style={[
              styles.staticBeatIndicator,
              currentBeat === 0 && styles.staticBeatIndicatorActive,
            ]}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: HOUSING_WIDTH,
    height: HOUSING_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  housingCanvas: {
    position: 'absolute',
    width: HOUSING_WIDTH,
    height: HOUSING_HEIGHT,
  },
  // Web fallback styles
  housingWeb: {
    position: 'absolute',
    width: HOUSING_WIDTH,
    height: HOUSING_HEIGHT,
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  scaleMarksContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  scaleMark: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scaleMarkCenter: {
    width: 2,
    height: 15,
    backgroundColor: Colors.vermilion,
  },
  pivotWeb: {
    position: 'absolute',
    top: HOUSING_PADDING - PIVOT_SIZE / 2,
    left: HOUSING_WIDTH / 2 - PIVOT_SIZE / 2,
    width: PIVOT_SIZE,
    height: PIVOT_SIZE,
    borderRadius: PIVOT_SIZE / 2,
    backgroundColor: Colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pivotInner: {
    width: PIVOT_SIZE / 2,
    height: PIVOT_SIZE / 2,
    borderRadius: PIVOT_SIZE / 4,
    backgroundColor: Colors.charcoal,
  },
  pendulumContainer: {
    position: 'absolute',
    top: HOUSING_PADDING,
    left: HOUSING_WIDTH / 2 - ARM_WIDTH / 2,
    width: ARM_WIDTH,
    height: PENDULUM_HEIGHT,
    alignItems: 'center',
    // Transform origin at top center (pivot point)
    transformOrigin: 'top center',
  },
  pendulumArm: {
    width: ARM_WIDTH,
    height: PENDULUM_HEIGHT - PENDULUM_BOB_SIZE / 2,
    backgroundColor: Colors.graphite,
    borderRadius: ARM_WIDTH / 2,
    // Metallic gradient effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pendulumBob: {
    position: 'absolute',
    bottom: 0,
    width: PENDULUM_BOB_SIZE,
    height: PENDULUM_BOB_SIZE,
    borderRadius: PENDULUM_BOB_SIZE / 2,
    backgroundColor: Colors.charcoal,
    borderWidth: 3,
    borderColor: Colors.graphite,
    // Slight shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pendulumBobActive: {
    borderColor: Colors.vermilion,
    backgroundColor: Colors.vermilionDark,
  },
  beatFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.vermilion,
    borderRadius: 12,
    opacity: 0,
  },
  beatIndicators: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  beatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.graphiteDark,
  },
  beatDotActive: {
    backgroundColor: Colors.vermilion,
    // Glow effect
    ...Platform.select({
      ios: {
        shadowColor: Colors.vermilion,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
    }),
  },
  beatDotAccent: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reducedMotionIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
  },
  staticBeatIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.graphite,
  },
  staticBeatIndicatorActive: {
    backgroundColor: Colors.vermilion,
  },
});

export default MetronomePendulum;
