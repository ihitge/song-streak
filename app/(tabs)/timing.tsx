import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetronomeControls, MetronomePanel } from '@/components/ui/metronome';
import { Colors } from '@/constants/Colors';
import { useMetronome } from '@/hooks/useMetronome';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { Subdivision } from '@/types/metronome';

/**
 * Timing Screen - Standalone Metronome
 *
 * Full metronome with:
 * - VU meter in pendulum mode
 * - BPM control with tap tempo
 * - Time signature selection (RotaryKnob)
 * - Subdivision selection (GangSwitch)
 * - Auto-coupled practice timer
 * - Transport controls (play/pause/reset/log)
 */
export default function TimingScreen() {
  const { showSuccess, showInfo } = useStyledAlert();

  // Session timer (auto-coupled with metronome)
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [timerPausedByUser, setTimerPausedByUser] = useState(false);

  // Initialize metronome
  const metronome = useMetronome({
    initialBpm: 120,
    initialTimeSignature: '4/4',
    initialSubdivision: 1,
    onStateChange: (isPlaying) => {
      // Auto-couple: reset user pause flag when metronome starts
      if (isPlaying) {
        setTimerPausedByUser(false);
      }
    },
  });

  // Auto-couple timer with metronome
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (metronome.isPlaying && !timerPausedByUser) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [metronome.isPlaying, timerPausedByUser]);

  /**
   * Handle play/pause toggle
   */
  const handlePlayPause = useCallback(() => {
    metronome.toggle();
  }, [metronome]);

  /**
   * Handle reset - stops metronome and resets timer
   */
  const handleReset = useCallback(() => {
    metronome.stop();
    setSessionSeconds(0);
    setTimerPausedByUser(false);
  }, [metronome]);

  /**
   * Handle complete/log - saves session
   */
  const handleComplete = useCallback(
    (seconds: number) => {
      metronome.stop();

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const timeString =
        minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;

      showSuccess('Practice Logged', `You practiced with the metronome for ${timeString}.`);

      // Reset for next session
      setSessionSeconds(0);
      setTimerPausedByUser(false);
    },
    [metronome, showSuccess]
  );

  /**
   * Handle subdivision change
   */
  const handleSubdivisionChange = useCallback(
    (sub: Subdivision) => {
      metronome.setSubdivision(sub);
    },
    [metronome]
  );

  return (
    <View style={styles.container}>
      <PageHeader subtitle="METRONOME" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Metronome Panel: Time Sig + VU Meter + BPM + Transport + Timer */}
        <View style={styles.meterSection}>
          <MetronomePanel
            beatPosition={metronome.beatPosition}
            isMetronomePlaying={metronome.isPlaying}
            currentBeat={metronome.currentBeat}
            beatsPerMeasure={metronome.beatsPerMeasure}
            timeSignature={metronome.timeSignature}
            onTimeSignatureChange={metronome.setTimeSignature}
            bpm={metronome.bpm}
            onBpmChange={metronome.setBpm}
            onTapTempo={metronome.tapTempo}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onComplete={handleComplete}
            showComplete={true}
            sessionSeconds={sessionSeconds}
          />
        </View>

        {/* Metronome Controls: Subdivision only */}
        <View style={styles.controlsSection}>
          <MetronomeControls
            subdivision={metronome.subdivision}
            onSubdivisionChange={handleSubdivisionChange}
          />
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusLed, metronome.isPlaying && styles.statusLedActive]}
          />
          <Text style={styles.statusText}>
            {metronome.isPlaying
              ? 'PLAYING'
              : sessionSeconds > 0
              ? 'PAUSED'
              : 'READY'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 120, // Account for tab bar
    gap: 32,
  },
  meterSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  controlsSection: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.alloy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
    // Inset effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.graphite,
  },
  statusLedActive: {
    backgroundColor: Colors.vermilion,
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statusText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 2,
  },
});
