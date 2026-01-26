/**
 * MetronomeControls Component
 *
 * Main control panel for the metronome, housing:
 * - BPM display with increment/decrement buttons
 * - Tap tempo button
 * - Start/stop button
 *
 * Designed for instrument-in-hand use with large touch targets.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { MetronomeBPMDisplay } from './MetronomeBPMDisplay';
import { MetronomeTapButton } from './MetronomeTapButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors } from '@/constants/Colors';

interface MetronomeControlsProps {
  /** Current BPM value */
  bpm: number;
  /** Whether metronome is playing */
  isPlaying: boolean;
  /** Whether audio is ready */
  isAudioReady: boolean;
  /** Callback when BPM changes */
  onBpmChange: (bpm: number) => void;
  /** Tap tempo handler */
  onTap: () => void;
  /** Toggle play/stop handler */
  onToggle: () => void;
  /** Number of taps in current tap tempo session */
  tapCount: number;
}

export const MetronomeControls = memo(function MetronomeControls({
  bpm,
  isPlaying,
  isAudioReady,
  onBpmChange,
  onTap,
  onToggle,
  tapCount,
}: MetronomeControlsProps) {
  return (
    <View style={styles.container}>
      {/* BPM Display with +/- buttons */}
      <MetronomeBPMDisplay
        bpm={bpm}
        onBpmChange={onBpmChange}
        disabled={!isAudioReady}
      />

      {/* Tap Tempo Button */}
      <View style={styles.tapSection}>
        <MetronomeTapButton
          onTap={onTap}
          tapCount={tapCount}
          disabled={!isAudioReady}
        />
      </View>

      {/* Start/Stop Button */}
      <View style={styles.playSection}>
        <PrimaryButton
          onPress={onToggle}
          icon={
            isPlaying ? (
              <Square size={24} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            ) : (
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
            )
          }
          label={isPlaying ? 'STOP' : 'START'}
          variant={isPlaying ? 'secondary' : 'primary'}
          size="standard"
          disabled={!isAudioReady}
          accessibilityLabel={isPlaying ? 'Stop metronome' : 'Start metronome'}
          accessibilityHint={
            isPlaying
              ? 'Tap to stop the metronome'
              : 'Tap to start the metronome'
          }
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
    paddingHorizontal: 16,
  },
  tapSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  playSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
});

export default MetronomeControls;
