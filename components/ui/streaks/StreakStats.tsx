import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FlameLevel, formatStreakText, FLAME_COLORS } from '@/types/streak';

interface StreakStatsProps {
  currentStreak: number;
  longestStreak: number;
  flameLevel: FlameLevel;
  isActive: boolean;
}

/**
 * Displays current and longest streak statistics
 */
export const StreakStats: React.FC<StreakStatsProps> = ({
  currentStreak,
  longestStreak,
  flameLevel,
  isActive,
}) => {
  const flameColors = FLAME_COLORS[flameLevel];

  return (
    <View style={styles.container}>
      {/* Current Streak */}
      <View style={styles.mainStat}>
        <Text
          style={[
            styles.streakNumber,
            { color: isActive ? flameColors.primary : Colors.graphite },
          ]}
        >
          {currentStreak}
        </Text>
        <Text style={styles.streakLabel}>
          {currentStreak === 1 ? 'day' : 'days'}
        </Text>
      </View>

      {/* Longest Streak (secondary) */}
      <View style={styles.secondaryStat}>
        <Text style={styles.secondaryLabel}>Longest</Text>
        <Text style={styles.secondaryValue}>{formatStreakText(longestStreak)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakNumber: {
    fontFamily: 'LexendDecaBold',
    fontSize: 48,
    lineHeight: 56,
  },
  streakLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 18,
    color: Colors.graphite,
  },
  secondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  secondaryLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.warmGray,
  },
  secondaryValue: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 14,
    color: Colors.graphite,
  },
});
