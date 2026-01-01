/**
 * TapePath Component
 *
 * Animated tape path connecting the two reels.
 * Shows the magnetic tape traveling between supply and take-up reels.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  DashPathEffect,
  Shadow,
  SkPath,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { PlaybackSpeed, PLAYBACK_SPEED_MULTIPLIERS } from '@/types/voiceMemo';

interface TapePathProps {
  /** Width of the tape path area */
  width?: number;
  /** Height of the tape path area */
  height?: number;
  /** Whether the tape is moving */
  isMoving?: boolean;
  /** Current playback speed */
  speed?: PlaybackSpeed;
  /** Direction: 'forward' (left to right) or 'reverse' (right to left) */
  direction?: 'forward' | 'reverse';
  /** Left reel center X position */
  leftReelX?: number;
  /** Right reel center X position */
  rightReelX?: number;
  /** Reel Y position (center) */
  reelY?: number;
  /** Radius of tape on reels */
  tapeRadius?: number;
}

// Tape appearance
const TAPE_COLOR = '#5c534d'; // Magnetic tape color
const TAPE_WIDTH = 3;
const TAPE_SHINE_COLOR = 'rgba(255, 255, 255, 0.15)';

export const TapePath: React.FC<TapePathProps> = ({
  width = 200,
  height = 40,
  isMoving = false,
  speed = 'normal',
  direction = 'forward',
  leftReelX = 50,
  rightReelX = 150,
  reelY = 20,
  tapeRadius = 25,
}) => {
  const dashPhase = useSharedValue(0);

  // Animate dash pattern to create movement illusion
  useEffect(() => {
    if (isMoving) {
      const speedMultiplier = PLAYBACK_SPEED_MULTIPLIERS[speed];
      const baseDuration = 500; // ms for one dash cycle
      const duration = baseDuration / speedMultiplier;

      // Direction affects phase direction
      const phaseTarget = direction === 'forward' ? 20 : -20;

      dashPhase.value = withRepeat(
        withTiming(phaseTarget, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite
        false // Don't reverse
      );
    } else {
      cancelAnimation(dashPhase);
      dashPhase.value = withTiming(0, { duration: 200 });
    }

    return () => {
      cancelAnimation(dashPhase);
    };
  }, [isMoving, speed, direction, dashPhase]);

  // Track if Skia is ready (needed for web compatibility)
  const [skiaReady, setSkiaReady] = useState(Platform.OS !== 'web');

  // On web, Skia loads asynchronously - check if it's ready
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check if Skia is loaded by trying to create a path
      const checkSkia = () => {
        try {
          // Try to create a path - if Skia isn't loaded, this will throw
          const testPath = Skia.Path.Make();
          if (testPath) {
            setSkiaReady(true);
          } else {
            // Retry after a short delay
            setTimeout(checkSkia, 100);
          }
        } catch {
          // Skia not ready yet, retry
          setTimeout(checkSkia, 100);
        }
      };
      checkSkia();
    }
  }, []);

  // Create the tape path - curves from left reel to right reel
  // The tape comes off the bottom of left reel and enters top of right reel
  const tapePath = useMemo((): SkPath | null => {
    if (!skiaReady) return null;

    try {
      const path = Skia.Path.Make();

      // Calculate tape exit/entry points on reels
      // Left reel: tape exits from bottom-right
      const leftExitAngle = Math.PI * 0.25; // 45 degrees from bottom
      const leftExitX = leftReelX + Math.cos(leftExitAngle) * tapeRadius;
      const leftExitY = reelY + Math.sin(leftExitAngle) * tapeRadius;

      // Right reel: tape enters from bottom-left
      const rightEntryAngle = Math.PI * 0.75; // 135 degrees from bottom
      const rightEntryX = rightReelX + Math.cos(rightEntryAngle) * tapeRadius;
      const rightEntryY = reelY + Math.sin(rightEntryAngle) * tapeRadius;

      // Control point for smooth curve (slightly below the line)
      const midX = (leftExitX + rightEntryX) / 2;
      const midY = Math.max(leftExitY, rightEntryY) + 8;

      // Draw path
      path.moveTo(leftExitX, leftExitY);
      path.quadTo(midX, midY, rightEntryX, rightEntryY);

      return path;
    } catch (e) {
      console.warn('[TapePath] Skia not ready:', e);
      return null;
    }
  }, [skiaReady, leftReelX, rightReelX, reelY, tapeRadius]);

  // Don't render until Skia is ready and path is created
  if (!tapePath) {
    return <View style={[styles.container, { width, height }]} />;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        {/* Main tape path */}
        <Path
          path={tapePath}
          color={TAPE_COLOR}
          style="stroke"
          strokeWidth={TAPE_WIDTH}
          strokeCap="round"
        >
          <Shadow dx={0} dy={1} blur={2} color="rgba(0,0,0,0.4)" />
        </Path>

        {/* Tape shine highlight */}
        <Path
          path={tapePath}
          color={TAPE_SHINE_COLOR}
          style="stroke"
          strokeWidth={1}
          strokeCap="round"
        />

        {/* Animated texture lines (only visible when moving) */}
        {isMoving && (
          <Path
            path={tapePath}
            color="rgba(0,0,0,0.2)"
            style="stroke"
            strokeWidth={TAPE_WIDTH}
            strokeCap="round"
          >
            <DashPathEffect intervals={[4, 6]} phase={0} />
          </Path>
        )}
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default TapePath;
