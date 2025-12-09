import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface RamsTapeCounterDisplayProps {
  seconds: number;
}

/**
 * Skeuomorphic mechanical tape counter display
 * Inspired by vintage VU meters and tape deck counters
 */
export const RamsTapeCounterDisplay: React.FC<RamsTapeCounterDisplayProps> = ({ seconds }) => {
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
    <View style={styles.housing}>
      {/* Inner recessed well */}
      <View style={styles.recessedWell}>
        {/* Digit wheels container */}
        <View style={styles.digitsContainer}>
          {/* Minutes digits */}
          <DigitWheel digit={digits[0]} />
          <DigitWheel digit={digits[1]} />

          {/* Mechanical spacer between MM and SS */}
          <View style={styles.spacer}>
            <View style={styles.spacerDot} />
            <View style={styles.spacerDot} />
          </View>

          {/* Seconds digits */}
          <DigitWheel digit={digits[2]} />
          <DigitWheel digit={digits[3]} />
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
      <Text style={styles.label}>ELAPSED</Text>
    </View>
  );
};

/**
 * Individual digit wheel with 3D mechanical appearance
 */
const DigitWheel: React.FC<{ digit: string }> = ({ digit }) => {
  return (
    <View style={styles.digitWheelContainer}>
      <View style={styles.digitWheel}>
        <Text style={styles.digitText}>{digit}</Text>
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
  digitText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 36,
    color: Colors.charcoal,
    letterSpacing: -1,
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
});
