/**
 * TapeReel Component
 *
 * Animated spinning reel for the reel-to-reel recorder.
 * Uses Skia for hardware-accelerated rendering.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Shadow,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
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

/**
 * Create spoke path for reel hub
 */
function createSpokePath(centerX: number, centerY: number, innerR: number, outerR: number, angle: number): string {
  const spokeWidth = 3;
  const halfWidth = spokeWidth / 2;

  // Calculate spoke endpoints
  const startX = centerX + innerR * Math.cos(angle);
  const startY = centerY + innerR * Math.sin(angle);
  const endX = centerX + outerR * Math.cos(angle);
  const endY = centerY + outerR * Math.sin(angle);

  // Perpendicular offset for width
  const perpX = Math.sin(angle) * halfWidth;
  const perpY = -Math.cos(angle) * halfWidth;

  return `M ${startX - perpX} ${startY - perpY}
          L ${endX - perpX} ${endY - perpY}
          L ${endX + perpX} ${endY + perpY}
          L ${startX + perpX} ${startY + perpY} Z`;
}

export const TapeReel: React.FC<TapeReelProps> = ({
  size = 70,
  isSpinning = false,
  direction = 'takeup',
  speed = 'normal',
  isRecording = false,
  tapeAmount = 0.5,
}) => {
  const rotation = useSharedValue(0);

  // Calculate reel dimensions
  const center = size / 2;
  const outerRadius = size / 2 - 2; // Small margin for shadow
  const hubRadius = size * 0.14; // Inner hub
  const spokeOuterRadius = size * 0.35; // Where spokes end
  const tapeInnerRadius = spokeOuterRadius + 2;
  const tapeOuterRadius = tapeInnerRadius + (outerRadius - tapeInnerRadius) * Math.max(0.2, tapeAmount);

  // Number of spokes
  const spokeCount = 6;

  // Animation effect
  useEffect(() => {
    if (isSpinning) {
      const speedMultiplier = PLAYBACK_SPEED_MULTIPLIERS[speed];
      const baseDuration = 2000; // 2 seconds for one rotation at normal speed
      const duration = baseDuration / speedMultiplier;

      // Direction affects rotation direction
      const targetRotation = direction === 'supply' ? 360 : -360;

      rotation.value = withRepeat(
        withTiming(targetRotation, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    } else {
      cancelAnimation(rotation);
      // Smoothly stop at current position
      rotation.value = withTiming(rotation.value % 360, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    }

    return () => {
      cancelAnimation(rotation);
    };
  }, [isSpinning, speed, direction, rotation]);

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Generate spoke paths
  const spokePaths = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * Math.PI * 2) / spokeCount;
    spokePaths.push(createSpokePath(center, center, hubRadius + 2, spokeOuterRadius, angle));
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Static shadow layer */}
      <View style={[styles.shadow, { width: size, height: size, borderRadius: size / 2 }]} />

      {/* Rotating reel */}
      <Animated.View style={[styles.reelContainer, { width: size, height: size }, animatedStyle]}>
        <Canvas style={{ width: size, height: size }}>
          {/* Outer reel body */}
          <Circle cx={center} cy={center} r={outerRadius} color={REEL_BODY_COLOR}>
            <Shadow dx={0} dy={2} blur={4} color="rgba(0,0,0,0.5)" />
          </Circle>

          {/* Reel rim highlight */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius - 1}
            color="transparent"
            style="stroke"
            strokeWidth={1}
          >
            <Shadow dx={-1} dy={-1} blur={1} color="rgba(255,255,255,0.15)" />
          </Circle>

          {/* Tape wound on reel */}
          <Circle cx={center} cy={center} r={tapeOuterRadius} color={TAPE_COLOR} />

          {/* Tape inner edge (darker) */}
          <Circle
            cx={center}
            cy={center}
            r={tapeInnerRadius}
            color={REEL_BODY_COLOR}
          />

          {/* Spoke area background */}
          <Circle cx={center} cy={center} r={spokeOuterRadius} color={REEL_BODY_COLOR} />

          {/* Spokes */}
          <Group>
            {spokePaths.map((pathData, index) => (
              <Path key={index} path={pathData} color={SPOKE_COLOR} />
            ))}
          </Group>

          {/* Center hub */}
          <Circle cx={center} cy={center} r={hubRadius} color={REEL_HUB_COLOR}>
            <Shadow dx={0} dy={1} blur={2} color="rgba(0,0,0,0.8)" inner />
          </Circle>

          {/* Hub center dot */}
          <Circle cx={center} cy={center} r={hubRadius * 0.4} color="#0d0d0d" />

          {/* Hub highlight ring */}
          <Circle
            cx={center}
            cy={center}
            r={hubRadius - 1}
            color="transparent"
            style="stroke"
            strokeWidth={0.5}
          >
            <Shadow dx={0} dy={-0.5} blur={0.5} color="rgba(255,255,255,0.1)" />
          </Circle>
        </Canvas>
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
