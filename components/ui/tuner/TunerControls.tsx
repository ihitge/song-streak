/**
 * TunerControls Component
 *
 * Transport controls for the tuner:
 * - Start/Stop button
 * - Signal strength indicator
 *
 * Follows Song Streak transport button pattern.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
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
}

export const TunerControls: React.FC<TunerControlsProps> = ({
  status,
  signalStrength,
  hasPermission,
  permissionStatus,
  onStart,
  onStop,
}) => {
  const { playSound } = useClickSound();
  const isActive = status !== 'idle';

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();

    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  };

  // Get button text based on status
  const getButtonText = () => {
    if (status === 'initializing') return 'STARTING...';
    if (isActive) return 'STOP';
    if (permissionStatus === 'denied') return 'MIC DENIED';
    return 'START';
  };

  return (
    <View style={styles.container}>
      {/* Signal strength indicator */}
      <View style={styles.signalContainer}>
        <Volume2 size={16} color={Colors.warmGray} />
        <View style={styles.signalBarContainer}>
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, index) => (
            <View
              key={index}
              style={[
                styles.signalBar,
                {
                  height: 8 + index * 3,
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
        <Text style={styles.signalLabel}>
          {isActive ? `${Math.round(signalStrength * 100)}%` : 'SIGNAL'}
        </Text>
      </View>

      {/* Start/Stop Button */}
      <Pressable
        style={[
          styles.toggleButton,
          isActive && styles.toggleButtonActive,
          permissionStatus === 'denied' && styles.toggleButtonDisabled,
        ]}
        onPress={handleToggle}
        disabled={permissionStatus === 'denied'}
      >
        {isActive ? (
          <MicOff size={24} color={Colors.softWhite} />
        ) : (
          <Mic
            size={24}
            color={permissionStatus === 'denied' ? Colors.graphite : Colors.softWhite}
          />
        )}
        <Text
          style={[
            styles.toggleButtonText,
            permissionStatus === 'denied' && styles.toggleButtonTextDisabled,
          ]}
        >
          {getButtonText()}
        </Text>
      </Pressable>

      {/* Permission denied message */}
      {permissionStatus === 'denied' && (
        <Text style={styles.permissionDeniedText}>
          Microphone access required. Please enable in settings.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  signalBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 20,
  },
  signalBar: {
    width: 6,
    borderRadius: 2,
  },
  signalLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.warmGray,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.vermilion,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 160,
    // Bevel effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.charcoal,
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  toggleButtonDisabled: {
    backgroundColor: Colors.alloy,
    shadowOpacity: 0,
  },
  toggleButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    letterSpacing: 2,
    color: Colors.softWhite,
  },
  toggleButtonTextDisabled: {
    color: Colors.graphite,
  },
  permissionDeniedText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.vermilion,
    textAlign: 'center',
    marginTop: 4,
  },
});
