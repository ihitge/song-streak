import React, { useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';

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
 * Industrial hex/Allen screw holes overlay for dark containers (Web version)
 * Uses SVG for rendering on web platform
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

  // Create hexagon points for SVG polygon
  const createHexPoints = (cx: number, cy: number, radius: number): string => {
    const sides = 6;
    const angleOffset = Math.PI / 6; // Start flat at top
    const points: string[] = [];

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides + angleOffset;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
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
        <svg
          width={dimensions.width}
          height={dimensions.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <defs>
            {/* Radial gradient for screw head surface */}
            {screwPositions.map((pos, index) => (
              <radialGradient
                key={`grad-${index}`}
                id={`screwGradient-${index}`}
                cx={`${((pos.x - innerRadius * 0.3) / dimensions.width) * 100}%`}
                cy={`${((pos.y - innerRadius * 0.3) / dimensions.height) * 100}%`}
                r="50%"
              >
                <stop offset="0%" stopColor="#555555" />
                <stop offset="50%" stopColor="#3a3a3a" />
                <stop offset="100%" stopColor="#252525" />
              </radialGradient>
            ))}
          </defs>

          <g opacity={opacity}>
            {screwPositions.map((pos, index) => (
              <g key={index}>
                {/* Outer shadow ring (recessed edge) */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={outerRadius}
                  fill="rgba(30, 30, 30, 0.8)"
                />

                {/* Screw head surface with gradient */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={innerRadius}
                  fill={`url(#screwGradient-${index})`}
                />

                {/* Hex recess (Allen key hole) */}
                <polygon
                  points={createHexPoints(pos.x, pos.y, hexRadius)}
                  fill="rgba(15, 15, 15, 0.9)"
                />

                {/* Inner hex shadow for depth */}
                <polygon
                  points={createHexPoints(pos.x, pos.y, hexRadius * 0.7)}
                  fill="rgba(0, 0, 0, 0.6)"
                />

                {/* Subtle highlight reflection (top-left) */}
                <circle
                  cx={pos.x - innerRadius * 0.35}
                  cy={pos.y - innerRadius * 0.35}
                  r={innerRadius * 0.2}
                  fill="rgba(255, 255, 255, 0.2)"
                />
              </g>
            ))}
          </g>
        </svg>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
});
