/**
 * ChordChip - Tappable chip component that displays chord name
 * Shows indicator if diagram is available, triggers modal on press
 */

import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Info, Sparkles, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { lookupChord } from '@/data/chords';
import type { InstrumentType } from '@/types/chords';

interface ChordChipProps {
  /** The chord name to display */
  chordName: string;
  /** The instrument type */
  instrument: InstrumentType;
  /** Callback when chip is pressed */
  onPress?: (chordName: string) => void;
  /** Custom chip color */
  chipColor?: string;
  /** Whether the chip is selected/active */
  isSelected?: boolean;
  /** Audio hook callback */
  playSound?: () => Promise<void>;
  /** Whether to show delete icon */
  deletable?: boolean;
  /** Callback when delete is pressed */
  onDelete?: (chordName: string) => void;
}

export const ChordChip: React.FC<ChordChipProps> = ({
  chordName,
  instrument,
  onPress,
  chipColor = Colors.vermilion,
  isSelected = false,
  playSound,
  deletable = false,
  onDelete,
}) => {
  // Check if diagram is available for this chord (static or generated)
  const lookupResult = lookupChord(chordName);
  const hasDiagram =
    (lookupResult.status === 'found' || lookupResult.status === 'generated') &&
    instrument === 'guitar';
  const isGenerated = lookupResult.isGenerated === true;

  const handlePress = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Audio feedback
    if (playSound) {
      await playSound();
    }

    // Trigger callback
    if (onPress) {
      onPress(chordName);
    }
  };

  const handleDelete = async () => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Audio feedback
    if (playSound) {
      await playSound();
    }

    // Trigger delete callback
    if (onDelete) {
      onDelete(chordName);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: chipColor },
        isSelected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={styles.chipText}>{lookupResult.displayName}</Text>

      {/* Indicator for chords with diagrams */}
      {hasDiagram && (
        <View style={styles.indicator}>
          {isGenerated ? (
            <Sparkles size={10} color={Colors.softWhite} strokeWidth={2.5} />
          ) : (
            <Info size={10} color={Colors.softWhite} strokeWidth={2.5} />
          )}
        </View>
      )}

      {/* Delete icon */}
      {deletable && onDelete && (
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <Trash2 size={12} color={Colors.softWhite} strokeWidth={2.5} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: Colors.softWhite,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: '#FFFFFF',
  },
  indicator: {
    marginLeft: 2,
    opacity: 0.7,
  },
  deleteButton: {
    marginLeft: 4,
    padding: 2,
    opacity: 0.7,
  },
});

export default ChordChip;
