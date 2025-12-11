import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VUMeterDisplay } from '@/components/ui/practice/VUMeterDisplay';
import { RamsTapeCounterDisplay } from '@/components/ui/practice/RamsTapeCounterDisplay';
import { BPMDisplay } from './BPMDisplay';
import { TransportControls } from './TransportControls';

interface MetronomePanelProps {
  // Metronome state (from useMetronome)
  beatPosition: number;
  isMetronomePlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: number;

  // BPM controls
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => number | null;

  // Transport controls
  onPlayPause: () => void;
  onReset: () => void;
  onComplete?: (seconds: number) => void;
  showComplete?: boolean;

  // Timer
  sessionSeconds: number;

  // Options
  compact?: boolean;
}

/**
 * MetronomePanel - Composite component combining:
 * 1. VU Meter + BPM Display + Transport Controls (inside unified housing)
 * 2. Session Timer (tape counter style, separate)
 *
 * Layout (top to bottom):
 * - Metronome Housing (VU meter pendulum + BPM controls + transport)
 * - Tape Counter (session time)
 */
export const MetronomePanel: React.FC<MetronomePanelProps> = ({
  beatPosition,
  isMetronomePlaying,
  currentBeat,
  beatsPerMeasure,
  bpm,
  onBpmChange,
  onTapTempo,
  onPlayPause,
  onReset,
  onComplete,
  showComplete = true,
  sessionSeconds,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* VU Meter with BPM Display and Transport Controls inside the housing */}
      <VUMeterDisplay
        mode="metronome"
        beatPosition={beatPosition}
        isMetronomePlaying={isMetronomePlaying}
        currentBeat={currentBeat}
        beatsPerMeasure={beatsPerMeasure}
        compact={compact}
        showTimeDisplay={false}
      >
        {/* BPM Display - rendered inside VU meter housing */}
        <BPMDisplay
          bpm={bpm}
          onBpmChange={onBpmChange}
          onTapTempo={onTapTempo}
          isPlaying={isMetronomePlaying}
          compact={compact}
        />

        {/* Transport Controls - play/pause, reset, complete */}
        <View style={styles.transportSection}>
          <TransportControls
            isPlaying={isMetronomePlaying}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onComplete={onComplete}
            sessionSeconds={sessionSeconds}
            compact={true}
            showComplete={showComplete}
          />
        </View>
      </VUMeterDisplay>

      {/* Session Timer - tape counter style (separate from metronome) */}
      <View style={styles.timerSection}>
        <RamsTapeCounterDisplay
          seconds={sessionSeconds}
          compact={compact}
          label="SESSION TIME"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  containerCompact: {
    gap: 12,
  },
  transportSection: {
    marginTop: 12,
  },
  timerSection: {
    alignItems: 'center',
  },
});
