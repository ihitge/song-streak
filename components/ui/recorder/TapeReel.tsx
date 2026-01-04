/**
 * TapeReel Component
 *
 * Clean, minimalist film reel icon for the voice recorder.
 * Style: arc-loader.jpeg reference - thin outer ring, 3 triangular cutouts, center circle.
 * Uses Skia for hardware-accelerated rendering.
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Skia,
  vec,
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
  // Main reel body - darker for contrast
  reelBody: Colors.charcoal,
  // Stroke color - subtle warm gray
  stroke: 'rgba(255,255,255,0.5)',
  // Recording glow
  recordingGlow: Colors.vermilion,
};

/**
 * Create a triangular wedge path for the film reel cutout
 */
function createWedgePath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngleDeg: number,
  endAngleDeg: number
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();

  const startAngle = (startAngleDeg * Math.PI) / 180;
  const endAngle = (endAngleDeg * Math.PI) / 180;

  // Start at inner radius, start angle
  const innerX1 = centerX + innerRadius * Math.cos(startAngle);
  const innerY1 = centerY + innerRadius * Math.sin(startAngle);

  // Inner radius, end angle
  const innerX2 = centerX + innerRadius * Math.cos(endAngle);
  const innerY2 = centerY + innerRadius * Math.sin(endAngle);

  // Outer radius, start angle
  const outerX1 = centerX + outerRadius * Math.cos(startAngle);
  const outerY1 = centerY + outerRadius * Math.sin(startAngle);

  // Outer radius, end angle
  const outerX2 = centerX + outerRadius * Math.cos(endAngle);
  const outerY2 = centerY + outerRadius * Math.sin(endAngle);

  // Create wedge shape
  path.moveTo(innerX1, innerY1);
  path.lineTo(outerX1, outerY1);

  // Arc along outer edge
  path.arcToOval(
    Skia.XYWHRect(
      centerX - outerRadius,
      centerY - outerRadius,
      outerRadius * 2,
      outerRadius * 2
    ),
    startAngleDeg,
    endAngleDeg - startAngleDeg,
    false
  );

  path.lineTo(innerX2, innerY2);

  // Arc along inner edge (reverse direction)
  path.arcToOval(
    Skia.XYWHRect(
      centerX - innerRadius,
      centerY - innerRadius,
      innerRadius * 2,
      innerRadius * 2
    ),
    endAngleDeg,
    -(endAngleDeg - startAngleDeg),
    false
  );

  path.close();

  return path;
}

export const TapeReel: React.FC<TapeReelProps> = ({
  size = 140,
  isSpinning = false,
  isRecording = false,
}) => {
  const rotation = useSharedValue(0);

  // Calculate dimensions based on size
  const dimensions = useMemo(() => {
    const center = size / 2;
    const strokeWidth = 2;
    return {
      center,
      strokeWidth,
      // Outer ring
      outerRadius: size / 2 - strokeWidth - 2,
      // Center circle
      centerRadius: size * 0.10,
      // Spoke cutouts - triangular wedges
      spokeInnerRadius: size * 0.14,
      spokeOuterRadius: size * 0.40,
      // Wedge angular width (degrees)
      spokeAngle: 55,
    };
  }, [size]);

  // Animation effect - slow continuous spin
  useEffect(() => {
    if (isSpinning) {
      const duration = 3000; // 3 seconds per rotation

      rotation.value = withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(rotation.value % 360, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      });
    }

    return () => {
      cancelAnimation(rotation);
    };
  }, [isSpinning, rotation]);

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Create the 3 wedge cutout paths
  const wedgePaths = useMemo(() => {
    const { center, spokeInnerRadius, spokeOuterRadius, spokeAngle } = dimensions;

    // 3 wedges at 90°, 210°, 330° (top, bottom-left, bottom-right)
    const baseAngles = [90, 210, 330];

    return baseAngles.map((baseAngle) => {
      const startAngle = baseAngle - spokeAngle / 2;
      const endAngle = baseAngle + spokeAngle / 2;

      return createWedgePath(
        center,
        center,
        spokeInnerRadius,
        spokeOuterRadius,
        startAngle,
        endAngle
      );
    });
  }, [dimensions]);

  // Create the main reel body path (filled circle)
  const reelBodyPath = useMemo(() => {
    const path = Skia.Path.Make();
    const { center, outerRadius, centerRadius } = dimensions;

    // Add outer circle
    path.addCircle(center, center, outerRadius);

    return path;
  }, [dimensions]);

  const { center, outerRadius, centerRadius, strokeWidth } = dimensions;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.reelContainer, { width: size, height: size }, animatedStyle]}>
        <Canvas style={{ width: size, height: size }}>
          {/* Main reel body (filled) */}
          <Path path={reelBodyPath} color={REEL_COLORS.reelBody} />

          {/* Cut out the 3 triangular wedges (reveal background) */}
          {wedgePaths.map((wedgePath, i) => (
            <Path
              key={`wedge-${i}`}
              path={wedgePath}
              color={Colors.ink}
            />
          ))}

          {/* Cut out center circle (reveal background) */}
          <Circle
            cx={center}
            cy={center}
            r={centerRadius}
            color={Colors.ink}
          />

          {/* Outer ring stroke */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            style="stroke"
            strokeWidth={strokeWidth}
            color={REEL_COLORS.stroke}
          />

          {/* Center circle stroke */}
          <Circle
            cx={center}
            cy={center}
            r={centerRadius}
            style="stroke"
            strokeWidth={strokeWidth}
            color={REEL_COLORS.stroke}
          />

          {/* Recording glow effect */}
          {isRecording && (
            <Circle
              cx={center}
              cy={center}
              r={outerRadius + 6}
              style="stroke"
              strokeWidth={3}
              color={REEL_COLORS.recordingGlow}
              opacity={0.7}
            />
          )}
        </Canvas>
      </Animated.View>
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
  },
});

export default TapeReel;
