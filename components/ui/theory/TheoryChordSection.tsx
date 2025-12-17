/**
 * TheoryChordSection - Container for chord diagrams displayed inline
 * Shows chord diagrams in a single column with delete buttons
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Music, Plus, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useChordChartSound } from '@/hooks/useChordChartSound';
import type { InstrumentType } from '@/types/chords';
import { GuitarChordDiagram } from './chords/GuitarChordDiagram';
import { lookupChord } from '@/data/chords';

interface TheoryChordSectionProps {
  /** Section label */
  label?: string;
  /** Array of chord names */
  chords: string[];
  /** The instrument type (determines if diagrams are available) */
  instrument: InstrumentType;
  /** Custom chip color */
  chipColor?: string;
  /** Text to show when no chords */
  emptyText?: string;
  /** Enable add/delete mode */
  editable?: boolean;
  /** Callback to open add chord modal */
  onAddChord?: () => void;
  /** Callback when chord is deleted */
  onDeleteChord?: (chord: string) => void;
}

export const TheoryChordSection: React.FC<TheoryChordSectionProps> = ({
  label = 'HARMONY',
  chords,
  instrument,
  emptyText = 'No chords detected',
  editable = false,
  onAddChord,
  onDeleteChord,
}) => {
  const { playSound } = useChordChartSound();

  const handleAddPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onAddChord?.();
  };

  const handleDeletePress = async (chord: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onDeleteChord?.(chord);
  };

  return (
    <View style={styles.container}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Music size={12} color={Colors.warmGray} />
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Chord diagrams in single column */}
      <View style={styles.diagramColumn}>
        {chords && chords.length > 0 ? (
          chords.map((chord, index) => {
            const lookupResult = lookupChord(chord);
            const fingering = lookupResult.chord?.voicings[0];
            const isGuitar = instrument.toLowerCase() === 'guitar';
            const canShowDiagram = fingering && isGuitar;

            return (
              <View key={`${chord}-${index}`} style={styles.diagramCard}>
                <View style={styles.diagramWrapper}>
                  {canShowDiagram ? (
                    <GuitarChordDiagram
                      fingering={fingering}
                      chordName={lookupResult.displayName}
                      size="medium"
                    />
                  ) : (
                    <View style={styles.fallbackContainer}>
                      <Text style={styles.chordNameFallback}>
                        {lookupResult.displayName}
                      </Text>
                      {!isGuitar && (
                        <Text style={styles.nodiagramText}>
                          Diagram not available for {instrument}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Delete button */}
                {editable && onDeleteChord && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePress(chord)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Trash2 size={14} color={Colors.vermilion} strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>{emptyText}</Text>
        )}
      </View>

      {/* Add chord button at bottom */}
      {editable && onAddChord && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          activeOpacity={0.7}
        >
          <Plus size={14} color={Colors.vermilion} strokeWidth={2.5} />
          <Text style={styles.addButtonText}>ADD CHORD</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  diagramColumn: {
    flexDirection: 'column',
    gap: 12,
  },
  diagramCard: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 8,
    // Industrial Play bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  diagramWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  fallbackContainer: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  chordNameFallback: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.charcoal,
  },
  nodiagramText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    fontStyle: 'italic',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    zIndex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.vermilion,
    borderStyle: 'dashed',
    gap: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.vermilion,
    letterSpacing: 1,
  },
});

export default TheoryChordSection;
