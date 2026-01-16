/**
 * TunerVUMeter Component
 *
 * VU-style swing meter for the guitar tuner showing:
 * - Swing needle based on cents deviation (-50 to +50)
 * - Center = 0 cents (in tune)
 * - Left swing = flat, Right swing = sharp
 * - LED indicators at scale positions
 * - In-tune glow effect
 *
 * Design matches VUMeterDisplay from Metronome.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography, SHADOWS, BEVELS } from '@/constants/Styles';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';
import { getDeviationColor } from '@/utils/tuning/getDeviationColor';
import { PivotScrew } from '@/components/ui/PivotScrew';
import type { TuningDirection, GuitarString } from '@/types/tuner';

interface TunerVUMeterProps {
  /** Cents deviation from target (-50 to +50 range shown) */
  cents: number | null;
  /** Direction indicator */
  direction: TuningDirection;
  /** Whether currently in tune */
  isInTune: boolean;
  /** Whether tuner is actively listening */
  isActive: boolean;
  /** Currently detected string */
  detectedString: GuitarString | null;
  /** Compact mode */
  compact?: boolean;
}

// Scale markers for the VU meter
const SCALE_MARKERS = [
  { label: '-50', cents: -50, position: 0 },
  { label: '-25', cents: -25, position: 0.25 },
  { label: '0', cents: 0, position: 0.5 },
  { label: '+25', cents: 25, position: 0.75 },
  { label: '+50', cents: 50, position: 1 },
];

// Note: getDeviationColor is now imported from @/utils/tuning/getDeviationColor

export const TunerVUMeter: React.FC<TunerVUMeterProps> = ({
  cents,
  direction,
  isInTune,
  isActive,
  detectedString,
  compact = false,
}) => {
  const needleRotation = useRef(new Animated.Value(50)).current;

  // Calculate target value from cents
  useEffect(() => {
    if (cents === null || !isActive) {
      // Reset to center when inactive
      Animated.spring(needleRotation, {
        toValue: 50, // Center position
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }).start();
      return;
    }

    // Map cents (-50 to +50) to position (0 to 100)
    // Clamp to prevent needle going off scale
    const clampedCents = Math.max(-50, Math.min(50, cents));
    const targetValue = ((clampedCents + 50) / 100) * 100;

    Animated.spring(needleRotation, {
      toValue: targetValue,
      tension: 120,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [cents, isActive, needleRotation]);

  // Map progress to rotation: 0% = -45deg, 100% = +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  const needleColor = getDeviationColor(cents, isInTune);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Note Display - large note name (only shown when string detected) */}
      {detectedString && (
        <View style={styles.noteDisplay}>
          <Text style={[styles.noteName, isInTune && styles.noteNameInTune]}>
            {detectedString.note}
          </Text>
          <Text style={styles.stringSubLabel}>
            {detectedString.stringNumber === 1
              ? '1st'
              : detectedString.stringNumber === 2
                ? '2nd'
                : detectedString.stringNumber === 3
                  ? '3rd'
                  : `${detectedString.stringNumber}th`}{' '}
            String
          </Text>
        </View>
      )}

      {/* Meter section with label */}
      <View style={styles.meterSection}>
        <Text style={styles.sectionLabel}>
          {detectedString ? 'METER' : 'PLAY A STRING'}
        </Text>

        {/* VU Meter Face */}
        <InsetWindow
          variant="light"
          borderRadius={compact ? 8 : 12}
          style={compact ? styles.meterFaceCompact : styles.meterFace}
          showGlassOverlay
        >
        {/* Scale markings with LEDs */}
        <View style={styles.scaleMarkings}>
          {SCALE_MARKERS.map((marker) => {
            // LED is active when cents is near this marker
            const isLedActive =
              isActive &&
              cents !== null &&
              Math.abs(cents - marker.cents) <= 12.5;

            return (
              <View key={marker.label} style={styles.markerContainer}>
                <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                  {marker.label}
                </Text>
                <LEDIndicator
                  size={compact ? 10 : 14}
                  isActive={isLedActive}
                  color={marker.cents === 0 ? Colors.moss : Colors.vermilion}
                />
              </View>
            );
          })}
        </View>

        {/* Data displays in bottom corners */}
        <View style={styles.cornerDataLeft}>
          <Text style={styles.cornerDataLabel}>FREQUENCY</Text>
          <Text style={styles.cornerDataValue}>
            {detectedString && isActive
              ? `${detectedString.frequency.toFixed(1)} Hz`
              : '--- Hz'}
          </Text>
        </View>

        <View style={styles.cornerDataRight}>
          <Text style={styles.cornerDataLabel}>DEVIATION</Text>
          <Text
            style={[
              styles.cornerDataValue,
              cents !== null && {
                color: getDeviationColor(cents, isInTune),
              },
            ]}
          >
            {cents !== null
              ? `${cents >= 0 ? '+' : ''}${cents.toFixed(0)} ¢`
              : '--- ¢'}
          </Text>
        </View>

        {/* Needle pivot point and needle */}
        <View style={styles.needlePivot}>
          <Animated.View
            style={[
              styles.needle,
              compact && styles.needleCompact,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <LinearGradient
              colors={[
                needleColor,
                needleColor,
                'rgba(255,255,255,0.3)',
                needleColor,
                needleColor,
              ]}
              locations={[0, 0.2, 0.5, 0.8, 1]}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          {/* Pivot screw */}
          <PivotScrew compact={compact} />
        </View>

        {/* In-tune glow overlay */}
        {isInTune && (
          <View style={styles.inTuneGlow} pointerEvents="none" />
        )}
        </InsetWindow>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  containerCompact: {
    gap: 8,
  },
  meterSection: {
    width: '100%',
    gap: 8,
  },
  sectionLabel: Typography.label,
  noteDisplay: {
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  stringSubLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
    marginTop: -4,
  },
  noteName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 40,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  noteNameInTune: {
    color: Colors.moss,
  },
  meterFace: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  meterFaceCompact: {
    width: '100%',
    height: 90,
    borderRadius: 8,
  },
  scaleMarkings: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  markerContainer: {
    alignItems: 'center',
    gap: 4,
  },
  markerLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.warmGray,
  },
  markerLabelCompact: {
    fontSize: 10,
  },
  cornerDataLeft: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    alignItems: 'flex-start',
  },
  cornerDataRight: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    alignItems: 'flex-end',
  },
  cornerDataLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 7,
    letterSpacing: 1,
    color: Colors.warmGray,
    marginBottom: 1,
  },
  cornerDataValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 11,
    color: Colors.charcoal,
  },
  needlePivot: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 80,
    transformOrigin: 'bottom center',
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  needleCompact: {
    height: 60,
    width: 2,
  },
  needleBody: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  pivotScrew: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
    position: 'absolute',
    bottom: 0,
  },
  pivotScrewCompact: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  inTuneGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(65, 123, 90, 0.15)',
    borderRadius: 12,
  },
});
