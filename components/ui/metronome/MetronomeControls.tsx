/**
 * MetronomeControls Component
 *
 * Main control panel for the metronome, housing:
 * - BPM display with integrated tap tempo (tap the number)
 * - Start/stop button
 *
 * Designed for instrument-in-hand use with large touch targets.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Play, Square } from 'lucide-react-native';
import { MetronomeBPMDisplay } from './MetronomeBPMDisplay';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

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
      {/* BPM Display with integrated tap tempo */}
      <MetronomeBPMDisplay
        bpm={bpm}
        onBpmChange={onBpmChange}
        onTap={onTap}
        tapCount={tapCount}
        disabled={!isAudioReady}
      />

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
    gap: 16,
    paddingHorizontal: 16,
  },
  playSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
});

export default MetronomeControls;
