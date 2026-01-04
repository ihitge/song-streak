/**
 * TunerPanel Component
 *
 * Composite component combining all tuner elements in a unified housing:
 * - Tuning mode selector (FrequencyTuner at top)
 * - VU-style swing meter with note display
 * - String selector
 * - Transport controls (Start/Stop)
 *
 * Design matches MetronomePanel's Industrial Play aesthetic.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FrequencyTuner } from '@/components/ui/filters/FrequencyTuner';
import { TunerVUMeter } from './TunerVUMeter';
import { TunerStringSelector } from './TunerStringSelector';
import { TunerControls } from './TunerControls';
import type { GuitarString, TunerStatus, TuningDirection } from '@/types/tuner';

// Tuning mode options
const TUNING_OPTIONS = [
  { value: 'standard', label: 'STANDARD' },
  { value: 'dropD', label: 'DROP D' },
  { value: 'halfDown', label: 'HALF DOWN' },
  { value: 'openG', label: 'OPEN G' },
];

interface TunerPanelProps {
  // Tuner state
  detectedString: GuitarString | null;
  frequency: number | null;
  cents: number | null;
  direction: TuningDirection;
  status: TunerStatus;
  isInTune: boolean;
  signalStrength: number;
  hasPermission: boolean;
  permissionStatus: 'undetermined' | 'granted' | 'denied';

  // Callbacks
  onStart: () => void;
  onStop: () => void;
  onStringSelect?: (string: GuitarString) => void;

  // Options
  fullWidth?: boolean;
  compact?: boolean;
}

export const TunerPanel: React.FC<TunerPanelProps> = ({
  detectedString,
  frequency,
  cents,
  direction,
  status,
  isInTune,
  signalStrength,
  hasPermission,
  permissionStatus,
  onStart,
  onStop,
  onStringSelect,
  fullWidth = false,
  compact = false,
}) => {
  const isActive = status !== 'idle';

  // Tuning mode state (future feature - currently just visual)
  const [tuningMode, setTuningMode] = React.useState('standard');

  return (
    <View style={[styles.housing, compact && styles.housingCompact, fullWidth && styles.housingFullWidth]}>
      {/* Header: Tuning mode selector - inside housing like metronome */}
      <View style={[styles.headerContainer, compact && styles.headerContainerCompact]}>
        <FrequencyTuner
          label="TUNING"
          value={tuningMode}
          options={TUNING_OPTIONS}
          onChange={setTuningMode}
          size="compact"
          variant="light"
          showGlassOverlay
          labelColor={Colors.vermilion}
        />
      </View>

      {/* VU Meter with note display */}
      <TunerVUMeter
        cents={cents}
        direction={direction}
        isInTune={isInTune}
        isActive={isActive}
        detectedString={detectedString}
        compact={compact}
      />

      {/* String selector */}
      <View style={styles.stringSection}>
        <TunerStringSelector
          detectedString={detectedString}
          isInTune={isInTune}
          onStringSelect={onStringSelect}
          isActive={isActive}
        />
      </View>

      {/* Transport controls */}
      <View style={styles.controlsSection}>
        <TunerControls
          status={status}
          signalStrength={signalStrength}
          hasPermission={hasPermission}
          permissionStatus={permissionStatus}
          onStart={onStart}
          onStop={onStop}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  housingCompact: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  housingFullWidth: {
    maxWidth: '100%',
  },
  headerContainer: {
    width: '100%',
    marginBottom: 8,
  },
  headerContainerCompact: {
    marginBottom: 6,
  },
  stringSection: {
    width: '100%',
    marginTop: 12,
  },
  controlsSection: {
    marginTop: 16,
  },
});
