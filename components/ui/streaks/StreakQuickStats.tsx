import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Trophy, Snowflake } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { FlameLevel, FLAME_COLORS } from '@/types/streak';

interface StreakQuickStatsProps {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  flameLevel: FlameLevel;
  isActive: boolean;
}

/**
 * Inline stats row showing streak, record, and freezes
 * Dark theme optimized for ink background
 */
export const StreakQuickStats: React.FC<StreakQuickStatsProps> = ({
  currentStreak,
  longestStreak,
  freezesAvailable,
  flameLevel,
  isActive,
}) => {
  const flameColor = isActive ? FLAME_COLORS[flameLevel].primary : Colors.warmGray;
  const isPersonalBest = currentStreak > 0 && currentStreak >= longestStreak;

  return (
    <View style={styles.container}>
      {/* Current Streak - Primary stat */}
      <View style={styles.primaryStat}>
        <Flame
          size={28}
          color={flameColor}
          fill={isActive ? `${flameColor}40` : 'transparent'}
        />
        <Text style={[styles.primaryValue, isActive && { color: flameColor }]}>
          {currentStreak}
        </Text>
        <Text style={styles.primaryLabel}>DAY STREAK</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Longest Streak */}
      <View style={styles.secondaryStat}>
        <Trophy
          size={18}
          color={isPersonalBest ? '#FFD700' : Colors.graphite}
          fill={isPersonalBest ? '#FFD70040' : 'transparent'}
        />
        <Text style={[styles.secondaryValue, isPersonalBest && styles.personalBest]}>
          {longestStreak}
        </Text>
        <Text style={styles.secondaryLabel}>BEST</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Streak Freezes */}
      <View style={styles.secondaryStat}>
        <Snowflake
          size={18}
          color={freezesAvailable > 0 ? '#38BDF8' : Colors.graphite}
        />
        <Text style={[styles.secondaryValue, freezesAvailable > 0 && styles.freezeActive]}>
          {freezesAvailable}
        </Text>
        <Text style={styles.secondaryLabel}>FREEZE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    // Inset effect
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  primaryStat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  primaryValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 32,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  primaryLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  secondaryStat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  secondaryValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 20,
    color: Colors.graphite,
  },
  secondaryLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 8,
    color: Colors.warmGray,
    letterSpacing: 1,
  },
  personalBest: {
    color: '#FFD700',
  },
  freezeActive: {
    color: '#38BDF8',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
