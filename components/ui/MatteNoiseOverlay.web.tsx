import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MatteNoiseOverlayProps {
  /**
   * Opacity of the noise texture (0-1)
   * Default: 0.04 for subtle matte grain effect
   */
  opacity?: number;
}

/**
 * Matte noise overlay for dark surfaces (Web version)
 * Uses SVG turbulence filter for procedural noise
 */
export const MatteNoiseOverlay: React.FC<MatteNoiseOverlayProps> = ({
  opacity = 0.04,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* SVG filter definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="matteNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              seed="123"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="monoNoise"
            />
            <feBlend
              mode="overlay"
              in="SourceGraphic"
              in2="monoNoise"
            />
          </filter>
        </defs>
      </svg>
      {/* Noise overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: opacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      />
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
    zIndex: 0,
    overflow: 'hidden',
  },
});
