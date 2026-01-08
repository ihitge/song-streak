import React, { useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';

interface IndustrialScrewHolesProps {
  /**
   * Size of each screw hole in pixels
   * Default: 12
   */
  screwSize?: number;
  /**
   * Distance from corner edge in pixels
   * Default: 16
   */
  cornerOffset?: number;
  /**
   * Opacity of screw holes (0-1)
   * Default: 0.6
   */
  opacity?: number;
}

/**
 * Industrial hex/Allen screw holes overlay for dark containers
 * Creates a premium equipment aesthetic like professional audio gear
 *
 * Usage: Place as child inside a dark container (Colors.ink background)
 *
 * @example
 * <View style={styles.darkContainer}>
 *   <MatteNoiseOverlay />
 *   <IndustrialScrewHoles />
 *   {/* rest of content *\/}
 * </View>
 */
export const IndustrialScrewHoles: React.FC<IndustrialScrewHolesProps> = ({
  screwSize = 14,
  cornerOffset = 18,
  opacity = 0.6,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Create hexagon path for Allen key recess
  const createHexPath = (cx: number, cy: number, radius: number) => {
    const path = Skia.Path.Make();
    const sides = 6;
    const angleOffset = Math.PI / 6; // Start flat at top

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides + angleOffset;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    return path;
  };

  // Screw positions (4 corners)
  const getScrewPositions = () => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    return [
      { x: cornerOffset, y: cornerOffset }, // Top-left
      { x: dimensions.width - cornerOffset, y: cornerOffset }, // Top-right
      { x: cornerOffset, y: dimensions.height - cornerOffset }, // Bottom-left
      { x: dimensions.width - cornerOffset, y: dimensions.height - cornerOffset }, // Bottom-right
    ];
  };

  const screwPositions = getScrewPositions();
  const outerRadius = screwSize / 2;
  const innerRadius = outerRadius * 0.85;
  const hexRadius = outerRadius * 0.4;

  return (
    <View style={styles.container} pointerEvents="none" onLayout={handleLayout}>
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Canvas style={StyleSheet.absoluteFill}>
          <Group opacity={opacity}>
            {screwPositions.map((pos, index) => (
              <Group key={index}>
                {/* Outer shadow ring (recessed edge) */}
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={outerRadius}
                  color="rgba(30, 30, 30, 0.8)"
                />

                {/* Screw head surface with gradient */}
                <Circle cx={pos.x} cy={pos.y} r={innerRadius}>
                  <RadialGradient
                    c={vec(pos.x - innerRadius * 0.3, pos.y - innerRadius * 0.3)}
                    r={innerRadius * 1.5}
                    colors={['#555555', '#3a3a3a', '#252525']}
                    positions={[0, 0.5, 1]}
                  />
                </Circle>

                {/* Hex recess (Allen key hole) */}
                <Path
                  path={createHexPath(pos.x, pos.y, hexRadius)}
                  color="rgba(15, 15, 15, 0.9)"
                />

                {/* Inner hex shadow for depth */}
                <Path
                  path={createHexPath(pos.x, pos.y, hexRadius * 0.7)}
                  color="rgba(0, 0, 0, 0.6)"
                />

                {/* Subtle highlight reflection (top-left) */}
                <Circle
                  cx={pos.x - innerRadius * 0.35}
                  cy={pos.y - innerRadius * 0.35}
                  r={innerRadius * 0.2}
                  color="rgba(255, 255, 255, 0.2)"
                />
              </Group>
            ))}
          </Group>
        </Canvas>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
