/**
 * ChordVisualization.web - Unified wrapper for instrument-specific chord diagrams (Web)
 * Delegates rendering to the appropriate instrument renderer
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { lookupChord, getDefaultVoicing } from '@/data/chords';
import type { InstrumentType } from '@/types/chords';
// Explicitly import web version
import { GuitarChordDiagram } from './GuitarChordDiagram.web';

interface ChordVisualizationProps {
  /** The chord name to display (e.g., "Am", "G7", "F#m") */
  chord: string;
  /** The instrument type */
  instrument: InstrumentType;
  /** Which voicing to display (default: 0 = first/default voicing) */
  voicingIndex?: number;
  /** Whether to show finger numbers on dots */
  showFingers?: boolean;
  /** Display size */
  size?: 'small' | 'medium' | 'large';
  /** Show chord name above diagram */
  showChordName?: boolean;
}

export const ChordVisualization: React.FC<ChordVisualizationProps> = ({
  chord,
  instrument,
  voicingIndex = 0,
  showFingers = true,
  size = 'medium',
  showChordName = true,
}) => {
  // Lookup chord in dictionary
  const lookupResult = lookupChord(chord);

  // Only render for supported instruments
  const supportedInstruments: InstrumentType[] = ['guitar'];

  if (!supportedInstruments.includes(instrument)) {
    return (
      <View style={styles.unsupportedContainer}>
        <Text style={styles.unsupportedText}>
          Chord diagrams not available for {instrument}
        </Text>
      </View>
    );
  }

  // Handle unknown chords
  if (lookupResult.status === 'unknown') {
    return (
      <View style={styles.unknownContainer}>
        <Text style={styles.chordName}>{lookupResult.displayName}</Text>
        <Text style={styles.unknownText}>Fingering not available</Text>
      </View>
    );
  }

  // Handle similar chords (suggest alternatives)
  if (lookupResult.status === 'similar') {
    return (
      <View style={styles.unknownContainer}>
        <Text style={styles.chordName}>{lookupResult.displayName}</Text>
        <Text style={styles.unknownText}>Did you mean:</Text>
        <Text style={styles.suggestionsText}>
          {lookupResult.suggestions?.join(', ')}
        </Text>
      </View>
    );
  }

  // Safety check: ensure chord definition exists
  if (!lookupResult.chord) {
    return (
      <View style={styles.unknownContainer}>
        <Text style={styles.chordName}>{lookupResult.displayName}</Text>
        <Text style={styles.unknownText}>Chord data unavailable</Text>
      </View>
    );
  }

  // Get the chord definition and voicing with bounds checking
  const chordDef = lookupResult.chord;
  const safeVoicingIndex = Math.min(
    voicingIndex,
    Math.max(0, chordDef.voicings.length - 1),
  );
  const voicing = chordDef.voicings[safeVoicingIndex] || getDefaultVoicing(chordDef);

  // Handle case where voicing is null (shouldn't happen but be safe)
  if (!voicing) {
    return (
      <View style={styles.unknownContainer}>
        <Text style={styles.chordName}>{lookupResult.displayName}</Text>
        <Text style={styles.unknownText}>No voicing available</Text>
      </View>
    );
  }

  // Show warning for partial chords
  const showWarning = lookupResult.status === 'partial' && lookupResult.warning;

  // Render guitar chord diagram
  if (instrument === 'guitar') {
    return (
      <View>
        {showChordName && (
          <Text style={styles.chordName}>{chordDef.display}</Text>
        )}
        <GuitarChordDiagram
          fingering={voicing}
          rootNote={chordDef.root}
          showFingers={showFingers}
          size={size}
        />
        {showWarning && (
          <Text style={styles.warningText}>{lookupResult.warning}</Text>
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  unsupportedContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alloy,
    borderRadius: 8,
  },
  unsupportedText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.warmGray,
    textAlign: 'center',
  },
  unknownContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    minWidth: 150,
    gap: 4,
  },
  chordName: {
    fontSize: 18,
    fontFamily: 'LexendDecaBold',
    color: Colors.charcoal,
  },
  unknownText: {
    fontSize: 11,
    fontFamily: 'LexendDecaRegular',
    color: Colors.warmGray,
    fontStyle: 'italic',
  },
  suggestionsText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
  },
  warningText: {
    fontSize: 10,
    fontFamily: 'LexendDecaRegular',
    color: Colors.warmGray,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default ChordVisualization;
