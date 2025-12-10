import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface RamsTapeCounterDisplayProps {
  seconds: number;
  compact?: boolean;
}

/**
 * Skeuomorphic mechanical tape counter display
 * Inspired by vintage VU meters and tape deck counters
 */
export const RamsTapeCounterDisplay: React.FC<RamsTapeCounterDisplayProps> = ({
  seconds,
  compact = false,
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
    <View style={[styles.housing, compact && styles.housingCompact]}>
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
      <Text style={[styles.label, compact && styles.labelCompact]}>ELAPSED</Text>
    </View>
  );
};

/**
 * Individual digit wheel with 3D mechanical appearance
 */
const DigitWheel: React.FC<{ digit: string; compact?: boolean }> = ({ digit, compact = false }) => {
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
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    backgroundColor: Colors.ink,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  housingCompact: {
    borderRadius: 8,
    padding: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  recessedWell: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
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
    borderRadius: 6,
    padding: 8,
  },
  digitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  digitWheelContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  digitWheel: {
    width: 48,
    height: 64,
    backgroundColor: Colors.softWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    // Subtle emboss
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  digitWheelCompact: {
    width: 32,
    height: 44,
    borderRadius: 3,
  },
  digitText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 36,
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  digitTextCompact: {
    fontSize: 24,
  },
  digitInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },
  spacer: {
    width: 16,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  spacerCompact: {
    width: 12,
    height: 44,
    gap: 6,
  },
  spacerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.vermilion,
    // Glow effect
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  spacerDotCompact: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  cylinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
  },
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 3,
    marginTop: 12,
  },
  labelCompact: {
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 8,
  },
});
