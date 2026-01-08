import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Canvas, Rect, FractalNoise, Group } from '@shopify/react-native-skia';

interface MatteNoiseOverlayProps {
  /**
   * Opacity of the noise texture (0-1)
   * Default: 0.04 for subtle matte grain effect
   */
  opacity?: number;
}

/**
 * Matte noise overlay for dark surfaces
 * Creates a subtle grain texture like matte rubber/soft-touch plastic
 *
 * Usage: Place as the first child inside a dark container (Colors.ink background)
 *
 * @example
 * <View style={styles.darkContainer}>
 *   <MatteNoiseOverlay />
 *   {/* rest of content *\/}
 * </View>
 */
export const MatteNoiseOverlay: React.FC<MatteNoiseOverlayProps> = ({
  opacity = 0.04,
}) => {
  // Use Skia FractalNoise for native
  return (
    <View style={styles.container} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Group opacity={opacity} blendMode="overlay">
          <Rect x={0} y={0} width={4000} height={4000}>
            <FractalNoise
              freqX={0.5}
              freqY={0.5}
              octaves={4}
              seed={123}
            />
          </Rect>
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
