import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

export interface FilterDeckProps {
  children: ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export const FilterDeck: React.FC<FilterDeckProps> = ({
  children,
  spacing = 12,
  style,
}) => {
  return (
    <View style={[styles.deck, { gap: spacing }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  deck: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.matteFog,
  },
});
