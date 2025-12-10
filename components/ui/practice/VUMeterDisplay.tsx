import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { ACHIEVEMENTS, formatPracticeTime, calculateProgress } from '@/types/practice';

interface VUMeterDisplayProps {
  totalSeconds: number;
  compact?: boolean;
}

/**
 * Skeuomorphic VU Meter display for total practice time
 * Analog-style needle meter with LED threshold indicators
 */
export const VUMeterDisplay: React.FC<VUMeterDisplayProps> = ({
  totalSeconds,
  compact = false,
}) => {
  const needleRotation = useRef(new Animated.Value(0)).current;

  // Calculate progress (0-100) and map to needle rotation (-45 to +45 degrees)
  const progress = calculateProgress(totalSeconds);

  useEffect(() => {
    // Animate needle to new position
    Animated.spring(needleRotation, {
      toValue: progress,
      tension: 50,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [progress, needleRotation]);

  // Map progress to rotation: 0% = -45deg, 100% = +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  // Scale markers for the VU meter (logarithmic feel)
  const scaleMarkers = [
    { label: '-20', time: '5m', threshold: 300 },
    { label: '-10', time: '30m', threshold: 1800 },
    { label: '-5', time: '1h', threshold: 3600 },
    { label: '0', time: '3h', threshold: 10800 },
    { label: '+3', time: '10h', threshold: 36000 },
  ];

  return (
    <View style={[styles.housing, compact && styles.housingCompact]}>
      {/* VU label */}
      <Text style={[styles.vuLabel, compact && styles.vuLabelCompact]}>VU</Text>

      {/* Meter face */}
      <View style={[styles.meterFace, compact && styles.meterFaceCompact]}>
        {/* Scale arc background */}
        <View style={styles.scaleArc}>
          {/* Scale markings */}
          <View style={styles.scaleMarkings}>
            {scaleMarkers.map((marker, index) => (
              <View key={marker.label} style={styles.markerContainer}>
                <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                  {marker.label}
                </Text>
                <View
                  style={[
                    styles.ledIndicator,
                    compact && styles.ledIndicatorCompact,
                    totalSeconds >= marker.threshold && styles.ledActive,
                  ]}
                />
                <Text style={[styles.timeLabel, compact && styles.timeLabelCompact]}>
                  {marker.time}
                </Text>
              </View>
            ))}
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
              colors={[Colors.vermilion, '#cc3300']}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          {/* Pivot screw */}
          <View style={[styles.pivotScrew, compact && styles.pivotScrewCompact]} />
        </View>
      </View>

      {/* Time display */}
      <View style={[styles.timeDisplay, compact && styles.timeDisplayCompact]}>
        <Text style={[styles.timeValue, compact && styles.timeValueCompact]}>
          {formatPracticeTime(totalSeconds)}
        </Text>
        <Text style={[styles.timeLabel2, compact && styles.timeLabel2Compact]}>
          TOTAL PRACTICE
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    backgroundColor: Colors.ink,
    borderRadius: 16,
    padding: 20,
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
    borderRadius: 12,
    padding: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  vuLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.vermilion,
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
    height: 140,
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    // Inset effect
    borderTopWidth: 3,
    borderTopColor: 'rgba(0,0,0,0.2)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.8)',
  },
  meterFaceCompact: {
    width: 200,
    height: 100,
    borderRadius: 8,
  },
  scaleArc: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    height: 80,
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
    fontSize: 12,
    color: Colors.charcoal,
  },
  markerLabelCompact: {
    fontSize: 9,
  },
  ledIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.graphite,
    opacity: 0.4,
  },
  ledIndicatorCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ledActive: {
    backgroundColor: Colors.moss,
    opacity: 1,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
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
    width: 4,
    height: 90,
    transformOrigin: 'bottom center',
  },
  needleCompact: {
    height: 65,
    width: 3,
  },
  needleBody: {
    flex: 1,
    width: '100%',
    borderRadius: 2,
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
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 3,
    marginTop: 4,
  },
  timeLabel2Compact: {
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 2,
  },
});
