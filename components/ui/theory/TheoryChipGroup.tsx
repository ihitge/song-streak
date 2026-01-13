import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface TheoryChipGroupProps {
  label: string;
  items: string[];
  chipColor: string;
  emptyText?: string;
  icon?: LucideIcon;
}

/**
 * TheoryChipGroup - Labeled chip container for displaying arrays of items.
 * Used for chords, scales, and techniques in the Theory tab.
 * Memoized to prevent unnecessary re-renders in parent components.
 */
export const TheoryChipGroup: React.FC<TheoryChipGroupProps> = React.memo(({
  label,
  items,
  chipColor,
  emptyText = 'No data detected',
  icon: Icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {Icon && <Icon size={12} color={Colors.warmGray} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.chipContainer}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={[styles.chip, { backgroundColor: chipColor }]}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{emptyText}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 10,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'LexendDecaSemiBold',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'LexendDecaRegular',
    color: Colors.graphite,
    fontStyle: 'italic',
  },
});
