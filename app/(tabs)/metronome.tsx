/**
 * Metronome Screen
 *
 * Professional-grade metronome with sample-accurate timing.
 * Features:
 * - Tempo control (20-300 BPM)
 * - Tap tempo
 * - Visual pendulum (predictive cue)
 * - Haptic feedback on each beat
 *
 * Uses Web Audio API lookahead scheduling for sample-accurate timing.
 * See hooks/metronome/useMetronomeAudio.ts for implementation details.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { MetronomePendulum, MetronomeControls } from '@/components/ui/metronome';
import { useMetronome } from '@/hooks/metronome';
import { Colors } from '@/constants/Colors';
import { useStyledAlert } from '@/hooks/useStyledAlert';

export default function MetronomeScreen() {
  const metronome = useMetronome();
  const { showError } = useStyledAlert();

  // Show error if audio initialization fails
  useEffect(() => {
    if (metronome.audioError) {
      showError('Audio Error', metronome.audioError);
    }
  }, [metronome.audioError, showError]);

  return (
    <View style={styles.container}>
      <PageHeader />

      <DeviceCasing title="METRONOME">
        <View style={styles.contentWrapper}>
          {/* Loading state */}
          {!metronome.isAudioReady && !metronome.audioError && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing audio...</Text>
            </View>
          )}

          {/* Error state */}
          {metronome.audioError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Audio unavailable. Please check your device settings.
              </Text>
            </View>
          )}

          {/* Main content */}
          {metronome.isAudioReady && (
            <>
              {/* Pendulum Visualization */}
              <View style={styles.pendulumSection}>
                <MetronomePendulum
                  angle={metronome.pendulumAngle}
                  isPlaying={metronome.isPlaying}
                  currentBeat={metronome.currentBeat}
                  bpm={metronome.bpm}
                />
              </View>

              {/* Controls */}
              <View style={styles.controlsSection}>
                <MetronomeControls
                  bpm={metronome.bpm}
                  isPlaying={metronome.isPlaying}
                  isAudioReady={metronome.isAudioReady}
                  onBpmChange={metronome.setBpm}
                  onTap={metronome.handleTapTempo}
                  onToggle={metronome.toggle}
                  tapCount={metronome.tapCount}
                />
              </View>
            </>
          )}
        </View>
      </DeviceCasing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'LexendDecaRegular',
    color: Colors.lobsterPink,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  pendulumSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  controlsSection: {
    flex: 1,
    justifyContent: 'center',
  },
});
