/**
 * TunerControls Component
 *
 * Transport controls for the tuner:
 * - Signal strength indicator
 * - Circular Start/Stop button matching FAB design
 * - Permission state handling via MicrophonePermissionPrompt
 *
 * Follows Industrial Play aesthetic.
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Mic, MicOff, Volume2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { ICON_SIZES } from '@/constants/Styles';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { MicrophonePermissionPrompt } from '@/components/ui/MicrophonePermissionPrompt';
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

  const handleToggle = useCallback(() => {
    if (isActive) {
      onStop();
    } else {
      onStart();
    }
  }, [isActive, onStart, onStop]);

  // Get button label based on state
  const getButtonLabel = () => {
    if (isInitializing) return 'STARTING...';
    if (isActive) return 'STOP';
    return 'START';
  };

  // Show permission prompt if not granted
  if (permissionStatus !== 'granted') {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        {/* Signal strength indicator (inactive) */}
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
                    backgroundColor: 'rgba(136, 136, 136, 0.3)',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.signalLabel}>SIGNAL</Text>
        </View>

        {/* Permission prompt - consistent with Idea Bank */}
        <MicrophonePermissionPrompt
          permissionStatus={permissionStatus}
          onRequestPermission={async () => {
            onStart(); // onStart handles permission request
            return true;
          }}
          featureName="the tuner"
          compact={compact}
        />
      </View>
    );
  }

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

      {/* Primary Start/Stop Button */}
      <PrimaryButton
        onPress={handleToggle}
        icon={
          isInitializing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : isActive ? (
            <MicOff size={ICON_SIZES.hero} color="#FFFFFF" strokeWidth={2.5} />
          ) : (
            <Mic size={ICON_SIZES.hero} color="#FFFFFF" strokeWidth={2.5} />
          )
        }
        variant={isActive ? 'secondary' : 'primary'}
        size="circle"
        disabled={isInitializing}
        accessibilityLabel={getButtonLabel()}
        accessibilityHint={isActive ? 'Tap to stop tuning' : 'Tap to start tuning'}
      />

      {/* Button label */}
      <Text style={[styles.buttonLabel, isActive && styles.buttonLabelActive]}>
        {getButtonLabel()}
      </Text>
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
});
