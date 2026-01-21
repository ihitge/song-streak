import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FrequencyTuner } from '@/components/ui/filters/FrequencyTuner';
import {
  Subdivision,
  SUBDIVISION_OPTIONS,
} from '@/types/metronome';

interface MetronomeControlsProps {
  // Subdivision
  subdivision: Subdivision;
  onSubdivisionChange: (sub: Subdivision) => void;

  // State
  compact?: boolean;
  readonly?: boolean;  // For song-specific mode
}

/**
 * Metronome Controls Component
 *
 * Subdivision selector for metronome using FrequencyTuner.
 * This component is now integrated into MetronomePanel's header row.
 */
export const MetronomeControls: React.FC<MetronomeControlsProps> = ({
  subdivision,
  onSubdivisionChange,
  compact = false,
  readonly = false,
}) => {
  const subdivisionOptions = SUBDIVISION_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
  }));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <FrequencyTuner
        label="SUB"
        value={String(subdivision)}
        options={subdivisionOptions}
        onChange={(val) => onSubdivisionChange(Number(val) as Subdivision)}
        disabled={readonly}
        variant="light"
        showGlassOverlay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  containerCompact: {
    paddingHorizontal: 8,
  },
});
