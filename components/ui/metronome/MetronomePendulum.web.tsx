/**
 * MetronomePendulum Component (Web Version)
 *
 * Simplified CSS-based version for web since Skia is not fully supported.
 * Uses standard React Native styles for the pendulum visualization.
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
      pendulumAngle.value = 0;
    } else if (isPlaying) {
      pendulumAngle.value = angle;
    } else {
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
      {/* CSS-based housing for web */}
      <View style={styles.housing}>
        {/* Scale markings */}
        <View style={styles.scaleMarksContainer}>
          <View style={styles.scaleMark} />
          <View style={[styles.scaleMark, styles.scaleMarkCenter]} />
          <View style={styles.scaleMark} />
        </View>
        {/* Pivot point */}
        <View style={styles.pivot}>
          <View style={styles.pivotInner} />
        </View>
      </View>

      {/* Pendulum arm and bob (animated) */}
      <Animated.View style={[styles.pendulumContainer, pendulumStyle]}>
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
  housing: {
    position: 'absolute',
    width: HOUSING_WIDTH,
    height: HOUSING_HEIGHT,
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 2px 6px rgba(0,0,0,0.8)',
  } as any,
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
  pivot: {
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
    transformOrigin: 'top center',
  } as any,
  pendulumArm: {
    width: ARM_WIDTH,
    height: PENDULUM_HEIGHT - PENDULUM_BOB_SIZE / 2,
    backgroundColor: Colors.graphite,
    borderRadius: ARM_WIDTH / 2,
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
  } as any,
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
