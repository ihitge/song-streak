/**
 * RecorderVUMeter Component
 *
 * Dual-channel stereo VU meter for the voice recorder.
 * Shows real-time audio levels during recording/playback.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { InsetWindow } from '@/components/ui/InsetWindow';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';

interface RecorderVUMeterProps {
  /** Left channel level (0-1) */
  levelLeft?: number;
  /** Right channel level (0-1) */
  levelRight?: number;
  /** Whether currently recording */
  isRecording?: boolean;
  /** Whether currently playing */
  isPlaying?: boolean;
  /** Compact mode */
  compact?: boolean;
}

// VU meter scale markers
const VU_MARKERS = [
  { label: '-20', value: 0.1 },
  { label: '-10', value: 0.32 },
  { label: '-5', value: 0.56 },
  { label: '0', value: 0.79 },
  { label: '+3', value: 1.0 },
];

/**
 * Convert linear level (0-1) to display position (0-100)
 * Uses logarithmic scaling for natural VU meter feel
 */
function levelToPosition(level: number): number {
  if (level <= 0) return 0;
  // Logarithmic scaling
  const db = 20 * Math.log10(Math.max(level, 0.001));
  // Map -40dB to +3dB onto 0-100
  const minDb = -40;
  const maxDb = 3;
  const position = ((db - minDb) / (maxDb - minDb)) * 100;
  return Math.max(0, Math.min(100, position));
}

/**
 * Single VU meter channel with needle
 */
