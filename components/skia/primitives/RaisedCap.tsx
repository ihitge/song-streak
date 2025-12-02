import React from 'react';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';

interface RaisedCapProps {
  width: number;
  height: number;
  borderRadius?: number;
  isPressed?: boolean;
  isActive?: boolean;
  elevation?: 'low' | 'medium' | 'high';
}

const elevationPresets = {
  low: { blur: 2, yOffset: 1 },
  medium: { blur: 4, yOffset: 2 },
  high: { blur: 6, yOffset: 3 },
};

export const RaisedCap: React.FC<RaisedCapProps> = ({
  width,
  height,
  borderRadius = 8,
  isPressed = false,
  isActive = false,
  elevation = 'medium',
}) => {
  const { blur, yOffset } = elevationPresets[elevation];
  const box = rrect(rect(0, 0, width, height), borderRadius, borderRadius);

  // Active state uses charcoal, inactive uses gradient from soft-white to matte-fog
  const fillColor = isActive ? Colors.charcoal : Colors.softWhite;

  return (
    <Canvas style={{ width, height }}>
      <Box box={box} color={fillColor}>
        {!isPressed && !isActive && (
          <>
            {/* Drop shadow for raised appearance */}
            <BoxShadow
              dx={0}
              dy={yOffset}
              blur={blur}
              color="rgba(0,0,0,0.2)"
            />
            {/* Top highlight */}
            <BoxShadow
              dx={0}
              dy={-1}
              blur={1}
              color="rgba(255,255,255,0.8)"
            />
          </>
        )}
        {(isPressed || isActive) && (
          /* Inset shadow when pressed/active */
          <BoxShadow
            dx={1}
            dy={1}
            blur={3}
            color="rgba(0,0,0,0.3)"
            inner
          />
        )}
        {!isActive && (
          /* Gradient overlay for plastic look */
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[Colors.softWhite, Colors.matteFog]}
          />
        )}
      </Box>
    </Canvas>
  );
};
