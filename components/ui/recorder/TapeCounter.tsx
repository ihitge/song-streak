/**
 * TapeCounter Component
 *
 * Mechanical flip counter display showing elapsed/total time.
 * Displays in MM:SS / MM:SS format for recording time.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay } from '@/components/skia/primitives/InsetShadowOverlay';
import { SurfaceTextureOverlay } from '@/components/skia/primitives/SurfaceTextureOverlay';
import { formatTime, MAX_RECORDING_SECONDS } from '@/types/voiceMemo';

interface TapeCounterProps {
  /** Current elapsed seconds */
  elapsedSeconds: number;
  /** Total duration (defaults to MAX_RECORDING_SECONDS) */
  totalSeconds?: number;
  /** Compact mode */
  compact?: boolean;
  /** Show elapsed / total format */
  showTotal?: boolean;
  /** Custom label */
  label?: string;
}

/**
 * Single digit wheel with mechanical appearance
 */
const DigitWheel: React.FC<{ digit: string; compact?: boolean }> = ({
  digit,
  compact = false,
}) => {
  const width = compact ? 18 : 24;
  const height = compact ? 26 : 34;
  const borderRadius = compact ? 2 : 3;

  return (
    <View style={styles.digitWheelContainer}>
      <View style={[styles.digitWheel, compact && styles.digitWheelCompact]}>
        <Text style={[styles.digitText, compact && styles.digitTextCompact]}>
          {digit}
        </Text>
      </View>
      {/* Inner shadow for depth */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.25)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.12)',
        ]}
        locations={[0, 0.15, 0.85, 1]}
        style={styles.digitInnerShadow}
        pointerEvents="none"
      />
      <InsetShadowOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        insetDepth={compact ? 3 : 4}
        shadowIntensity={0.6}
      />
      <GlassOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        glareOpacity={0.15}
        specularOpacity={0.25}
      />
      <SurfaceTextureOverlay
        width={width}
        height={height}
        borderRadius={borderRadius}
        textureOpacity={0.02}
      />
    </View>
  );
};

/**
 * Time display group (MM:SS)
 */
const TimeDisplay: React.FC<{
  seconds: number;
  compact?: boolean;
  dimmed?: boolean;
}> = ({ seconds, compact = false, dimmed = false }) => {
  const formatted = formatTime(seconds);
  const [minutes, secs] = formatted.split(':');

  return (
    <View style={[styles.timeGroup, dimmed && styles.timeGroupDimmed]}>
      <DigitWheel digit={minutes[0]} compact={compact} />
      <DigitWheel digit={minutes[1]} compact={compact} />
      <View style={[styles.colonContainer, compact && styles.colonContainerCompact]}>
        <View style={[styles.colonDot, compact && styles.colonDotCompact]} />
        <View style={[styles.colonDot, compact && styles.colonDotCompact]} />
      </View>
      <DigitWheel digit={secs[0]} compact={compact} />
      <DigitWheel digit={secs[1]} compact={compact} />
    </View>
  );
};

export const TapeCounter: React.FC<TapeCounterProps> = ({
  elapsedSeconds,
  totalSeconds = MAX_RECORDING_SECONDS,
  compact = false,
  showTotal = true,
  label = 'COUNTER',
}) => {
  return (
    <View style={[styles.housing, compact && styles.housingCompact]}>
      {/* Recessed well containing digits */}
      <View style={[styles.recessedWell, compact && styles.recessedWellCompact]}>
        <View style={styles.digitsContainer}>
          {/* Elapsed time */}
          <TimeDisplay seconds={elapsedSeconds} compact={compact} />

          {/* Separator */}
          {showTotal && (
            <>
              <View style={[styles.separator, compact && styles.separatorCompact]}>
                <Text style={[styles.separatorText, compact && styles.separatorTextCompact]}>
                  /
                </Text>
              </View>

              {/* Total time */}
              <TimeDisplay seconds={totalSeconds} compact={compact} dimmed />
            </>
          )}
        </View>

        {/* Cylinder reflection overlay */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.12)',
            'rgba(255,255,255,0.04)',
            'rgba(0,0,0,0.04)',
            'rgba(0,0,0,0.15)',
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

const styles = StyleSheet.create({
  housing: {
    backgroundColor: Colors.ink,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  housingCompact: {
    borderRadius: 6,
    padding: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  recessedWell: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    padding: 8,
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
    padding: 5,
  },
  digitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeGroupDimmed: {
    opacity: 0.5,
  },
  digitWheelContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 3,
  },
  digitWheel: {
    width: 24,
    height: 34,
    backgroundColor: Colors.softWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
  },
  digitWheelCompact: {
    width: 18,
    height: 26,
    borderRadius: 2,
  },
  digitText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 20,
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  digitTextCompact: {
    fontSize: 15,
  },
  digitInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 3,
  },
  colonContainer: {
    width: 8,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  colonContainerCompact: {
    width: 6,
    height: 26,
    gap: 4,
  },
  colonDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.vermilion,
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
  },
  colonDotCompact: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  separator: {
    width: 16,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separatorCompact: {
    width: 12,
    height: 26,
  },
  separatorText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.warmGray,
  },
  separatorTextCompact: {
    fontSize: 12,
  },
  cylinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
  },
  label: {
    ...Typography.label,
    color: Colors.warmGray,
    marginTop: 6,
  },
  labelCompact: {
    fontSize: 7,
    marginTop: 4,
  },
});

export default TapeCounter;
