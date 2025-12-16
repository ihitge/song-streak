import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { VUMeterDisplay } from '@/components/ui/practice/VUMeterDisplay';
import { RamsTapeCounterDisplay } from '@/components/ui/practice/RamsTapeCounterDisplay';
import { FrequencyTuner } from '@/components/ui/filters/FrequencyTuner';
import { BPMDisplay } from './BPMDisplay';
import { TransportControls } from './TransportControls';
import {
  TIME_SIGNATURE_OPTIONS,
  METRONOME_SOUND_OPTIONS,
  SUBDIVISION_OPTIONS,
  MetronomeSoundType,
  Subdivision,
} from '@/types/metronome';

interface MetronomePanelProps {
  // Metronome state (from useMetronome)
  beatPosition: number;
  isMetronomePlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: number;

  // Time signature
  timeSignature: string;
  onTimeSignatureChange: (ts: string) => void;

  // Sound type
  soundType: MetronomeSoundType;
  onSoundTypeChange: (type: MetronomeSoundType) => void;

  // Subdivision
  subdivision: Subdivision;
  onSubdivisionChange: (sub: Subdivision) => void;

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
  fullWidth?: boolean;
  showTimer?: boolean;
}

/**
 * MetronomePanel - Composite component combining:
 * 1. Time Signature + VU Meter + BPM Display + Transport Controls (inside unified housing)
 * 2. Session Timer (tape counter style, separate)
 *
 * Layout (top to bottom inside housing):
 * - Time Signature (FrequencyTuner)
 * - VU meter pendulum
 * - BPM controls
 * - Transport controls
 */
export const MetronomePanel: React.FC<MetronomePanelProps> = ({
  beatPosition,
  isMetronomePlaying,
  currentBeat,
  beatsPerMeasure,
  timeSignature,
  onTimeSignatureChange,
  soundType,
  onSoundTypeChange,
  subdivision,
  onSubdivisionChange,
  bpm,
  onBpmChange,
  onTapTempo,
  onPlayPause,
  onReset,
  onComplete,
  showComplete = true,
  sessionSeconds,
  compact = false,
  fullWidth = false,
  showTimer = true,
}) => {
  // Convert time signature options for FrequencyTuner
  const timeSignatureOptions = TIME_SIGNATURE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  // Convert sound options for FrequencyTuner
  const soundOptions = METRONOME_SOUND_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  // Convert subdivision options for FrequencyTuner
  const subdivisionOptions = SUBDIVISION_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* VU Meter with Time Signature, BPM Display and Transport Controls inside the housing */}
      <VUMeterDisplay
        mode="metronome"
        beatPosition={beatPosition}
        isMetronomePlaying={isMetronomePlaying}
        currentBeat={currentBeat}
        beatsPerMeasure={beatsPerMeasure}
        compact={compact}
        fullWidth={fullWidth}
        showTimeDisplay={false}
        headerContent={
          /* Time Signature, Sound, and Subdivision selectors at top of metronome */
          <View style={styles.headerRow}>
            <View style={styles.tunerWrapper}>
              <FrequencyTuner
                label="TIME"
                value={timeSignature}
                options={timeSignatureOptions}
                onChange={onTimeSignatureChange}
                size="compact"
                variant="light"
                showGlassOverlay
                labelColor={Colors.vermilion}
              />
            </View>
            <View style={styles.tunerWrapper}>
              <FrequencyTuner
                label="SOUND"
                value={soundType}
                options={soundOptions}
                onChange={(val) => onSoundTypeChange(val as MetronomeSoundType)}
                size="compact"
                variant="light"
                showGlassOverlay
                labelColor={Colors.vermilion}
              />
            </View>
            <View style={styles.tunerWrapper}>
              <FrequencyTuner
                label="SUBDIVISION"
                value={String(subdivision)}
                options={subdivisionOptions}
                onChange={(val) => onSubdivisionChange(Number(val) as Subdivision)}
                size="compact"
                variant="light"
                showGlassOverlay
                labelColor={Colors.vermilion}
              />
            </View>
          </View>
        }
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
      {showTimer && (
        <View style={styles.timerSection}>
          <RamsTapeCounterDisplay
            seconds={sessionSeconds}
            compact={compact}
            label="SESSION TIME"
          />
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    gap: 11,
  },
  tunerWrapper: {
    flex: 1,
  },
  transportSection: {
    marginTop: 28,
  },
  timerSection: {
    alignItems: 'center',
  },
});
