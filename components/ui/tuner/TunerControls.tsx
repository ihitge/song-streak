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
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useFABSound } from '@/hooks/useFABSound';
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
  const { playSound } = useFABSound();
  const isActive = status !== 'idle';

  const handleToggle = useCallback(async () => {
    if (permissionStatus === 'denied') return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();

    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  }, [isActive, onStart, onStop, permissionStatus, playSound]);

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
      <Pressable
        style={[
          styles.fab,
          isActive && styles.fabActive,
          permissionStatus === 'denied' && styles.buttonDisabled,
        ]}
        onPress={handleToggle}
        disabled={permissionStatus === 'denied'}
      >
        {isActive ? (
          <MicOff size={24} color={Colors.softWhite} strokeWidth={2.5} />
        ) : (
          <Mic
            size={24}
            color={permissionStatus === 'denied' ? Colors.graphite : Colors.softWhite}
            strokeWidth={2.5}
          />
        )}
      </Pressable>

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
    gap: 12,
  },
  containerCompact: {
    gap: 8,
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
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.vermilion,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: Colors.graphite,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  permissionDeniedText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.vermilion,
    textAlign: 'center',
  },
});
