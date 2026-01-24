import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { BORDER_RADIUS, SPACING } from '@/constants/Styles';

interface TheorySectionProps {
  label: string;
  children: ReactNode;
}

/**
 * TheorySection - Reusable section container for Theory tab.
 * Follows SettingsTab pattern with section label + alloy content box.
 */
export const TheorySection: React.FC<TheorySectionProps> = ({ label, children }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'LexendDecaSemiBold',
    color: Colors.warmGray,
    letterSpacing: 2,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: Colors.alloy,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.lg,
    shadowColor: Colors.ink,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
