import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PageHeader } from '@/components/ui/PageHeader';
import { TunerPanel } from '@/components/ui/tuner';
import { Colors } from '@/constants/Colors';
import { useTunerMachine } from '@/hooks/tuner';
import { useStyledAlert } from '@/hooks/useStyledAlert';

/**
 * Tuner Screen - Guitar Tuner
 *
 * Features:
 * - Real-time pitch detection using YIN algorithm
 * - VU-style swing meter showing cents deviation
 * - Auto-detection of played string
 * - Haptic feedback when in tune
 * - Industrial Play aesthetic matching Metronome
 *
 * Based on YIN algorithm from pitchfinder library.
 */
export default function TunerScreen() {
  const { showInfo } = useStyledAlert();
  const tuner = useTunerMachine();

  // Haptic feedback when hitting "in tune"
  useEffect(() => {
    if (tuner.isInTune) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [tuner.isInTune]);

  /**
   * Handle start tuning
   */
  const handleStart = useCallback(() => {
    tuner.start();
  }, [tuner]);

  /**
   * Handle stop tuning
   */
  const handleStop = useCallback(() => {
    tuner.stop();
  }, [tuner]);

  /**
   * Handle string selection (for reference tone - future feature)
   */
  const handleStringSelect = useCallback(
    (string: typeof tuner.detectedString) => {
      if (string) {
        showInfo(
          `${string.fullName} (${string.note})`,
          `Target frequency: ${string.frequency} Hz`
        );
      }
    },
    [showInfo]
  );

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Tuner Panel - takes up available space */}
      <View style={styles.tunerSection}>
        <TunerPanel
          detectedString={tuner.detectedString}
          frequency={tuner.frequency}
          cents={tuner.cents}
          direction={tuner.direction}
          status={tuner.status}
          isInTune={tuner.isInTune}
          signalStrength={tuner.signalStrength}
          hasPermission={tuner.hasPermission}
          permissionStatus={tuner.permissionStatus}
          onStart={handleStart}
          onStop={handleStop}
          onStringSelect={handleStringSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  tunerSection: {
    flex: 1,
  },
});
