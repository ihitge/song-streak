import React from 'react';
import { Canvas, Box, BoxShadow, rrect, rect } from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';

interface InsetWellProps {
  width: number;
  height: number;
  borderRadius?: number;
  depth?: 'shallow' | 'medium' | 'deep';
  color?: string;
  children?: React.ReactNode;
}

const depthPresets = {
  shallow: { blur: 3, offset: 1, lightBlur: 2 },
  medium: { blur: 5, offset: 2, lightBlur: 3 },
  deep: { blur: 8, offset: 3, lightBlur: 4 },
};

export const InsetWell: React.FC<InsetWellProps> = ({
  width,
  height,
  borderRadius = 12,
  depth = 'medium',
  color = Colors.alloy,
}) => {
  const { blur, offset, lightBlur } = depthPresets[depth];
  const box = rrect(rect(0, 0, width, height), borderRadius, borderRadius);

  return (
    <Canvas style={{ width, height }}>
      <Box box={box} color={color}>
        {/* Dark inner shadow (top-left light source) */}
        <BoxShadow
          dx={offset}
          dy={offset}
          blur={blur}
          color="rgba(0,0,0,0.15)"
          inner
        />
        {/* Light inner highlight (bottom-right) */}
        <BoxShadow
          dx={-offset + 1}
          dy={-offset + 1}
          blur={lightBlur}
          color="rgba(255,255,255,0.5)"
          inner
        />
      </Box>
    </Canvas>
  );
};
