/**
 * PivotScrew Component
 *
 * Reusable pivot screw element for VU meters and needle displays.
 * Provides consistent styling for the decorative screw at the base
 * of analog-style needle indicators.
 *
 * Used in:
 * - TunerVUMeter
 * - VUMeterDisplay
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface PivotScrewProps {
  /** Compact mode - smaller screw for compact meter displays */
  compact?: boolean;
  /** Additional style overrides */
  style?: ViewStyle;
}

export const PivotScrew: React.FC<PivotScrewProps> = ({
  compact = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.screw,
        compact && styles.screwCompact,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  screw: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.charcoal,
    borderWidth: 2,
    borderColor: '#555',
    position: 'absolute',
    bottom: 0,
  },
  screwCompact: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
});

export default PivotScrew;
