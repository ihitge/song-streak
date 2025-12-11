import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BPMDisplay } from './BPMDisplay';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { RotaryKnob } from '@/components/ui/filters/RotaryKnob';
import {
  Subdivision,
  TIME_SIGNATURE_OPTIONS,
  SUBDIVISION_OPTIONS,
} from '@/types/metronome';

interface MetronomeControlsProps {
  // BPM controls (optional - omit when using MetronomePanel)
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  onTapTempo?: () => number | null;

  // Time signature
  timeSignature: string;
  onTimeSignatureChange: (ts: string) => void;

  // Subdivision
  subdivision: Subdivision;
  onSubdivisionChange: (sub: Subdivision) => void;

  // State
  isPlaying?: boolean;
  compact?: boolean;
  readonly?: boolean;  // For song-specific mode
}

/**
 * Metronome Controls Component
 *
 * Combines BPM display, time signature rotary knob, and subdivision gang switch
 * into a unified control panel following the Industrial Play aesthetic.
 */
export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  bpm,
  onBpmChange,
  onTapTempo,
  timeSignature,
  onTimeSignatureChange,
  subdivision,
  onSubdivisionChange,
  isPlaying = false,
  compact = false,
  readonly = false,
}) => {
  // Check if BPM controls should be shown
  const showBpmControls = bpm !== undefined && onBpmChange !== undefined && onTapTempo !== undefined;

  // Convert options for components
  const timeSignatureOptions = TIME_SIGNATURE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const subdivisionOptions = SUBDIVISION_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Top row: BPM Display (optional - omit when using MetronomePanel) */}
      {showBpmControls && (
        <View style={styles.bpmRow}>
          <BPMDisplay
            bpm={bpm}
            onBpmChange={onBpmChange}
            onTapTempo={onTapTempo}
            isPlaying={isPlaying}
            compact={compact}
            readonly={readonly}
          />
        </View>
      )}

      {/* Bottom row: Time Signature and Subdivision */}
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        {/* Time Signature (RotaryKnob) */}
        <View style={styles.controlWrapper}>
          <RotaryKnob
            label="TIME SIG"
            value={timeSignature}
            options={timeSignatureOptions}
            onChange={onTimeSignatureChange}
            disabled={readonly}
          />
        </View>

        {/* Subdivision (GangSwitch) */}
        <View style={styles.controlWrapper}>
          <GangSwitch
            label="SUBDIVISION"
            value={String(subdivision)}
            options={subdivisionOptions}
            onChange={(val) => onSubdivisionChange(Number(val) as Subdivision)}
            disabled={readonly}
            orientation="horizontal"
            allowDeselect={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingHorizontal: 16,
  },
  containerCompact: {
    gap: 12,
    paddingHorizontal: 8,
  },
  bpmRow: {
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  controlsRowCompact: {
    gap: 8,
  },
  controlWrapper: {
    flex: 1,
  },
});
