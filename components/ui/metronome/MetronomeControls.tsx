import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
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
 * Subdivision selector for metronome using GangSwitch.
 * Time signature is now part of MetronomePanel.
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
      <GangSwitch
        label="SUBDIVISION"
        value={String(subdivision)}
        options={subdivisionOptions}
        onChange={(val) => val && onSubdivisionChange(Number(val) as Subdivision)}
        disabled={readonly}
        orientation="horizontal"
        allowDeselect={false}
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
