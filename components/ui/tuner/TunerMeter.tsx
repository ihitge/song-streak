/**
 * TunerMeter Component
 *
 * Visual meter showing pitch deviation with:
 * - Needle indicator (animated)
 * - Tick marks at intervals
 * - Color-coded feedback (red/yellow/green)
 * - "In Tune" glow effect
 *
 * Uses CSS on web, Skia on native for best compatibility.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, LayoutChangeEvent, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TUNING_CONFIG } from '@/constants/TunerConfig';
import type { TuningDirection } from '@/types/tuner';

interface TunerMeterProps {
  /** Cents deviation from target (-50 to +50 range shown) */
  cents: number | null;
  /** Direction indicator */
  direction: TuningDirection;
  /** Whether currently in tune */
  isInTune: boolean;
  /** Whether tuner is actively listening */
  isActive: boolean;
}

const METER_HEIGHT = 80;
const NEEDLE_WIDTH = 4;
const TICK_COUNT = 21; // -50 to +50 in steps of 5

/**
 * Get color based on cents deviation
 */
function getDeviationColor(cents: number | null): string {
  if (cents === null) return Colors.graphite;

  const absCents = Math.abs(cents);

  if (absCents <= TUNING_CONFIG.inTuneEnter) {
    return Colors.moss; // Green - in tune
  } else if (absCents <= 15) {
    return '#a3be8c'; // Light green - almost there
  } else if (absCents <= 25) {
    return '#ebcb8b'; // Yellow - getting close
  } else if (absCents <= 35) {
    return '#d08770'; // Orange - needs work
  } else {
    return Colors.vermilion; // Red - way off
  }
}

export const TunerMeter: React.FC<TunerMeterProps> = ({
  cents,
  direction,
  isInTune,
  isActive,
}) => {
  const [width, setWidth] = useState(300);
  const needlePosition = useRef(new Animated.Value(0.5)).current;

  // Handle layout to get width
  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  // Animate needle position based on cents
  useEffect(() => {
    if (cents === null || !isActive) {
      // Reset to center when inactive
      Animated.spring(needlePosition, {
        toValue: 0.5,
        useNativeDriver: Platform.OS !== 'web',
        tension: 100,
        friction: 12,
      }).start();
      return;
    }

    // Map cents (-50 to +50) to position (0 to 1)
    // Clamp to prevent needle going off scale
    const clampedCents = Math.max(-50, Math.min(50, cents));
    const position = (clampedCents + 50) / 100;

    Animated.spring(needlePosition, {
      toValue: position,
      useNativeDriver: Platform.OS !== 'web',
      tension: 120,
      friction: 10,
    }).start();
  }, [cents, isActive, needlePosition]);

  // Calculate needle position - use left for web, transform for native
  const needleStyle = Platform.OS === 'web'
    ? {
        left: needlePosition.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width - NEEDLE_WIDTH],
        }),
      }
    : {
        transform: [{
          translateX: needlePosition.interpolate({
            inputRange: [0, 1],
            outputRange: [0, width - NEEDLE_WIDTH],
          }),
        }],
      };

  const deviationColor = getDeviationColor(cents);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Background well - CSS styling */}
      <View style={styles.meterWell}>
        {/* Center zone indicator (green when in tune) */}
        <View style={styles.centerZone}>
          <View
            style={[
              styles.centerZoneInner,
              isInTune && styles.centerZoneActive,
            ]}
          />
        </View>

        {/* Tick marks */}
        <View style={styles.tickContainer}>
          {Array.from({ length: TICK_COUNT }).map((_, i) => {
            const isMajor = i % 2 === 0;
            const isCenter = i === Math.floor(TICK_COUNT / 2);

            return (
              <View
                key={i}
                style={[
                  styles.tick,
                  isMajor && styles.tickMajor,
                  isCenter && styles.tickCenter,
                ]}
              />
            );
          })}
        </View>

        {/* Needle */}
        <Animated.View
          style={[
            styles.needle,
            { backgroundColor: deviationColor },
            needleStyle,
          ]}
        >
          {/* Needle glow when in tune */}
          {isInTune && (
            <View style={[styles.needleGlow, { backgroundColor: Colors.moss }]} />
          )}
        </Animated.View>

        {/* Direction indicators */}
        <View style={styles.directionIndicators}>
          <Text
            style={[
              styles.directionText,
              direction === 'flat' && styles.directionActive,
            ]}
          >
            ♭ FLAT
          </Text>
          <Text
            style={[
              styles.directionText,
              direction === 'sharp' && styles.directionActive,
            ]}
          >
            SHARP ♯
          </Text>
        </View>
      </View>

      {/* Scale labels */}
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>-50</Text>
        <Text style={styles.scaleLabel}>-25</Text>
        <Text style={[styles.scaleLabel, styles.scaleLabelCenter]}>0</Text>
        <Text style={styles.scaleLabel}>+25</Text>
        <Text style={styles.scaleLabel}>+50</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  meterWell: {
    height: METER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  centerZone: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 30,
    marginLeft: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerZoneInner: {
    width: 24,
    height: '70%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(65, 123, 90, 0.3)',
    backgroundColor: 'rgba(65, 123, 90, 0.1)',
  },
  centerZoneActive: {
    borderColor: Colors.moss,
    backgroundColor: 'rgba(65, 123, 90, 0.3)',
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
    paddingBottom: 8,
  },
  tick: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tickMajor: {
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  tickCenter: {
    height: 24,
    width: 2,
    backgroundColor: Colors.moss,
  },
  needle: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: NEEDLE_WIDTH,
    borderRadius: 2,
  },
  needleGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 6,
    opacity: 0.4,
  },
  directionIndicators: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
  },
  directionActive: {
    color: Colors.vermilion,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  scaleLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 8,
    color: Colors.graphite,
  },
  scaleLabelCenter: {
    color: Colors.moss,
    fontFamily: 'LexendDecaSemiBold',
  },
});
