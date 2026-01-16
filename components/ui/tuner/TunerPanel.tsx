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
import { RotaryKnob } from '@/components/ui/filters/RotaryKnob';
import { TunerVUMeter } from './TunerVUMeter';
import { TunerStringSelector } from './TunerStringSelector';
import { TunerControls } from './TunerControls';
import type { GuitarString, TunerStatus, TuningDirection, TuningType, BassTuningType, TunerInstrument } from '@/types/tuner';
import { getStringsForInstrumentTuning } from '@/types/tuner';

// Instrument options
const INSTRUMENT_OPTIONS = [
  { value: 'Guitar' as TunerInstrument, label: 'GUITAR' },
  { value: 'Bass' as TunerInstrument, label: 'BASS' },
];

// Guitar tuning options
const GUITAR_TUNING_OPTIONS = [
  { value: 'standard' as TuningType, label: 'STANDARD' },
  { value: 'dropD' as TuningType, label: 'DROP D' },
  { value: 'openG' as TuningType, label: 'OPEN G' },
  { value: 'openD' as TuningType, label: 'OPEN D' },
  { value: 'dadgad' as TuningType, label: 'DADGAD' },
];

// Bass tuning options (only standard for now)
const BASS_TUNING_OPTIONS = [
  { value: 'standard' as BassTuningType, label: 'STANDARD' },
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
  showControls?: boolean;
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
  showControls = true,
}) => {
  const isActive = status !== 'idle';

  // Instrument and tuning state
  const [instrument, setInstrument] = React.useState<TunerInstrument>('Guitar');
  const [tuningMode, setTuningMode] = React.useState<TuningType | BassTuningType>('standard');

  // Get tuning options based on instrument
  const tuningOptions = instrument === 'Bass' ? BASS_TUNING_OPTIONS : GUITAR_TUNING_OPTIONS;

  // Reset tuning to standard when switching instruments
  const handleInstrumentChange = (newInstrument: TunerInstrument) => {
    setInstrument(newInstrument);
    setTuningMode('standard'); // Reset to standard tuning
  };

  // Get strings for current instrument and tuning
  const tuningStrings = getStringsForInstrumentTuning(instrument, tuningMode);

  return (
    <View style={[styles.housing, compact && styles.housingCompact, fullWidth && styles.housingFullWidth]}>
      {/* Header: Instrument and Tuning selectors - two column layout */}
      <View style={[styles.headerContainer, compact && styles.headerContainerCompact]}>
        <View style={styles.selectorRow}>
          {/* Instrument selector - Rotary Knob style */}
          <View style={styles.selectorColumn}>
            <RotaryKnob
              label="INSTRUMENT"
              value={instrument}
              options={INSTRUMENT_OPTIONS}
              onChange={handleInstrumentChange}
              variant="light"
              showGlassOverlay
            />
          </View>
          {/* Tuning selector */}
          <View style={styles.selectorColumn}>
            <FrequencyTuner
              label="TUNING"
              value={tuningMode}
              options={tuningOptions}
              onChange={setTuningMode}
              size="compact"
              variant="light"
              showGlassOverlay
              labelColor={Colors.vermilion}
            />
          </View>
        </View>
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
          strings={tuningStrings}
        />
      </View>

      {/* Transport controls */}
      {showControls && (
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
      )}
    </View>
  );
};

// Match VU meter widths for consistent layout
const METER_WIDTH = 310;
const METER_WIDTH_COMPACT = 218;

const styles = StyleSheet.create({
  housing: {
    paddingTop: 16,
    paddingBottom: 16,
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
    alignItems: 'center',
    marginBottom: 40,
  },
  headerContainerCompact: {
    marginBottom: 20,
  },
  selectorRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  selectorColumn: {
    flex: 1,
  },
  stringSection: {
    width: '100%',
    marginTop: 40,
  },
  controlsSection: {
    marginTop: 20,
  },
});
