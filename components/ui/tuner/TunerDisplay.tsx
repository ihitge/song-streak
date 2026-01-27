/**
 * TunerDisplay Component
 *
 * Needle-style VU meter tuner display with:
 * - Animated needle showing cents deviation
 * - Note name display (C, C#, D, etc.)
 * - Octave indicator
 * - Color-coded accuracy feedback
 * - FLAT/SHARP direction labels
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { SHADOWS, BEVELS } from '@/constants/Styles';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';
import { PivotScrew } from '@/components/ui/PivotScrew';
import { getDeviationColor } from '@/utils/tuning/getDeviationColor';
import { IN_TUNE_THRESHOLD, A4_FREQUENCY } from '@/constants/TunerConfig';
import type { SmoothedPitchResult } from '@/types/tuner';
import type { StringConfig } from '@/constants/TunerConfig';

interface TunerDisplayProps {
  /** Smoothed pitch result from Kalman filter */
  pitch: SmoothedPitchResult | null;
  /** Target string being tuned */
  targetString: StringConfig | null;
  /** Whether currently in tune */
  isInTune: boolean;
  /** Whether tuner is listening */
  isListening: boolean;
  /** Whether compact mode */
  compact?: boolean;
  /** Whether embedded in another component (removes housing borders) */
  embedded?: boolean;
}

/**
 * TunerDisplay - Needle-style tuner visualization
 */
export const TunerDisplay: React.FC<TunerDisplayProps> = ({
  pitch,
  targetString,
  isInTune,
  isListening,
  compact = false,
  embedded = false,
}) => {
  const needleRotation = useRef(new Animated.Value(50)).current;

  // Cents markers for scale (-50 to +50)
  const centsMarkers = [
    { label: '-50', cents: -50, position: 0 },
    { label: '-25', cents: -25, position: 0.25 },
    { label: '0', cents: 0, position: 0.5 },
    { label: '+25', cents: 25, position: 0.75 },
    { label: '+50', cents: 50, position: 1 },
  ];

  // Calculate needle position from cents (-50 to +50 maps to 0-100)
  const needleValue = useMemo(() => {
    if (!pitch || !isListening) {
      return 50; // Center position when no pitch
    }
    // Clamp cents to -50 to +50 range and map to 0-100
    const clampedCents = Math.max(-50, Math.min(50, pitch.cents));
    return ((clampedCents + 50) / 100) * 100;
  }, [pitch, isListening]);

  // Get needle color based on cents deviation
  const needleColor = useMemo(() => {
    if (!pitch || !isListening) {
      return Colors.graphite;
    }
    return getDeviationColor(pitch.cents, isInTune);
  }, [pitch, isInTune, isListening]);

  // Animate needle to target position
  useEffect(() => {
    Animated.spring(needleRotation, {
      toValue: needleValue,
      tension: 80,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [needleValue, needleRotation]);

  // Map 0-100 to rotation: -45deg to +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  // Check if LED should be active (within ±10 cents of marker)
  const isLedActive = (markerCents: number): boolean => {
    if (!pitch || !isListening) return false;
    return Math.abs(pitch.cents - markerCents) <= 10;
  };

  // Get LED color based on proximity to center
  const getLedColor = (markerCents: number): string => {
    if (markerCents === 0) return Colors.moss; // Center LED is green
    return Math.abs(markerCents) <= 25 ? Colors.warning : Colors.vermilion;
  };

  // Note display
  const displayNote = pitch?.note ?? '--';
  const displayOctave = pitch?.octave ?? '';
  const displayCents = pitch ? Math.round(pitch.cents) : 0;
  const centsSign = displayCents > 0 ? '+' : '';

  return (
    <View style={[styles.housing, compact && styles.housingCompact, embedded && styles.housingEmbedded]}>
      {/* Meter face */}
      <InsetWindow
        variant="light"
        borderRadius={compact ? 8 : 12}
        style={{
          ...styles.meterFace,
          ...(compact ? styles.meterFaceCompact : {}),
        }}
        showGlassOverlay
      >
        {/* Scale markings with LEDs */}
        <View style={styles.scaleMarkings}>
          {centsMarkers.map((marker) => (
            <View
              key={marker.label}
              style={[
                styles.markerContainer,
                { left: `${marker.position * 100}%` },
              ]}
            >
              <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                {marker.label}
              </Text>
              <LEDIndicator
                size={compact ? 10 : 14}
                isActive={isLedActive(marker.cents)}
                color={isInTune && marker.cents === 0 ? Colors.moss : getLedColor(marker.cents)}
              />
            </View>
          ))}
        </View>

        {/* Direction labels */}
        <View style={styles.directionLabels}>
          <Text style={styles.directionText}>FLAT</Text>
          <Text style={styles.directionText}>SHARP</Text>
        </View>

        {/* Needle pivot and needle */}
        <View style={styles.needlePivot}>
          <Animated.View
            style={[
              styles.needle,
              compact && styles.needleCompact,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <LinearGradient
              colors={[needleColor, needleColor, 'rgba(255,255,255,0.3)', needleColor, needleColor]}
              locations={[0, 0.2, 0.5, 0.8, 1]}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          <PivotScrew compact={compact} />
        </View>
      </InsetWindow>

      {/* Combined signal + reference display */}
      <View style={styles.infoBar}>
        {/* Left: Reference pitch */}
        <Text style={styles.referenceText}>A4={A4_FREQUENCY}</Text>

        {/* Center: Note + Cents with LED */}
        <View style={styles.signalGroup}>
          <Text
            style={[
              styles.noteName,
              { color: isListening && pitch ? needleColor : Colors.graphite },
            ]}
          >
            {displayNote}
            {displayOctave !== '' && (
              <Text style={styles.octave}>{displayOctave}</Text>
            )}
          </Text>
          <Text
            style={[
              styles.centsValue,
              { color: isListening && pitch ? needleColor : Colors.graphite },
            ]}
          >
            {isListening && pitch ? `${centsSign}${displayCents}¢` : '—'}
          </Text>
          {isInTune && isListening && (
            <LEDIndicator size={8} isActive color={Colors.moss} />
          )}
        </View>

        {/* Right: Frequency readout */}
        <Text style={styles.frequencyText}>
          {isListening && pitch ? `${Math.round(pitch.frequency)}Hz` : '—'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    width: 310,
    backgroundColor: Colors.ink,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...BEVELS.housing,
    ...SHADOWS.housing,
  },
  housingCompact: {
    width: 260,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  housingEmbedded: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  meterFace: {
    width: 280,
    height: 112,
    borderRadius: 12,
  },
  meterFaceCompact: {
    width: 230,
    height: 90,
    borderRadius: 8,
  },
  scaleMarkings: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    height: 40,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 4,
    transform: [{ translateX: -12 }],
  },
  markerLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 11,
    color: Colors.warmGray,
  },
  markerLabelCompact: {
    fontSize: 9,
  },
  directionLabels: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  directionText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
  },
  needlePivot: {
    position: 'absolute',
    bottom: 15,
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
    height: 72,
    transformOrigin: 'bottom center',
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  needleCompact: {
    height: 56,
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
  infoBar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  referenceText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.graphite,
    minWidth: 55,
  },
  signalGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  noteName: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  octave: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
  },
  centsValue: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  frequencyText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.graphite,
    minWidth: 55,
    textAlign: 'right',
  },
});
