import React, { useMemo } from 'react';
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
  metronomeStartTime: number; // For pendulum animation sync

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
  showTransport?: boolean;
}

/**
 * MetronomePanel - Composite component combining all metronome elements
 * in a unified "device" housing.
 *
 * Layout (top to bottom inside single device):
 * - Time Signature, Sound, Subdivision (FrequencyTuners)
 * - VU meter pendulum with beat counter
 * - BPM controls (tap tempo, +/- buttons)
 * - Session Timer (tape counter style)
 * - Transport controls (play/pause, reset, complete)
 */
export const MetronomePanel: React.FC<MetronomePanelProps> = ({
  beatPosition,
  isMetronomePlaying,
  currentBeat,
  beatsPerMeasure,
  metronomeStartTime,
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
  showTransport = true,
}) => {
  // Memoized option transforms to prevent unnecessary re-renders
  const timeSignatureOptions = useMemo(() =>
    TIME_SIGNATURE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  []);

  const soundOptions = useMemo(() =>
    METRONOME_SOUND_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  []);

  const subdivisionOptions = useMemo(() =>
    SUBDIVISION_OPTIONS.map((opt) => ({
      value: String(opt.value),
      label: opt.label,
    })),
  []);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* VU Meter with Time Signature, BPM Display and Transport Controls inside the housing */}
      <VUMeterDisplay
        mode="metronome"
        beatPosition={beatPosition}
        isMetronomePlaying={isMetronomePlaying}
        currentBeat={currentBeat}
        beatsPerMeasure={beatsPerMeasure}
        bpm={bpm}
        metronomeStartTime={metronomeStartTime}
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
                variant="light"
                showGlassOverlay
              />
            </View>
            <View style={styles.tunerWrapper}>
              <FrequencyTuner
                label="SOUND"
                value={soundType}
                options={soundOptions}
                onChange={(val) => onSoundTypeChange(val as MetronomeSoundType)}
                variant="light"
                showGlassOverlay
              />
            </View>
            <View style={styles.tunerWrapper}>
              <FrequencyTuner
                label="SUBDIVISION"
                value={String(subdivision)}
                options={subdivisionOptions}
                onChange={(val) => onSubdivisionChange(Number(val) as Subdivision)}
                variant="light"
                showGlassOverlay
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

        {/* Session Timer - tape counter style (inside same device flow) */}
        {showTimer && (
          <View style={styles.timerSection}>
            <RamsTapeCounterDisplay
              seconds={sessionSeconds}
              compact={compact}
              label="PRACTICE TIME"
            />
          </View>
        )}

        {/* Transport Controls - play/pause, reset, complete */}
        {showTransport && (
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
        )}
      </VUMeterDisplay>
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
  timerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  transportSection: {
    marginTop: 20,
  },
});
