import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, ViewStyle } from 'react-native';
import { Canvas, Box, BoxShadow, rrect, rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';

interface InsetWindowProps {
  variant: 'dark' | 'light';
  borderRadius?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Reusable Skia-based inset window with glass effect.
 * Supports dark (for controls) and light (for displays) variants.
 */
export const InsetWindow: React.FC<InsetWindowProps> = ({
  variant,
  borderRadius = 6,
  children,
  style,
}) => {
  const [dimensions, setDimensions] = useState({ width: 200, height: 100 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const { width, height } = dimensions;

  // Variant-specific colors
  const isDark = variant === 'dark';
  const backgroundColor = isDark ? '#2a2a2a' : Colors.softWhite;
  const innerShadowColor = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.40)';
  const outerHighlightColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,1)';
  const glassGradientColors = isDark
    ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']
    : ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)'];

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {/* Skia background with inset shadows */}
      <Canvas style={StyleSheet.absoluteFill}>
        <Box
          box={rrect(rect(0, 0, width, height), borderRadius, borderRadius)}
          color={backgroundColor}
        >
          <BoxShadow dx={0} dy={2} blur={6} color={innerShadowColor} inner />
          <BoxShadow dx={0} dy={-1} blur={2} color={outerHighlightColor} />
        </Box>
      </Canvas>

      {/* Glass overlay gradient */}
      <View style={styles.glassOverlay} pointerEvents="none">
        <Canvas style={StyleSheet.absoluteFill}>
          <Box box={rrect(rect(0, 0, width, height / 2), 0, 0)}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height / 2)}
              colors={glassGradientColors}
            />
          </Box>
        </Canvas>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
