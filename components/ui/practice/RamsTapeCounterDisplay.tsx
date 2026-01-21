import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay } from '@/components/skia/primitives/InsetShadowOverlay';
import { SurfaceTextureOverlay } from '@/components/skia/primitives/SurfaceTextureOverlay';

interface RamsTapeCounterDisplayProps {
  seconds: number;
  compact?: boolean;
  fullWidth?: boolean;  // Full viewport width, no rounded corners
  label?: string;  // Custom label (default: 'ELAPSED')
}

/**
 * Skeuomorphic mechanical tape counter display
 * Inspired by vintage VU meters and tape deck counters
 */
export const RamsTapeCounterDisplay: React.FC<RamsTapeCounterDisplayProps> = ({
  seconds,
  compact = false,
  fullWidth = false,
  label = 'ELAPSED',
}) => {
  // Format seconds into MM:SS
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(remainingSeconds).padStart(2, '0');

  const digits = [
    displayMinutes[0],
    displayMinutes[1],
    displaySeconds[0],
    displaySeconds[1],
  ];

  return (
    <View style={[styles.housing, compact && styles.housingCompact, fullWidth && styles.housingFullWidth]}>
      {/* Inner recessed well */}
      <View style={[styles.recessedWell, compact && styles.recessedWellCompact]}>
        {/* Digit wheels container */}
        <View style={styles.digitsContainer}>
          {/* Minutes digits */}
          <DigitWheel digit={digits[0]} compact={compact} />
          <DigitWheel digit={digits[1]} compact={compact} />

          {/* Mechanical spacer between MM and SS */}
          <View style={[styles.spacer, compact && styles.spacerCompact]}>
            <View style={[styles.spacerDot, compact && styles.spacerDotCompact]} />
            <View style={[styles.spacerDot, compact && styles.spacerDotCompact]} />
          </View>

          {/* Seconds digits */}
          <DigitWheel digit={digits[2]} compact={compact} />
          <DigitWheel digit={digits[3]} compact={compact} />
        </View>

        {/* Cylinder reflection overlay */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.15)',
            'rgba(255,255,255,0.05)',
            'rgba(0,0,0,0.05)',
            'rgba(0,0,0,0.2)',
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.cylinderOverlay}
          pointerEvents="none"
        />
      </View>

      {/* Label */}
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
    </View>
  );
};

/**
 * Individual digit wheel with 3D mechanical appearance
 */
const DigitWheel: React.FC<{ digit: string; compact?: boolean }> = ({ digit, compact = false }) => {
  // Dimensions based on compact mode - wider and shallower for better proportions
  const width = compact ? 26 : 40;
  const height = compact ? 28 : 36;
  const borderRadius = compact ? 2 : 3;

  return (
    <View style={styles.digitWheelContainer}>
      <View style={[styles.digitWheel, compact && styles.digitWheelCompact]}>
        <Text style={[styles.digitText, compact && styles.digitTextCompact]}>{digit}</Text>
      </View>
      {/* Inner shadow for depth */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.15)',
        ]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.digitInnerShadow}
        pointerEvents="none"
      />
      {/* Layer 1: Inset shadow for recessed depth */}
      <InsetShadowOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        insetDepth={compact ? 4 : 5}
        shadowIntensity={0.7}
      />
      {/* Layer 2: Glass overlay on individual digit */}
      <GlassOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        glareOpacity={0.2}
        specularOpacity={0.3}
      />
      {/* Layer 3: Surface texture for dust/scratches */}
      <SurfaceTextureOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        textureOpacity={0.025}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    width: 310,  // Match VU meter housing width
    backgroundColor: Colors.ink,
    borderRadius: 8,
    paddingVertical: 8,  // Reduced vertical padding
    paddingHorizontal: 12,
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  housingCompact: {
    width: 218,  // Match VU meter compact width
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  housingFullWidth: {
    width: '100%',
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingBottom: 0,
  },
  recessedWell: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    paddingVertical: 6,  // Reduced vertical padding
    paddingHorizontal: 10,
    // Inset effect
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  recessedWellCompact: {
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  digitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  digitWheelContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,  // Reduced from 4
  },
  digitWheel: {
    width: 40,  // Wider for better proportions
    height: 36,  // Shallower to save vertical space
    backgroundColor: Colors.softWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    // Subtle emboss
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  digitWheelCompact: {
    width: 26,  // Wider
    height: 28,  // Shallower
    borderRadius: 2,
  },
  digitText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 22,  // Adjusted for shallower digit wheels
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  digitTextCompact: {
    fontSize: 16,
  },
  digitInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,  // Reduced from 4
  },
  spacer: {
    width: 14,  // Wider spacing
    height: 36,  // Match digit wheel height
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  spacerCompact: {
    width: 10,
    height: 28,  // Match compact digit wheel height
    gap: 4,
  },
  spacerDot: {
    width: 4,  // Reduced from 6
    height: 4,  // Reduced from 6
    borderRadius: 2,  // Reduced from 3
    backgroundColor: Colors.vermilion,
    // Glow effect
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,  // Reduced from 4
  },
  spacerDotCompact: {
    width: 3,  // Reduced from 4
    height: 3,  // Reduced from 4
    borderRadius: 1.5,  // Reduced from 2
  },
  cylinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,  // Reduced from 8
  },
  label: {
    ...Typography.label,
    marginTop: 6,
  },
  labelCompact: {
    ...Typography.label,
    fontSize: 8,
    marginTop: 4,
  },
});
