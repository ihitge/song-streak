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
import { Mic, MicOff, Volume2, Settings, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { ICON_SIZES } from '@/constants/Styles';
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
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      // Web: try to start again - browser will re-prompt if user cleared the block
      onStart();
    }
  }, [onStart]);

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
        <Volume2 size={ICON_SIZES.sm} color={Colors.warmGray} />
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
            <MicOff size={ICON_SIZES.hero} color={Colors.softWhite} strokeWidth={2.5} />
          ) : (
            <Mic
              size={ICON_SIZES.hero}
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

      {/* Permission denied - message with settings button */}
      {permissionStatus === 'denied' && (
        <View style={styles.permissionDeniedContainer}>
          <View style={styles.permissionWarningRow}>
            <AlertTriangle size={ICON_SIZES.sm} color={Colors.vermilion} />
            <Text style={styles.permissionDeniedText}>
              Microphone access required
            </Text>
          </View>
          <Text style={styles.permissionHelpText}>
            {Platform.OS === 'web'
              ? 'Click the padlock icon in your address bar to allow mic access'
              : 'Enable microphone in Settings to use the tuner'}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
            onPress={handleOpenSettings}
            accessibilityLabel={Platform.OS === 'web' ? 'Try again' : 'Open settings'}
            accessibilityRole="button"
            accessibilityHint={Platform.OS === 'web'
              ? 'Request microphone permission again'
              : 'Opens device settings to enable microphone'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings size={ICON_SIZES.sm} color={Colors.softWhite} />
            <Text style={styles.settingsButtonText}>
              {Platform.OS === 'web' ? 'TRY AGAIN' : 'OPEN SETTINGS'}
            </Text>
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
  permissionDeniedContainer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  permissionWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permissionDeniedText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 11,
    color: Colors.vermilion,
    textAlign: 'center',
  },
  permissionHelpText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 14,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,  // Comfortable touch target
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  settingsButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  settingsButtonText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 11,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
});
