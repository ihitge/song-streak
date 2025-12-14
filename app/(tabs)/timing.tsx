import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetronomePanel } from '@/components/ui/metronome';
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
        {/* Metronome Panel: Time Sig + Sound + Subdivision + VU Meter + BPM + Transport + Timer */}
        <View style={styles.meterSection}>
          <MetronomePanel
            beatPosition={metronome.beatPosition}
            isMetronomePlaying={metronome.isPlaying}
            currentBeat={metronome.currentBeat}
            beatsPerMeasure={metronome.beatsPerMeasure}
            timeSignature={metronome.timeSignature}
            onTimeSignatureChange={metronome.setTimeSignature}
            soundType={metronome.soundType}
            onSoundTypeChange={metronome.setSoundType}
            subdivision={metronome.subdivision}
            onSubdivisionChange={handleSubdivisionChange}
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
});
