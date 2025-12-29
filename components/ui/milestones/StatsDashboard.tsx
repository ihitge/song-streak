import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, Music, Flame, Trophy } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { UserGlobalStats, formatHours } from '@/types/milestones';

interface StatsDashboardProps {
  stats: UserGlobalStats;
  totalMilestones?: number;
  unlockedMilestones?: number;
  compact?: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, highlight }) => (
  <View style={[styles.card, highlight && styles.cardHighlight]}>
    <View style={styles.cardIcon}>{icon}</View>
    <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>
      {value}
    </Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

/**
 * Dashboard displaying global practice statistics
 */
export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  totalMilestones = 0,
  unlockedMilestones = 0,
  compact = false,
}) => {
  const hasActiveStreak = stats.current_streak > 0;

  if (compact) {
    // Compact inline version
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactStat}>
          <Clock size={14} color={Colors.graphite} />
          <Text style={styles.compactValue}>
            {formatHours(stats.total_practice_seconds)}
          </Text>
        </View>
        <View style={styles.compactDivider} />
        <View style={styles.compactStat}>
          <Music size={14} color={Colors.graphite} />
          <Text style={styles.compactValue}>{stats.songs_mastered}</Text>
        </View>
        <View style={styles.compactDivider} />
        <View style={styles.compactStat}>
          <Flame
            size={14}
            color={hasActiveStreak ? Colors.vermilion : Colors.graphite}
          />
          <Text
            style={[
              styles.compactValue,
              hasActiveStreak && styles.compactValueActive,
            ]}
          >
            {stats.current_streak}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard
          icon={<Clock size={20} color={Colors.vermilion} />}
          value={formatHours(stats.total_practice_seconds)}
          label="Total Practice"
        />
        <StatCard
          icon={<Music size={20} color={Colors.moss} />}
          value={String(stats.songs_mastered)}
          label="Songs Mastered"
        />
      </View>
      <View style={styles.row}>
        <StatCard
          icon={
            <Flame
              size={20}
              color={hasActiveStreak ? Colors.vermilion : Colors.warmGray}
            />
          }
          value={String(stats.current_streak)}
          label="Current Streak"
          highlight={hasActiveStreak}
        />
        <StatCard
          icon={<Trophy size={20} color="#FFD700" />}
          value={`${unlockedMilestones} / ${totalMilestones}`}
          label="Trophies"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    // Inset effect
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  cardHighlight: {
    borderColor: `${Colors.vermilion}40`,
  },
  cardIcon: {
    marginBottom: 2,
  },
  cardValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 22,
    color: Colors.softWhite,
  },
  cardValueHighlight: {
    color: Colors.vermilion,
  },
  cardLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.charcoal,
    borderRadius: 8,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactValue: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 14,
    color: Colors.graphite,
  },
  compactValueActive: {
    color: Colors.vermilion,
  },
  compactDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.warmGray,
    opacity: 0.3,
  },
});
