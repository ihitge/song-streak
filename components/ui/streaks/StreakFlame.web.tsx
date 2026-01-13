import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlameLevel, FLAME_COLORS, getFlameLevel } from '@/types/streak';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface StreakFlameProps {
  streakDays: number;
  size?: number;
  animated?: boolean;
}

/**
 * Web fallback for StreakFlame using CSS animations
 * Uses React Native Animated API for cross-platform compatibility
 */
export const StreakFlame: React.FC<StreakFlameProps> = ({
  streakDays,
  size = 80,
  animated = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const level = getFlameLevel(streakDays);
  const colors = FLAME_COLORS[level];

  // Respect reduced motion preference
  const shouldAnimate = animated && !prefersReducedMotion;

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flickerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (shouldAnimate && streakDays > 0) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Flicker animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(flickerAnim, {
            toValue: 0.9,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(flickerAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
      flickerAnim.setValue(1);
    }
  }, [animated, streakDays, scaleAnim, flickerAnim]);

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

  // No streak - show placeholder
  if (streakDays <= 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View
          style={[
            styles.flame,
            {
              width: flameWidth * 0.6,
              height: flameHeight * 0.6,
              backgroundColor: '#333333',
              borderRadius: flameWidth * 0.3,
              borderTopLeftRadius: flameWidth * 0.15,
              borderTopRightRadius: flameWidth * 0.15,
            },
          ]}
        />
      </View>
    );
  }

  // Glow size based on level
  const glowSize = level === 'inferno' ? 1.8 : level === 'blaze' ? 1.6 : 1.4;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow layer */}
      <View
        style={[
          styles.glow,
          {
            width: flameWidth * glowSize,
            height: flameHeight * glowSize,
            backgroundColor: colors.glow,
            borderRadius: flameWidth,
            opacity: 0.4,
          },
        ]}
      />

      {/* Animated flame container */}
      <Animated.View
        style={[
          styles.flameContainer,
          {
            transform: [
              { scale: scaleAnim },
            ],
            opacity: flickerAnim,
          },
        ]}
      >
        {/* Main flame with gradient */}
        <LinearGradient
          colors={[colors.secondary, colors.primary, colors.primary]}
          locations={[0, 0.4, 1]}
          style={[
            styles.flame,
            {
              width: flameWidth,
              height: flameHeight,
              borderRadius: flameWidth / 2,
              borderTopLeftRadius: flameWidth * 0.3,
              borderTopRightRadius: flameWidth * 0.3,
            },
          ]}
        />

        {/* Inner core */}
        <LinearGradient
          colors={['#ffffff', colors.secondary]}
          style={[
            styles.core,
            {
              width: flameWidth * 0.4,
              height: flameHeight * 0.5,
              borderRadius: flameWidth * 0.2,
              borderTopLeftRadius: flameWidth * 0.1,
              borderTopRightRadius: flameWidth * 0.1,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    zIndex: 0,
  },
  flameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flame: {
    position: 'absolute',
    zIndex: 1,
    transform: [{ rotate: '180deg' }],
  },
  core: {
    position: 'absolute',
    zIndex: 2,
    transform: [{ rotate: '180deg' }, { translateY: -10 }],
  },
});
