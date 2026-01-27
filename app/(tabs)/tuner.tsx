/**
 * Tuner Screen
 *
 * Professional-grade chromatic tuner for guitar and bass.
 * Features:
 * - Needle-style meter with Kalman-filtered smoothing
 * - Multi-rate processing for bass frequencies (<100Hz)
 * - Guitar (6-string) and Bass (4/5-string) support
 * - Standard tuning reference
 *
 * Uses pitchy library for autocorrelation-based pitch detection.
 * iOS uses .measurement mode to disable high-pass filter for bass.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { TunerDisplay, TunerControls } from '@/components/ui/tuner';
import { useTuner } from '@/hooks/tuner';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { Colors } from '@/constants/Colors';

export default function TunerScreen() {
  const tuner = useTuner();
  const { showError } = useStyledAlert();

  // Show error if tuner initialization fails
  useEffect(() => {
    if (tuner.state.error) {
      showError('Tuner Error', tuner.state.error);
    }
  }, [tuner.state.error, showError]);

  return (
    <View style={styles.container}>
      <PageHeader />

      <DeviceCasing title="TUNER">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentWrapper}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading state */}
          {!tuner.isReady && !tuner.state.error && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing audio...</Text>
            </View>
          )}

          {/* Error state */}
          {tuner.state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {tuner.state.error}
              </Text>
              <Text style={styles.errorHint}>
                Note: Requires development build (not Expo Go)
              </Text>
            </View>
          )}

          {/* Permission prompt - handled by TunerControls button */}

          {/* Main content */}
          {tuner.isReady && (
            <>
              {/* Tuner Display */}
              <View style={styles.displaySection}>
                <TunerDisplay
                  pitch={tuner.state.smoothedPitch}
                  targetString={tuner.state.targetString}
                  isInTune={tuner.state.isInTune}
                  isListening={tuner.isListening}
                  embedded
                />
              </View>

              {/* Tuner Controls */}
              <View style={styles.controlsSection}>
                <TunerControls
                  instrument={tuner.state.instrument}
                  onInstrumentChange={tuner.setInstrument}
                  strings={tuner.strings}
                  targetString={tuner.state.targetString}
                  isListening={tuner.isListening}
                  isReady={tuner.isReady}
                  onToggle={tuner.toggle}
                  hasPermission={tuner.hasPermission}
                  onRequestPermission={tuner.requestPermission}
                />
              </View>
            </>
          )}
        </ScrollView>
      </DeviceCasing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    minHeight: 300,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.lobsterPink,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorHint: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    textAlign: 'center',
    marginTop: 8,
  },
  displaySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  controlsSection: {
    flex: 1,
  },
});
