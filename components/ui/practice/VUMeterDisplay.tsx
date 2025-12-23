import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { ACHIEVEMENTS, formatPracticeTime, calculateProgress } from '@/types/practice';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';

/**
 * VU Meter mode
 * - 'progress': Shows practice time progress (default)
 * - 'metronome': Shows pendulum swing for metronome beats
 */
type VUMeterMode = 'progress' | 'metronome';

interface VUMeterDisplayProps {
  totalSeconds?: number;              // For progress mode (optional in metronome mode)
  compact?: boolean;
  fullWidth?: boolean;                // Full viewport width, no rounded corners
  mode?: VUMeterMode;                 // Default: 'progress'
  beatPosition?: number;              // 0 (left) or 1 (right) for metronome pendulum
  isMetronomePlaying?: boolean;       // For LED beat effects
  currentBeat?: number;               // Current beat number (1-indexed)
  beatsPerMeasure?: number;           // Total beats in measure
  sessionSeconds?: number;            // Session time for metronome mode display
  sessionLabel?: string;              // Custom label (default: 'SESSION TIME' or 'TOTAL PRACTICE')
  showTimeDisplay?: boolean;          // Show embedded time display (default: true)
  headerContent?: React.ReactNode;    // Content to render at top of housing (e.g., time signature)
  children?: React.ReactNode;         // Content to render at bottom of housing (e.g., BPM display)
}

/**
 * Skeuomorphic VU Meter display with dual modes:
 * - Progress mode: Shows total practice time with static needle position
 * - Metronome mode: Shows pendulum swing for metronome beats
 */
