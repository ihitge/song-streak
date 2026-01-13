/**
 * TunerControls Component
 *
 * Transport controls for the tuner:
 * - Signal strength indicator
 * - Circular Start/Stop button matching FAB design
 * - Permission state handling with settings redirect
 *
 * Follows Industrial Play aesthetic.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform, ActivityIndicator } from 'react-native';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
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
  const isInitializing = status === 'initializing';

  const handleToggle = useCallback(async () => {
    if (permissionStatus === 'denied') return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  }, [isActive, onStart, onStop, permissionStatus]);

  const handleOpenSettings = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  // Get button label based on state
  const getButtonLabel = () => {
    if (isInitializing) return 'STARTING...';
    if (isActive) return 'STOP';
    if (permissionStatus === 'denied') return 'MIC DENIED';
    if (permissionStatus === 'undetermined') return 'ENABLE MIC';
    return 'START';
  };

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
          isInitializing ? (
            <ActivityIndicator size="small" color={Colors.softWhite} />
          ) : isActive ? (
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
        disabled={permissionStatus === 'denied' || isInitializing}
        accessibilityLabel={getButtonLabel()}
        accessibilityHint={
          permissionStatus === 'denied'
            ? 'Microphone permission denied. Open settings to enable.'
            : permissionStatus === 'undetermined'
              ? 'Tap to request microphone permission'
              : isActive
                ? 'Tap to stop tuning'
                : 'Tap to start tuning'
        }
      />

      {/* Button label */}
      <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
        {getButtonLabel()}
      </Text>

      {/* Permission undetermined - prompt */}
      {permissionStatus === 'undetermined' && !isActive && (
        <Text style={styles.permissionPromptText}>
          Tap to enable microphone
        </Text>
      )}

      {/* Permission denied - message with settings button */}
      {permissionStatus === 'denied' && (
        <View style={styles.permissionDeniedContainer}>
          <Text style={styles.permissionDeniedText}>
            Microphone access required
          </Text>
          <Pressable
            style={styles.settingsButton}
            onPress={handleOpenSettings}
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            accessibilityHint="Opens device settings to enable microphone"
          >
            <Settings size={14} color={Colors.softWhite} />
            <Text style={styles.settingsButtonText}>OPEN SETTINGS</Text>
          </Pressable>
        </View>
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
  permissionPromptText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.moss,
    textAlign: 'center',
  },
  permissionDeniedContainer: {
    alignItems: 'center',
    gap: 8,
  },
  permissionDeniedText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.vermilion,
    textAlign: 'center',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  settingsButtonText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
});
