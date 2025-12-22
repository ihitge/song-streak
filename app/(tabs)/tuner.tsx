import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  TunerMeter,
  TunerNoteDisplay,
  TunerStringSelector,
  TunerControls,
} from '@/components/ui/tuner';
import { Colors } from '@/constants/Colors';
import { useTunerMachine } from '@/hooks/tuner';
import { useStyledAlert } from '@/hooks/useStyledAlert';

/**
 * Tuner Screen - Guitar Tuner
 *
 * Features:
 * - Real-time pitch detection using YIN algorithm
 * - Visual meter showing cents deviation
 * - Auto-detection of played string
 * - Haptic feedback when in tune
 * - Industrial Play aesthetic
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

  const isActive = tuner.status !== 'idle';

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Main content */}
      <View style={styles.content}>
        {/* Note display section */}
        <View style={styles.displaySection}>
          <TunerNoteDisplay
            detectedString={tuner.detectedString}
            frequency={tuner.frequency}
            cents={tuner.cents}
            direction={tuner.direction}
            status={tuner.status}
            isInTune={tuner.isInTune}
          />
        </View>

        {/* Meter section */}
        <View style={styles.meterSection}>
          <TunerMeter
            cents={tuner.cents}
            direction={tuner.direction}
            isInTune={tuner.isInTune}
            isActive={isActive}
          />
        </View>

        {/* String selector */}
        <View style={styles.stringsSection}>
          <TunerStringSelector
            detectedString={tuner.detectedString}
            isInTune={tuner.isInTune}
            onStringSelect={handleStringSelect}
            isActive={isActive}
          />
        </View>

        {/* Controls section */}
        <View style={styles.controlsSection}>
          <TunerControls
            status={tuner.status}
            signalStrength={tuner.signalStrength}
            hasPermission={tuner.hasPermission}
            permissionStatus={tuner.permissionStatus}
            onStart={handleStart}
            onStop={handleStop}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    gap: 24,
  },
  displaySection: {
    paddingHorizontal: 16,
  },
  meterSection: {
    // Full width, component handles padding
  },
  stringsSection: {
    // Full width, component handles padding
  },
  controlsSection: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
});
