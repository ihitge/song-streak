/**
 * TapeReel Web Component
 *
 * CSS-based fallback for the spinning reel component on web.
 * Uses React Native Animated API for rotation animation.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';
import { PlaybackSpeed, PLAYBACK_SPEED_MULTIPLIERS } from '@/types/voiceMemo';

interface TapeReelProps {
  /** Size of the reel in pixels */
  size?: number;
  /** Whether the reel is currently spinning */
  isSpinning?: boolean;
  /** Direction: 'supply' (clockwise) or 'takeup' (counterclockwise) */
  direction?: 'supply' | 'takeup';
  /** Current playback speed */
  speed?: PlaybackSpeed;
  /** Show recording indicator LED */
  isRecording?: boolean;
  /** Amount of tape on reel (0-1, affects visual appearance) */
  tapeAmount?: number;
}

// Reel colors
const REEL_BODY_COLOR = Colors.charcoal;
const REEL_HUB_COLOR = '#1a1a1a';
const SPOKE_COLOR = Colors.graphite;
const TAPE_COLOR = '#3d3632'; // Magnetic tape oxide color

export const TapeReel: React.FC<TapeReelProps> = ({
  size = 70,
  isSpinning = false,
  direction = 'takeup',
  speed = 'normal',
  isRecording = false,
  tapeAmount = 0.5,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Calculate reel dimensions
  const outerRadius = size / 2 - 2;
  const hubRadius = size * 0.14;
  const spokeOuterRadius = size * 0.35;
  const tapeInnerRadius = spokeOuterRadius + 2;
  const tapeOuterRadius = tapeInnerRadius + (outerRadius - tapeInnerRadius) * Math.max(0.2, tapeAmount);

  // Number of spokes
  const spokeCount = 6;

  // Animation effect
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (isSpinning) {
      const speedMultiplier = PLAYBACK_SPEED_MULTIPLIERS[speed];
      const baseDuration = 2000; // 2 seconds for one rotation at normal speed
      const duration = baseDuration / speedMultiplier;

      // Direction affects rotation direction
      const toValue = direction === 'supply' ? 1 : -1;

      rotation.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      // Smoothly stop
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isSpinning, speed, direction, rotation]);

  // Create rotation interpolation
  const rotateInterpolation = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  // Generate spoke positions
  const spokes = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * 360) / spokeCount;
    spokes.push(
      <View
        key={i}
        style={[
          styles.spoke,
          {
            width: 3,
            height: spokeOuterRadius - hubRadius - 2,
            backgroundColor: SPOKE_COLOR,
            transform: [
              { translateX: -1.5 },
              { translateY: -(spokeOuterRadius - hubRadius - 2) / 2 - hubRadius - 1 },
              { rotate: `${angle}deg` },
            ],
          },
        ]}
      />
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Static shadow layer */}
      <View style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }]} />

      {/* Rotating reel */}
      <Animated.View
        style={[
          styles.reelContainer,
          {
            width: size,
            height: size,
            transform: [{ rotate: rotateInterpolation }],
          },
        ]}
      >
        {/* Outer reel body */}
        <View
          style={[
            styles.outerReel,
            {
              width: outerRadius * 2,
              height: outerRadius * 2,
              borderRadius: outerRadius,
              backgroundColor: REEL_BODY_COLOR,
            },
          ]}
        />

        {/* Tape wound on reel */}
        <View
          style={[
            styles.tape,
            {
              width: tapeOuterRadius * 2,
              height: tapeOuterRadius * 2,
              borderRadius: tapeOuterRadius,
              backgroundColor: TAPE_COLOR,
            },
          ]}
        />

        {/* Tape inner edge (darker) */}
        <View
          style={[
            styles.tapeInner,
            {
              width: tapeInnerRadius * 2,
              height: tapeInnerRadius * 2,
              borderRadius: tapeInnerRadius,
              backgroundColor: REEL_BODY_COLOR,
            },
          ]}
        />

        {/* Spoke area background */}
        <View
          style={[
            styles.spokeArea,
            {
              width: spokeOuterRadius * 2,
              height: spokeOuterRadius * 2,
              borderRadius: spokeOuterRadius,
              backgroundColor: REEL_BODY_COLOR,
            },
          ]}
        />

        {/* Spokes */}
        <View style={[styles.spokesContainer, { width: size, height: size }]}>
          {spokes}
        </View>

        {/* Center hub */}
        <View
          style={[
            styles.hub,
            {
              width: hubRadius * 2,
              height: hubRadius * 2,
              borderRadius: hubRadius,
              backgroundColor: REEL_HUB_COLOR,
            },
          ]}
        />

        {/* Hub center dot */}
        <View
          style={[
            styles.hubDot,
            {
              width: hubRadius * 0.8,
              height: hubRadius * 0.8,
              borderRadius: hubRadius * 0.4,
              backgroundColor: '#0d0d0d',
            },
          ]}
        />
      </Animated.View>

      {/* Recording LED indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingLed} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  reelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerReel: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  tape: {
    position: 'absolute',
  },
  tapeInner: {
    position: 'absolute',
  },
  spokeArea: {
    position: 'absolute',
  },
  spokesContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spoke: {
    position: 'absolute',
  },
  hub: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  hubDot: {
    position: 'absolute',
  },
  recordingIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  recordingLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.vermilion,
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default TapeReel;