const VUChannel: React.FC<{
  level: number;
  label: string;
  compact: boolean;
}> = ({ level, label, compact }) => {
  const needleRotation = useRef(new Animated.Value(0)).current;

  // Animate needle to target position
  useEffect(() => {
    const targetPosition = levelToPosition(level);
    Animated.spring(needleRotation, {
      toValue: targetPosition,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [level, needleRotation]);

  // Map position to rotation: 0% = -45deg, 100% = +45deg
  const rotation = needleRotation.interpolate({
    inputRange: [0, 100],
    outputRange: ['-45deg', '45deg'],
  });

  // Determine if in "red" zone (above 0dB / 79%)
  const isInRed = level > 0.79;

  return (
    <View style={[styles.channelContainer, compact && styles.channelContainerCompact]}>
      {/* Channel label */}
      <Text style={[styles.channelLabel, compact && styles.channelLabelCompact]}>{label}</Text>

      {/* Meter face */}
      <View style={[styles.meterFace, compact && styles.meterFaceCompact]}>
        {/* Scale arc background gradient */}
        <LinearGradient
          colors={['#2a4a2a', '#4a4a2a', '#4a2a2a']}
          locations={[0, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scaleGradient}
        />

        {/* Scale markings */}
        <View style={styles.scaleMarkings}>
          {VU_MARKERS.map((marker, index) => (
            <View key={marker.label} style={styles.markerContainer}>
              <Text style={[styles.markerLabel, compact && styles.markerLabelCompact]}>
                {marker.label}
              </Text>
              <View style={[styles.markerTick, index >= 3 && styles.markerTickRed]} />
            </View>
          ))}
        </View>

        {/* Needle pivot and needle */}
        <View style={[styles.needlePivot, compact && styles.needlePivotCompact]}>
          <Animated.View
            style={[
              styles.needle,
              compact && styles.needleCompact,
              { transform: [{ rotate: rotation }] },
            ]}
          >
            <LinearGradient
              colors={isInRed
                ? ['#cc3300', Colors.vermilion, '#ff6644']
                : ['#888888', '#aaaaaa', '#888888']}
              locations={[0, 0.5, 1]}
              style={styles.needleBody}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          {/* Pivot screw */}
          <View style={[styles.pivotScrew, compact && styles.pivotScrewCompact]} />
        </View>
      </View>
    </View>
  );
};

export const RecorderVUMeter: React.FC<RecorderVUMeterProps> = ({
  levelLeft = 0,
  levelRight = 0,
  isRecording = false,
  isPlaying = false,
  compact = false,
}) => {
  // For mono recordings, use same level for both channels
  const leftLevel = levelLeft;
  const rightLevel = levelRight || levelLeft;

  // Peak indicator (shows if either channel hits peak)
  const isPeaking = leftLevel > 0.95 || rightLevel > 0.95;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header with VU label and status LEDs */}
      <View style={styles.header}>
        <Text style={[styles.vuLabel, compact && styles.vuLabelCompact]}>VU</Text>

        <View style={styles.statusLeds}>
          {/* Recording LED */}
          <View style={styles.ledContainer}>
            <LEDIndicator
              size={compact ? 8 : 10}
              isActive={isRecording}
              color={Colors.vermilion}
            />
            <Text style={[styles.ledLabel, compact && styles.ledLabelCompact]}>REC</Text>
          </View>

          {/* Peak LED */}
          <View style={styles.ledContainer}>
            <LEDIndicator
              size={compact ? 8 : 10}
              isActive={isPeaking}
              color="#ff4444"
            />
            <Text style={[styles.ledLabel, compact && styles.ledLabelCompact]}>PEAK</Text>
          </View>

          {/* Play LED */}
          <View style={styles.ledContainer}>
            <LEDIndicator
              size={compact ? 8 : 10}
              isActive={isPlaying}
              color={Colors.moss}
            />
            <Text style={[styles.ledLabel, compact && styles.ledLabelCompact]}>PLAY</Text>
          </View>
        </View>
      </View>

      {/* Dual VU meters */}
      <InsetWindow
        variant="light"
        borderRadius={compact ? 8 : 12}
        style={compact ? styles.metersContainerCompact : styles.metersContainer}
        showGlassOverlay
      >
        <View style={styles.metersRow}>
          <VUChannel level={leftLevel} label="L" compact={compact} />
          <View style={styles.meterDivider} />
          <VUChannel level={rightLevel} label="R" compact={compact} />
        </View>
      </InsetWindow>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  containerCompact: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  vuLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.graphite,
    letterSpacing: 4,
  },
  vuLabelCompact: {
    fontSize: 10,
    letterSpacing: 2,
  },
  statusLeds: {
    flexDirection: 'row',
    gap: 12,
  },
  ledContainer: {
    alignItems: 'center',
    gap: 2,
  },
  ledLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 6,
    color: Colors.graphite,
    letterSpacing: 1,
  },
  ledLabelCompact: {
    fontSize: 5,
  },
  metersContainer: {
    height: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metersContainerCompact: {
    height: 56,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  metersRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meterDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
  channelContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  channelContainerCompact: {},
  channelLabel: {
    position: 'absolute',
    top: 2,
    left: 4,
    fontFamily: 'LexendDecaBold',
    fontSize: 10,
    color: Colors.warmGray,
    zIndex: 10,
  },
  channelLabelCompact: {
    fontSize: 8,
  },
  meterFace: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  meterFaceCompact: {},
  scaleGradient: {
    position: 'absolute',
    top: 8,
    left: 4,
    right: 4,
    height: 24,
    borderRadius: 4,
    opacity: 0.3,
  },
  scaleMarkings: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markerContainer: {
    alignItems: 'center',
    gap: 1,
  },
  markerLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 7,
    color: Colors.warmGray,
  },
  markerLabelCompact: {
    fontSize: 6,
  },
  markerTick: {
    width: 1,
    height: 4,
    backgroundColor: Colors.warmGray,
  },
  markerTickRed: {
    backgroundColor: '#aa4444',
  },
  needlePivot: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needlePivotCompact: {
    bottom: 2,
    marginLeft: -4,
    width: 8,
    height: 8,
  },
  needle: {
    position: 'absolute',
    bottom: 4,
    width: 2,
    height: 48,
    transformOrigin: 'bottom center',
    shadowColor: 'rgba(0,0,0,0.6)',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 2,
  },
  needleCompact: {
    height: 32,
    width: 1.5,
    bottom: 2,
  },
  needleBody: {
    flex: 1,
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  pivotScrew: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    borderWidth: 1.5,
    borderColor: '#555',
    position: 'absolute',
    bottom: 0,
  },
  pivotScrewCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
});

export default RecorderVUMeter;
