/**
 * TapePath Web Component
 *
 * CSS-based fallback for the tape path on web.
 * Uses a simple curved line with CSS styling.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
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
  const dashOffset = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Animate dash pattern to create movement illusion
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (isMoving) {
      const speedMultiplier = PLAYBACK_SPEED_MULTIPLIERS[speed];
      const baseDuration = 500; // ms for one dash cycle
      const duration = baseDuration / speedMultiplier;

      // Direction affects animation direction
      const toValue = direction === 'forward' ? 20 : -20;

      dashOffset.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(dashOffset, {
          toValue,
          duration,
          easing: Easing.linear,
          useNativeDriver: false, // translateX not supported with native driver for web
        })
      );
      animationRef.current.start();
    } else {
      Animated.timing(dashOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isMoving, speed, direction, dashOffset]);

  // Calculate tape exit/entry points on reels
  const leftExitAngle = Math.PI * 0.25; // 45 degrees from bottom
  const leftExitX = leftReelX + Math.cos(leftExitAngle) * tapeRadius;
  const leftExitY = reelY + Math.sin(leftExitAngle) * tapeRadius;

  const rightEntryAngle = Math.PI * 0.75; // 135 degrees from bottom
  const rightEntryX = rightReelX + Math.cos(rightEntryAngle) * tapeRadius;
  const rightEntryY = reelY + Math.sin(rightEntryAngle) * tapeRadius;

  // Midpoint for curve
  const midY = Math.max(leftExitY, rightEntryY) + 8;

  // Create SVG path for web
  const pathData = `M ${leftExitX} ${leftExitY} Q ${(leftExitX + rightEntryX) / 2} ${midY} ${rightEntryX} ${rightEntryY}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* Main tape path */}
        <path
          d={pathData}
          fill="none"
          stroke={TAPE_COLOR}
          strokeWidth={TAPE_WIDTH}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.4))',
          }}
        />

        {/* Tape shine highlight */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* Animated texture lines (only visible when moving) */}
        {isMoving && (
          <Animated.View
            style={{
              position: 'absolute',
              left: dashOffset,
            }}
          >
            <svg width={width} height={height}>
              <path
                d={pathData}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={TAPE_WIDTH}
                strokeLinecap="round"
                strokeDasharray="4,6"
              />
            </svg>
          </Animated.View>
        )}
      </svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
});

export default TapePath;
