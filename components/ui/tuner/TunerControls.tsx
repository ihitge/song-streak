/**
 * TunerControls Component
 *
 * Controls for the tuner including:
 * - Instrument selector (Guitar / Bass)
 * - String indicators with LED feedback
 * - Start/Stop button
 * - Reference pitch display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Guitar, Music2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';
import { type InstrumentType, type StringConfig } from '@/constants/TunerConfig';

interface TunerControlsProps {
  /** Currently selected instrument */
  instrument: InstrumentType;
  /** Callback when instrument changes */
  onInstrumentChange: (instrument: InstrumentType) => void;
  /** String configurations for current instrument */
  strings: StringConfig[];
  /** Target string being tuned */
  targetString: StringConfig | null;
  /** Whether tuner is listening */
  isListening: boolean;
  /** Whether tuner is ready */
  isReady: boolean;
  /** Toggle tuner on/off */
  onToggle: () => void;
  /** Whether microphone permission is granted */
  hasPermission: boolean;
  /** Request microphone permission */
  onRequestPermission: () => void;
}

// Instrument options for GangSwitch
const instrumentOptions: { value: InstrumentType; label: string; icon: typeof Guitar }[] = [
  { value: 'guitar', label: 'GUITAR', icon: Guitar },
  { value: 'bass4', label: '4-STR BASS', icon: Music2 },
  { value: 'bass5', label: '5-STR BASS', icon: Music2 },
];

/**
 * TunerControls - Instrument selector and string indicators
 */
export const TunerControls: React.FC<TunerControlsProps> = ({
  instrument,
  onInstrumentChange,
  strings,
  targetString,
  isListening,
  isReady,
  onToggle,
  hasPermission,
  onRequestPermission,
}) => {
  // Handle instrument change
  const handleInstrumentChange = (value: InstrumentType | null) => {
    if (value) {
      onInstrumentChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {/* Instrument Selector */}
      <View style={styles.instrumentSection}>
        <GangSwitch
          label="INSTRUMENT"
          value={instrument}
          options={instrumentOptions}
          onChange={handleInstrumentChange}
          showIcons
          allowDeselect={false}
        />
      </View>

      {/* String Indicators */}
      <View style={styles.stringsSection}>
        <Text style={styles.sectionLabel}>STRINGS</Text>
        <View style={styles.stringsRow}>
          {strings.map((str) => {
            const isTarget = targetString?.number === str.number;
            return (
              <View key={str.number} style={styles.stringIndicator}>
                <LEDIndicator
                  size={20}
                  isActive={isListening && isTarget}
                  color={isTarget ? Colors.vermilion : Colors.moss}
                />
                <Text
                  style={[
                    styles.stringNote,
                    isTarget && isListening && styles.stringNoteActive,
                  ]}
                >
                  {str.note}
                </Text>
                <Text style={styles.stringOctave}>{str.octave}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Start/Stop Button */}
      <View style={styles.buttonSection}>
        {!hasPermission ? (
          <PrimaryButton
            label="ENABLE MIC"
            onPress={onRequestPermission}
            accessibilityLabel="Enable microphone access"
            accessibilityHint="Grants microphone permission for tuner"
          />
        ) : (
          <PrimaryButton
            label={isListening ? 'STOP' : 'START TUNER'}
            onPress={onToggle}
            disabled={!isReady}
            variant={isListening ? 'secondary' : 'primary'}
            accessibilityLabel={isListening ? 'Stop tuner' : 'Start tuner'}
            accessibilityHint={isListening ? 'Stops pitch detection' : 'Starts pitch detection'}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  instrumentSection: {
    // GangSwitch has its own styling
  },
  stringsSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stringIndicator: {
    alignItems: 'center',
    gap: 4,
    minWidth: 36,
  },
  stringNote: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.softWhite,
  },
  stringNoteActive: {
    color: Colors.vermilion,
  },
  stringOctave: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.graphite,
  },
  buttonSection: {
    marginTop: 8,
  },
});
