import React from 'react';
import { Canvas, RoundedRect, LinearGradient, vec, Group } from '@shopify/react-native-skia';

interface GlassOverlayProps {
  width: number;
  height: number;
  borderRadius?: number;
  opacity?: number;
}

export const GlassOverlay: React.FC<GlassOverlayProps> = ({
  width,
  height,
  borderRadius = 12,
  opacity = 1,
}) => {
  return (
    <Canvas style={{ width, height, position: 'absolute', top: 0, left: 0 }}>
      <Group opacity={opacity}>
        {/* Main gradient overlay */}
        <RoundedRect x={0} y={0} width={width} height={height} r={borderRadius}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.05)']}
          />
        </RoundedRect>

        {/* Top highlight strip */}
        <RoundedRect x={2} y={2} width={width - 4} height={4} r={2}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 4)}
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          />
        </RoundedRect>
      </Group>
    </Canvas>
  );
};
