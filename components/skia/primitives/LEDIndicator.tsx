import React from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  LinearGradient,
  vec,
  BlurMask,
} from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';

interface LEDIndicatorProps {
  size?: number;
  isActive: boolean;
  color?: string;
}

export const LEDIndicator: React.FC<LEDIndicatorProps> = ({
  size = 16,
  isActive,
  color = Colors.vermilion,
}) => {
  // Visual configuration
  // The canvas needs to be larger than the size to accommodate the bloom/glow
  const padding = 12; 
  const canvasSize = size + padding * 2;
  const center = canvasSize / 2;
  const radius = size / 2;
  
  const bezelWidth = size * 0.15; // 15% bezel
  const lensRadius = radius - bezelWidth;

  // Off-state colors (Dark, muted lens)
  const offColorCenter = Colors.charcoal;
  const offColorEdge = '#111111';

  return (
    <View style={{ width: size, height: size }}>
      <Canvas
        style={{
          width: canvasSize,
          height: canvasSize,
          position: 'absolute',
          top: -padding,
          left: -padding,
          // Ensure it renders on top if needed, though zIndex works on View
        }}
      >
        <Group>
          {/* 1. Outer Bloom (Glow) - Only when active */}
          {isActive && (
            <Circle cx={center} cy={center} r={radius}>
              <BlurMask blur={8} style="normal" />
              <RadialGradient
                c={vec(center, center)}
                r={radius}
                colors={[color, 'transparent']}
                positions={[0.5, 1]}
              />
            </Circle>
          )}

          {/* 2. Metal Bezel */}
          {/* Dark ring housing the LED */}
          <Circle cx={center} cy={center} r={radius}>
            <LinearGradient
              start={vec(center - radius, center - radius)}
              end={vec(center + radius, center + radius)}
              colors={['#555555', '#1a1a1a']} // Highlight top-left, Shadow bottom-right
            />
          </Circle>
          {/* Inner bezel shadow to create depth */}
          <Circle cx={center} cy={center} r={radius - 1} color="#000000" style="stroke" strokeWidth={1} opacity={0.5} />

          {/* 3. Glass Lens */}
          <Group>
             <Circle cx={center} cy={center} r={lensRadius}>
               <RadialGradient
                 c={vec(center, center)}
                 r={lensRadius}
                 colors={isActive 
                   ? ['#ffffff', color, color]  // Active: Hot center -> Color body
                   : ['rgba(255,255,255,0.08)', offColorCenter, offColorEdge] // Inactive: Faint white center -> Dark
                 }
                 positions={isActive ? [0, 0.4, 1] : [0, 0.4, 1]}
               />
             </Circle>

             {/* Inner Bloom (Lens internal glow) */}
             {isActive && (
               <Circle cx={center} cy={center} r={lensRadius}>
                 <BlurMask blur={3} style="normal" />
                 <LinearGradient
                    start={vec(center - lensRadius, center - lensRadius)}
                    end={vec(center + lensRadius, center + lensRadius)}
                    colors={['rgba(255,255,255,0.5)', 'transparent']}
                 />
               </Circle>
             )}
          </Group>

          {/* 4. Highlight Reflection (Convex Glass Look) */}
          <Circle
            cx={center - lensRadius * 0.35}
            cy={center - lensRadius * 0.35}
            r={lensRadius * 0.25}
            color="white"
            opacity={isActive ? 0.5 : 0.2}
          >
             <BlurMask blur={1} style="normal" />
          </Circle>
        </Group>
      </Canvas>
    </View>
  );
};
