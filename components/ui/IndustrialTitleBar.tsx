import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface IndustrialTitleBarProps {
  /**
   * Title text to display (will be uppercase)
   */
  title: string;
  /**
   * Compact mode for smaller spaces
   */
  compact?: boolean;
}

/**
 * Industrial-style title bar with circle motifs
 * Matches the "equipment panel" aesthetic with decorative circles on each side
 *
 * Usage:
 * <IndustrialTitleBar title="METRONOME" />
 */
export const IndustrialTitleBar: React.FC<IndustrialTitleBarProps> = ({
  title,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.circle, compact && styles.circleCompact]} />
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.circle, compact && styles.circleCompact]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
  },
  containerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.warmGray,
  },
  circleCompact: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.vermilion,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 10,
    letterSpacing: 2,
  },
});

export default IndustrialTitleBar;
