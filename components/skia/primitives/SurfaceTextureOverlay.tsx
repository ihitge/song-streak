import React from 'react';
import { Canvas, Group, Rect, FractalNoise, rrect, rect } from '@shopify/react-native-skia';

interface SurfaceTextureOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  textureOpacity?: number;
  variant?: 'light' | 'dark';
}

/**
 * Adds subtle dust/grain texture to simulate glass imperfections.
 * Uses FractalNoise shader for authentic procedural noise.
 *
 * Layer order: This should be rendered ABOVE GlassOverlay
 * (dust and scratches sit on top of the glass surface)
 */
export const SurfaceTextureOverlay = React.memo<SurfaceTextureOverlayProps>(({
  width,
  height,
  borderRadius = 6,
  textureOpacity = 0.03,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';
  const clipRect = rrect(rect(0, 0, width, height), borderRadius, borderRadius);

  // Dark variant needs higher opacity and different blend mode for visibility
  const effectiveOpacity = isDark ? textureOpacity * 1.5 : textureOpacity;
  const blendMode = isDark ? 'overlay' : 'softLight';

  return (
    <Canvas
      style={{
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      pointerEvents="none"
    >
      <Group clip={clipRect} blendMode={blendMode} opacity={effectiveOpacity}>
        <Rect x={0} y={0} width={width} height={height}>
          <FractalNoise
            freqX={0.04}
            freqY={0.04}
            octaves={3}
            seed={42}
          />
        </Rect>
      </Group>
    </Canvas>
  );
});

SurfaceTextureOverlay.displayName = 'SurfaceTextureOverlay';
