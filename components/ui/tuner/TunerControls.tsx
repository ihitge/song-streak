/**
 * TunerControls Component
 *
 * Transport controls for the tuner:
 * - Signal strength indicator
 * - Circular Start/Stop button matching FAB design
 *
 * Follows Industrial Play aesthetic.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { FAB } from '@/components/ui/FAB';
import type { TunerStatus } from '@/types/tuner';

interface TunerControlsProps {
  /** Current tuner status */
  status: TunerStatus;
  /** Signal strength (0-1) */
  signalStrength: number;
  /** Whether tuner has microphone permission */
  hasPermission: boolean;
  /** Permission status */
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  /** Start tuning callback */
  onStart: () => void;
  /** Stop tuning callback */
  onStop: () => void;
  /** Compact mode */
  compact?: boolean;
}

export const TunerControls: React.FC<TunerControlsProps> = ({
  status,
  signalStrength,
  hasPermission,
  permissionStatus,
  onStart,
  onStop,
  compact = false,
}) => {
  const isActive = status !== 'idle';

  const handleToggle = useCallback(() => {
    if (permissionStatus === 'denied') return;

    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  }, [isActive, onStart, onStop, permissionStatus]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Signal strength indicator */}
      <View style={styles.signalContainer}>
        <Volume2 size={14} color={Colors.warmGray} />
        <View style={styles.signalBarContainer}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, index) => (
            <View
              key={index}
              style={[
                styles.signalBar,
                {
                  height: 6 + index * 2,
                  backgroundColor:
                    isActive && signalStrength >= threshold
                      ? signalStrength >= 0.8
                        ? Colors.vermilion
                        : signalStrength >= 0.5
                          ? Colors.moss
                          : Colors.graphite
                      : 'rgba(136, 136, 136, 0.3)',
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.signalLabel}>SIGNAL</Text>
      </View>

      {/* Primary Start/Stop Button - FAB style */}
      <FAB
        onPress={handleToggle}
        icon={
          isActive ? (
            <MicOff size={28} color={Colors.softWhite} strokeWidth={2.5} />
          ) : (
            <Mic
              size={28}
              color={permissionStatus === 'denied' ? Colors.graphite : Colors.softWhite}
              strokeWidth={2.5}
            />
          )
        }
        variant={isActive ? 'secondary' : 'primary'}
        disabled={permissionStatus === 'denied'}
      />

      {/* Button label */}
      <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
        {status === 'initializing'
          ? 'STARTING...'
          : isActive
            ? 'STOP'
            : permissionStatus === 'denied'
              ? 'MIC DENIED'
              : 'START'}
      </Text>

      {/* Permission denied message */}
      {permissionStatus === 'denied' && (
        <Text style={styles.permissionDeniedText}>
          Microphone access required
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  containerCompact: {
    gap: 6,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  signalBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  signalBar: {
    width: 4,
    borderRadius: 1,
  },
  signalLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 8,
    letterSpacing: 1,
    color: Colors.warmGray,
  },
  buttonLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.vermilion,
  },
  buttonLabelActive: {
    color: Colors.graphite,
  },
  permissionDeniedText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.vermilion,
    textAlign: 'center',
  },
});