export const VUMeterDisplay: React.FC<VUMeterDisplayProps> = ({
  totalSeconds = 0,
  compact = false,
  fullWidth = false,
  mode = 'progress',
  beatPosition = 0.5,
  isMetronomePlaying = false,
  currentBeat = 1,
  beatsPerMeasure = 4,
  sessionSeconds,
  sessionLabel,
  showTimeDisplay = true,
  headerContent,
  children,
}) => {
  const needleRotation = useRef(new Animated.Value(50)).current;

  // Calculate target value based on mode
  const targetValue = useMemo(() => {
    if (mode === 'metronome') {
      // Map beatPosition 0-1 to 0-100 for needle rotation
      // 0 = left (-45deg), 1 = right (+45deg)
      return beatPosition * 100;
    }
    // Progress mode: calculate from totalSeconds
    return calculateProgress(totalSeconds);
  }, [mode, beatPosition, totalSeconds]);

  useEffect(() => {
    // Animate needle to new position
    // Use different spring parameters for each mode
    const springConfig = mode === 'metronome'
      ? { tension: 120, friction: 8 }   // Snappy for pendulum
      : { tension: 50, friction: 10 };  // Smooth for progress

    Animated.spring(needleRotation, {
      toValue: targetValue,
      ...springConfig,
      useNativeDriver: true,
    }).start();
  }, [targetValue, needleRotation, mode]);

  // Map progress to rotation: 0% = -45deg, 100% = +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  // Scale markers for the VU meter (logarithmic feel) - used in progress mode
  const progressMarkers = [
    { label: '-20', time: '5m', threshold: 300 },
    { label: '-10', time: '30m', threshold: 1800 },
    { label: '-5', time: '1h', threshold: 3600 },
    { label: '0', time: '3h', threshold: 10800 },
    { label: '+3', time: '10h', threshold: 36000 },
  ];

  // Beat markers for metronome mode - show beat numbers
  const beatMarkers = useMemo(() => {
    // Generate beat markers based on beats per measure
    const markers = [];
    for (let i = 1; i <= beatsPerMeasure; i++) {
      markers.push({
        label: String(i),
        beat: i,
      });
    }
    return markers;
  }, [beatsPerMeasure]);

  // Determine which LED is active in metronome mode
  const isLedActiveForBeat = (beatNum: number): boolean => {
    if (mode !== 'metronome' || !isMetronomePlaying) return false;
    return beatNum === currentBeat;
  };



  // Time display values
  const displaySeconds = mode === 'metronome' && sessionSeconds !== undefined
    ? sessionSeconds
    : totalSeconds;
  const displayLabel = sessionLabel
    ? sessionLabel
    : mode === 'metronome'
      ? 'SESSION TIME'
      : 'TOTAL PRACTICE';

  return (
    <View style={[styles.housing, compact && styles.housingCompact, fullWidth && styles.housingFullWidth]}>
      {/* Header content (e.g., time signature selector) */}
      {headerContent && (
        <View style={[styles.headerContainer, compact && styles.headerContainerCompact]}>
          {headerContent}
        </View>
      )}

      {/* VU label - shows BPM indicator in metronome mode */}
      <Text style={[styles.vuLabel, compact && styles.vuLabelCompact]}>
        {mode === 'metronome' ? 'BPM' : 'VU'}
      </Text>

      {/* Meter face */}
      <InsetWindow
        variant="light"
        borderRadius={compact ? 8 : 12}
        style={[styles.meterFace, compact && styles.meterFaceCompact]}
        showGlassOverlay
      >
        {/* Scale arc background */}
        <View style={styles.scaleArc}>
          {/* Scale markings - different for each mode */}
          <View style={styles.scaleMarkings}>
            {mode === 'metronome' ? (
              // Metronome mode: show beat numbers
              beatMarkers.map((marker) => (
                <View key={marker.label} style={styles.markerContainer}>
                  <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                    {marker.label}
                  </Text>
                  <LEDIndicator
                    size={compact ? 12 : 16}
                    isActive={isLedActiveForBeat(marker.beat)}
                    color={marker.beat === 1 ? '#FF6B35' : '#16A34A'}
                  />
                  <Text style={[styles.timeLabel, compact && styles.timeLabelCompact]}>
                    ·
                  </Text>
                </View>
              ))
            ) : (
              // Progress mode: show time thresholds
              progressMarkers.map((marker) => (
                <View key={marker.label} style={styles.markerContainer}>
                  <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                    {marker.label}
                  </Text>
                  <LEDIndicator
                    size={compact ? 12 : 16}
                    isActive={totalSeconds >= marker.threshold}
                    color={Colors.moss}
                  />
                  <Text style={[styles.timeLabel, compact && styles.timeLabelCompact]}>
                    {marker.time}
                  </Text>
                </View>
              ))
            )}
          </View>
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
              colors={['#cc3300', Colors.vermilion, '#ff8866', Colors.vermilion, '#cc3300']}
              locations={[0, 0.2, 0.5, 0.8, 1]}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          {/* Pivot screw */}
          <View style={[styles.pivotScrew, compact && styles.pivotScrewCompact]} />
        </View>
      </InsetWindow>

      {/* Time display - conditionally rendered */}
      {showTimeDisplay && (
        <View style={[styles.timeDisplay, compact && styles.timeDisplayCompact]}>
          <Text style={[styles.timeValue, compact && styles.timeValueCompact]}>
            {formatPracticeTime(displaySeconds)}
          </Text>
          <Text style={[styles.timeLabel2, compact && styles.timeLabel2Compact]}>
            {displayLabel}
          </Text>
        </View>
      )}

      {/* Custom content at bottom of housing (e.g., BPM display) */}
      {children && (
        <View style={[styles.childrenContainer, compact && styles.childrenContainerCompact]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    width: 310,
    backgroundColor: Colors.ink,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  housingCompact: {
    width: 218,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  housingFullWidth: {
    width: '100%',
    borderRadius: 0,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  headerContainerCompact: {
    marginBottom: 6,
  },
  vuLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: 'transparent',
    letterSpacing: 4,
    marginBottom: 8,
  },
  vuLabelCompact: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  meterFace: {
    width: 280,
    height: 112,
    borderRadius: 12,
  },
  meterFaceCompact: {
    width: 200,
    height: 80,
    borderRadius: 8,
  },
  scaleArc: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 64,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scaleMarkings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 10,
  },
  markerContainer: {
    alignItems: 'center',
    gap: 2,
  },
  markerLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 24,
    color: Colors.warmGray,
  },
  markerLabelCompact: {
    fontSize: 18,
  },

  timeLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 8,
    color: Colors.warmGray,
  },
  timeLabelCompact: {
    fontSize: 6,
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
    // Drop shadow for depth
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  needleCompact: {
    height: 52,
    width: 2,
  },
  needleBody: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    // Highlight edge for 3D effect
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
  timeDisplay: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    // Inset
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  timeDisplayCompact: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  timeValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 28,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  timeValueCompact: {
    fontSize: 20,
    letterSpacing: 1,
  },
  timeLabel2: {
    ...Typography.label,
    color: Colors.vermilion,
    marginTop: 4,
  },
  timeLabel2Compact: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.vermilion,
    marginTop: 2,
  },
  childrenContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  childrenContainerCompact: {
    marginTop: 10,
  },
});
