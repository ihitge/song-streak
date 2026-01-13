import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Group,
  Path,
  Skia,
  LinearGradient,
  RadialGradient,
  BlurMask,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { FlameLevel, FLAME_COLORS, getFlameLevel } from '@/types/streak';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StreakFlameProps {
  streakDays: number;
  size?: number;
  animated?: boolean;
}

/**
 * Animated flame visualization based on streak length
 * Uses Skia for native rendering with glow effects
 */
export const StreakFlame: React.FC<StreakFlameProps> = ({
  streakDays,
  size = 80,
  animated = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const level = getFlameLevel(streakDays);
  const colors = FLAME_COLORS[level];

  // Animation values using Reanimated
  const scale = useSharedValue(1);

  // Respect reduced motion preference
  const shouldAnimate = animated && !prefersReducedMotion;

  useEffect(() => {
    if (shouldAnimate && streakDays > 0) {
      // Scale pulse animation
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse
      );
    } else {
      scale.value = 1;
    }
  }, [shouldAnimate, streakDays, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Canvas dimensions
  const padding = size * 0.3;
  const canvasSize = size + padding * 2;
  const center = canvasSize / 2;

  // Flame dimensions based on level
  const getFlameHeight = () => {
    switch (level) {
      case 'ember': return size * 0.5;
      case 'flame': return size * 0.7;
      case 'blaze': return size * 0.9;
      case 'inferno': return size;
    }
  };

  const flameHeight = getFlameHeight();
  const flameWidth = flameHeight * 0.6;

  // Create flame path (teardrop shape)
  const createFlamePath = (height: number, width: number) => {
    const path = Skia.Path.Make();
    const baseY = center + height * 0.3;
    const tipY = center - height * 0.7;

    // Start at base center
    path.moveTo(center, baseY);

    // Right curve to tip
    path.cubicTo(
      center + width * 0.6, baseY - height * 0.2,
      center + width * 0.4, tipY + height * 0.4,
      center, tipY
    );

    // Left curve back to base
    path.cubicTo(
      center - width * 0.4, tipY + height * 0.4,
      center - width * 0.6, baseY - height * 0.2,
      center, baseY
    );

    path.close();
    return path;
  };

  // No streak - show placeholder
  if (streakDays <= 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Canvas style={{ width: canvasSize, height: canvasSize, marginTop: -padding, marginLeft: -padding }}>
          <Group>
            {/* Dimmed ember */}
            <Path path={createFlamePath(flameHeight * 0.6, flameWidth * 0.6)}>
              <LinearGradient
                start={vec(center, center + flameHeight * 0.3)}
                end={vec(center, center - flameHeight * 0.5)}
                colors={['#333333', '#222222']}
              />
            </Path>
          </Group>
        </Canvas>
      </View>
    );
  }

  const AnimatedView = Animated.View;

  return (
    <AnimatedView style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <Canvas style={{ width: canvasSize, height: canvasSize, marginTop: -padding, marginLeft: -padding }}>
        <Group>
          {/* Outer glow */}
          <Path path={createFlamePath(flameHeight * 1.2, flameWidth * 1.2)}>
            <BlurMask blur={level === 'inferno' ? 15 : level === 'blaze' ? 12 : 8} style="normal" />
            <RadialGradient
              c={vec(center, center)}
              r={flameHeight}
              colors={[colors.glow, 'transparent']}
              positions={[0.3, 1]}
            />
          </Path>

          {/* Main flame body */}
          <Path path={createFlamePath(flameHeight, flameWidth)}>
            <LinearGradient
              start={vec(center, center + flameHeight * 0.3)}
              end={vec(center, center - flameHeight * 0.7)}
              colors={[colors.secondary, colors.primary, colors.primary]}
              positions={[0, 0.4, 1]}
            />
          </Path>

          {/* Inner hot core */}
          <Path path={createFlamePath(flameHeight * 0.5, flameWidth * 0.4)}>
            <LinearGradient
              start={vec(center, center + flameHeight * 0.2)}
              end={vec(center, center - flameHeight * 0.3)}
              colors={['#ffffff', colors.secondary]}
              positions={[0, 1]}
            />
          </Path>

          {/* Level-specific effects */}
          {(level === 'blaze' || level === 'inferno') && (
            // Blue/purple flames get an extra inner glow
            <Path path={createFlamePath(flameHeight * 0.7, flameWidth * 0.5)}>
              <BlurMask blur={5} style="normal" />
              <LinearGradient
                start={vec(center, center + flameHeight * 0.2)}
                end={vec(center, center - flameHeight * 0.4)}
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
              />
            </Path>
          )}
        </Group>
      </Canvas>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
