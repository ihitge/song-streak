import React from 'react';
import { Canvas, Circle, Shadow, Fill } from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';

interface LEDIndicatorProps {
  size?: number;
  isActive: boolean;
  color?: string;
  inactiveColor?: string;
}

export const LEDIndicator: React.FC<LEDIndicatorProps> = ({
  size = 6,
  isActive,
  color = Colors.vermilion,
  inactiveColor = '#cccccc',
}) => {
  // Canvas needs extra space for the glow effect
  const canvasSize = size * 3;
  const center = canvasSize / 2;
  const radius = size / 2;

  return (
    <Canvas style={{ width: canvasSize, height: canvasSize }}>
      <Circle cx={center} cy={center} r={radius}>
        {isActive ? (
          <>
            {/* Glow layer - larger blur for LED effect */}
            <Shadow dx={0} dy={0} blur={8} color={color} />
            {/* Core color */}
            <Fill color={color} />
          </>
        ) : (
          <Fill color={inactiveColor} />
        )}
      </Circle>
    </Canvas>
  );
};
