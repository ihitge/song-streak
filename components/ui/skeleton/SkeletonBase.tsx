/**
 * SkeletonBase Component
 *
 * Core animated placeholder with shimmer effect for loading states.
 * Matches the "Industrial Play" aesthetic with subtle light sweep animation.
 *
 * Features:
 * - Respects useReducedMotion for accessibility
 * - Supports dark/light variants
 * - Smooth shimmer animation using Reanimated
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type SkeletonVariant = 'dark' | 'light';

interface SkeletonBaseProps {
  /**
   * Width of the skeleton (number for pixels or string for percentage)
   */
  width: number | `${number}%`;
  /**
   * Height of the skeleton in pixels
   */
  height: number;
  /**
   * Border radius (default: 4)
   */
  borderRadius?: number;
  /**
   * Variant for different backgrounds
   * - 'dark': For use inside DeviceCasing (ink background)
   * - 'light': For use on matteFog/softWhite backgrounds
   */
  variant?: SkeletonVariant;
  /**
   * Additional styles
   */
  style?: StyleProp<ViewStyle>;
}

// Animation constants
const SHIMMER_DURATION = 1500;

// Color configurations per variant
const variantColors = {
  dark: {
    base: Colors.charcoal,
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(255,255,255,0.08)',
    shimmerEnd: 'transparent',
  },
  light: {
    base: Colors.alloy,
    shimmerStart: 'transparent',
    shimmerMid: 'rgba(255,255,255,0.4)',
    shimmerEnd: 'transparent',
  },
};

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width,
  height,
  borderRadius = 4,
  variant = 'dark',
  style,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shimmerProgress = useSharedValue(0);

  const colors = variantColors[variant];

  useEffect(() => {
    if (prefersReducedMotion) {
      shimmerProgress.value = 0;
      return;
    }

    shimmerProgress.value = withRepeat(
      withTiming(1, {
        duration: SHIMMER_DURATION,
        easing: Easing.linear,
      }),
      -1, // Infinite repeats
      false // Don't reverse
    );
  }, [prefersReducedMotion, shimmerProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: colors.base,
    overflow: 'hidden',
  };

  // Static skeleton for reduced motion
  if (prefersReducedMotion) {
    return (
      <View
        style={[containerStyle, style]}
        accessibilityLabel="Loading"
        accessibilityRole="progressbar"
      />
    );
  }

  return (
    <View
      style={[containerStyle, style]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
        <LinearGradient
          colors={[colors.shimmerStart, colors.shimmerMid, colors.shimmerEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '200%',
  },
  shimmerGradient: {
    flex: 1,
    width: '50%',
  },
});

export default SkeletonBase;
