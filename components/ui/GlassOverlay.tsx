import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec,
  Circle,
  RadialGradient,
} from '@shopify/react-native-skia';

interface GlassOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  /** Opacity of the glare highlight (default: 0.35) */
  glareOpacity?: number;
  /** Opacity of the specular highlight (default: 0.5) */
  specularOpacity?: number;
}

/**
 * GlassOverlay - Simulates a physical glass window with vintage hi-fi aesthetics.
 *
 * Features:
 * - Top-to-bottom glare gradient
 * - Specular highlight circle (bright spot from light source)
 * - 3D bezel edges (light top, dark bottom)
 *
 * Usage:
 * Position this absolutely over elements like FrequencyTuner or InsetWindow.
 * pointerEvents="none" ensures touch pass-through to controls underneath.
 */
export const GlassOverlay: React.FC<GlassOverlayProps> = ({
  width,
  height,
  borderRadius = 6,
  glareOpacity = 0.175,
  specularOpacity = 0.25,
}) => {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-0"
      style={[styles.container, { width, height, borderRadius }]}
    >
      {/* Skia Canvas for glass effects */}
      <Canvas style={{ width, height }}>
        {/* Layer 1: Top-to-bottom glare gradient */}
        <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[
              `rgba(255, 255, 255, ${glareOpacity})`,
              `rgba(255, 255, 255, ${glareOpacity * 0.3})`,
              'rgba(255, 255, 255, 0)',
              'rgba(0, 0, 0, 0.1)',
            ]}
            positions={[0, 0.3, 0.6, 1]}
          />
        </RoundedRect>

        {/* Layer 2: Specular highlight (top-left bright spot) */}
        <Circle cx={width * 0.25} cy={height * 0.3} r={width * 0.2}>
          <RadialGradient
            c={vec(width * 0.25, height * 0.3)}
            r={width * 0.2}
            colors={[
              `rgba(255, 255, 255, ${specularOpacity})`,
              'rgba(255, 255, 255, 0)',
            ]}
          />
        </Circle>
      </Canvas>

      {/* Layer 3: Bezel edges - 3D depth with light/shadow borders */}
      <View
        style={[
          styles.bezelLayer,
          {
            borderRadius,
            borderTopColor: 'rgba(255, 255, 255, 0.7)',
            borderLeftColor: 'rgba(255, 255, 255, 0.5)',
            borderBottomColor: 'rgba(0, 0, 0, 0.6)',
            borderRightColor: 'rgba(0, 0, 0, 0.4)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bezelLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
  },
});
