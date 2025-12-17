import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

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
    borderRadius: 8,
    padding: 16,
    gap: 16,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
});
