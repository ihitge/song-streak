import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PageHeader } from '@/components/ui/PageHeader';
import { TunerPanel } from '@/components/ui/tuner';
import { MicrophonePermissionPrompt } from '@/components/ui/MicrophonePermissionPrompt';
import { Colors } from '@/constants/Colors';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
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
 * - Auto-starts when screen is focused (if permission granted)
 * - Auto-stops when leaving screen
 * - Industrial Play aesthetic matching Metronome
 *
 * Based on YIN algorithm from pitchfinder library.
 */
export default function TunerScreen() {
  const { showInfo } = useStyledAlert();
  const tuner = useTunerMachine();
  const hasAutoStarted = useRef(false);

  // Auto-start tuner when screen is focused and permission is granted
  // Auto-stop when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // Screen focused - auto-start if we have permission
      if (tuner.hasPermission && tuner.status === 'idle') {
        tuner.start();
        hasAutoStarted.current = true;
      }

      // Cleanup - stop tuner when leaving screen
      return () => {
        if (tuner.status !== 'idle') {
          tuner.stop();
        }
        hasAutoStarted.current = false;
      };
    }, [tuner.hasPermission, tuner.status, tuner.start, tuner.stop])
  );

  // Auto-start after permission is granted (user just enabled mic)
  useEffect(() => {
    if (tuner.hasPermission && !hasAutoStarted.current && tuner.status === 'idle') {
      tuner.start();
      hasAutoStarted.current = true;
    }
  }, [tuner.hasPermission, tuner.status, tuner.start]);

  // Haptic feedback when hitting "in tune"
  useEffect(() => {
    if (tuner.isInTune) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [tuner.isInTune]);

  /**
   * Handle permission request - auto-start after granted
   */
  const handleRequestPermission = useCallback(async () => {
    const granted = await tuner.requestPermission();
    // Auto-start is handled by the useEffect above when hasPermission changes
    return granted;
  }, [tuner.requestPermission]);

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

      {/* Dark device casing */}
      <DeviceCasing title="TUNER">
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
            onStart={tuner.start}
            onStop={tuner.stop}
            onStringSelect={handleStringSelect}
            showControls={false}
          />
        </View>

        {/* Permission prompt - only shown when permission not granted */}
        {tuner.permissionStatus !== 'granted' && (
          <View style={styles.permissionSection}>
            <MicrophonePermissionPrompt
              permissionStatus={tuner.permissionStatus}
              onRequestPermission={handleRequestPermission}
              featureName="the tuner"
            />
          </View>
        )}
      </DeviceCasing>
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
  permissionSection: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
});
