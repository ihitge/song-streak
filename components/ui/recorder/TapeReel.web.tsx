/**
 * TapeReel Web Component
 *
 * Clean, minimalist film reel icon for the voice recorder (web version).
 * Style: arc-loader.jpeg reference - thin outer ring, 3 triangular cutouts, center circle.
 * Uses CSS for rendering since Skia path operations may not work on web.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';

interface TapeReelProps {
  /** Size of the reel in pixels */
  size?: number;
  /** Whether the reel is currently spinning */
  isSpinning?: boolean;
  /** Show recording state (changes accent color) */
  isRecording?: boolean;
}

// Simple color palette for clean film reel icon
const REEL_COLORS = {
  // Main reel body
  reelBody: Colors.charcoal,
  // Stroke color - subtle
  stroke: 'rgba(255,255,255,0.5)',
  // Background (cutout color)
  background: Colors.ink,
  // Recording glow
  recordingGlow: Colors.vermilion,
};

export const TapeReel: React.FC<TapeReelProps> = ({
  size = 140,
  isSpinning = false,
  isRecording = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Calculate dimensions
  const strokeWidth = 2;
  const outerRadius = size / 2 - strokeWidth - 2;
  const centerRadius = size * 0.10;
  const spokeInnerRadius = size * 0.14;
  const spokeOuterRadius = size * 0.40;
  const spokeAngle = 55; // degrees

  // Animation effect - slow continuous spin
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (isSpinning) {
      const duration = 3000; // 3 seconds per rotation

      rotation.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
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
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isSpinning, rotation]);

  // Create rotation interpolation
  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Create triangular wedge shapes using CSS clip-path approach
  // For web, we'll use positioned triangular elements
  const createWedge = (baseAngle: number, index: number) => {
    // Calculate wedge dimensions
    const halfAngle = spokeAngle / 2;
    const startAngle = baseAngle - halfAngle;
    const endAngle = baseAngle + halfAngle;

    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate points for the wedge (triangle-ish shape)
    const center = size / 2;

    // Inner points (near center)
    const innerX1 = center + spokeInnerRadius * Math.cos(startRad);
    const innerY1 = center + spokeInnerRadius * Math.sin(startRad);
    const innerX2 = center + spokeInnerRadius * Math.cos(endRad);
    const innerY2 = center + spokeInnerRadius * Math.sin(endRad);

    // Outer points
    const outerX1 = center + spokeOuterRadius * Math.cos(startRad);
    const outerY1 = center + spokeOuterRadius * Math.sin(startRad);
    const outerX2 = center + spokeOuterRadius * Math.cos(endRad);
    const outerY2 = center + spokeOuterRadius * Math.sin(endRad);

    // Create polygon points for clip-path
    const points = `${innerX1}px ${innerY1}px, ${outerX1}px ${outerY1}px, ${outerX2}px ${outerY2}px, ${innerX2}px ${innerY2}px`;

    return (
      <View
        key={`wedge-${index}`}
        style={[
          styles.wedge,
          {
            width: size,
            height: size,
            backgroundColor: REEL_COLORS.background,
            // @ts-ignore - web-specific style
            clipPath: `polygon(${points})`,
          },
        ]}
      />
    );
  };

  // 3 wedges at 90°, 210°, 330° (top, bottom-left, bottom-right)
  const wedgeAngles = [90, 210, 330];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
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
        {/* Main reel body (filled circle) */}
        <View
          style={[
            styles.reelBody,
            {
              width: outerRadius * 2,
              height: outerRadius * 2,
              borderRadius: outerRadius,
              backgroundColor: REEL_COLORS.reelBody,
              borderWidth: strokeWidth,
              borderColor: REEL_COLORS.stroke,
            },
          ]}
        />

        {/* 3 triangular wedge cutouts */}
        {wedgeAngles.map((angle, i) => createWedge(angle, i))}

        {/* Center circle (cutout) */}
        <View
          style={[
            styles.centerCircle,
            {
              width: centerRadius * 2,
              height: centerRadius * 2,
              borderRadius: centerRadius,
              backgroundColor: REEL_COLORS.background,
              borderWidth: strokeWidth,
              borderColor: REEL_COLORS.stroke,
            },
          ]}
        />
      </Animated.View>

      {/* Recording glow effect */}
      {isRecording && (
        <View
          style={[
            styles.recordingGlow,
            {
              width: (outerRadius + 6) * 2,
              height: (outerRadius + 6) * 2,
              borderRadius: outerRadius + 6,
              borderWidth: 3,
              borderColor: REEL_COLORS.recordingGlow,
            },
          ]}
        />
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
  reelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reelBody: {
    position: 'absolute',
  },
  wedge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerCircle: {
    position: 'absolute',
  },
  recordingGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    opacity: 0.7,
  },
});

export default TapeReel;
