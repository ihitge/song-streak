/**
 * EmptyState Component
 *
 * Reusable empty state display for lists and screens with no data.
 * Shows an icon, title, and optional subtitle.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon={Music}
 *   title="No songs yet"
 *   subtitle="Tap + to add your first song"
 * />
 * ```
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ICON_SIZES } from '@/constants/Styles';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Main title text */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Icon size - defaults to 48 */
  iconSize?: number;
  /** Icon color - defaults to Colors.warmGray */
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconSize = 48,
  iconColor = Colors.warmGray,
}) => {
  return (
    <View style={styles.container}>
      <Icon size={iconSize} color={iconColor} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.ink,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EmptyState;
