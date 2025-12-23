import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface InsetWindowProps {
  variant: 'dark' | 'light';
  borderRadius?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  showGlassOverlay?: boolean;
}

/**
 * InsetWindow (Web) - CSS-based fallback for web build.
 * Uses expo-linear-gradient and box-shadow for visual effects.
 */
export const InsetWindow: React.FC<InsetWindowProps> = ({
  variant,
  borderRadius = 6,
  children,
  style,
  showGlassOverlay = false,
}) => {
  // Variant-specific colors
  const isDark = variant === 'dark';
  const backgroundColor = isDark ? '#2a2a2a' : Colors.softWhite;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius,
          // CSS box-shadow for inset effect
          shadowColor: 'rgba(0,0,0,0.4)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 6,
        },
        style,
      ]}
    >
      {/* Glass overlay gradient */}
      {showGlassOverlay && (
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']
          }
          style={[styles.glassOverlay, { borderRadius }]}
          pointerEvents="none"
        />
      )}

      {/* Content */}
      <View style={styles.content}>{children}</View>
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
    zIndex: 1,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
