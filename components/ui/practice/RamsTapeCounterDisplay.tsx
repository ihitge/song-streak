import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { GlassOverlay } from '@/components/ui/GlassOverlay';

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
  // Dimensions based on compact mode
  const width = compact ? 22 : 34;
  const height = compact ? 31 : 45;
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
      {/* Glass overlay on individual digit */}
      <GlassOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        glareOpacity={0.2}
        specularOpacity={0.3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    width: 310,  // Match VU meter housing width
    backgroundColor: Colors.ink,
    borderRadius: 8,  // Reduced from 12
    padding: 11,  // Reduced from 16
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },  // Reduced from 6
    shadowOpacity: 0.4,
    shadowRadius: 6,  // Reduced from 8
    elevation: 6,  // Reduced from 8
  },
  housingCompact: {
    width: 218,  // Match VU meter compact width (200 + 9*2 padding)
    borderRadius: 6,  // Reduced from 8
    padding: 7,  // Reduced from 10
    shadowOffset: { width: 0, height: 2 },  // Reduced from 3
    shadowRadius: 3,  // Reduced from 4
    elevation: 3,  // Reduced from 4
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
    borderRadius: 6,  // Reduced from 8
    padding: 8,  // Reduced from 12
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
    borderRadius: 4,  // Reduced from 6
    padding: 6,  // Reduced from 8
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
    width: 34,  // Reduced from 48
    height: 45,  // Reduced from 64
    backgroundColor: Colors.softWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,  // Reduced from 4
    // Subtle emboss
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  digitWheelCompact: {
    width: 22,  // Reduced from 32
    height: 31,  // Reduced from 44
    borderRadius: 2,  // Reduced from 3
  },
  digitText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 25,  // Reduced from 36
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  digitTextCompact: {
    fontSize: 17,  // Reduced from 24
  },
  digitInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,  // Reduced from 4
  },
  spacer: {
    width: 11,  // Reduced from 16
    height: 45,  // Reduced from 64
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,  // Reduced from 8
  },
  spacerCompact: {
    width: 8,  // Reduced from 12
    height: 31,  // Reduced from 44
    gap: 4,  // Reduced from 6
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
    color: Colors.warmGray,
    marginTop: 8,
  },
  labelCompact: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.warmGray,
    marginTop: 6,
  },
});
