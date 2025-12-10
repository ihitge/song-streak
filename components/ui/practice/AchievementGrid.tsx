import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { AchievementBadge } from './AchievementBadge';
import { ACHIEVEMENTS, getNextAchievement, formatPracticeTime } from '@/types/practice';

interface AchievementGridProps {
  unlockedAchievementIds: string[];
  totalSeconds: number;
  compact?: boolean;
}

/**
 * Grid displaying all achievements with progress to next
 */
export const AchievementGrid: React.FC<AchievementGridProps> = ({
  unlockedAchievementIds,
  totalSeconds,
  compact = false,
}) => {
  const nextAchievement = getNextAchievement(totalSeconds, unlockedAchievementIds);
  const secondsUntilNext = nextAchievement
    ? nextAchievement.threshold_seconds - totalSeconds
    : 0;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, compact && styles.titleCompact]}>ACHIEVEMENTS</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {unlockedAchievementIds.length} / {ACHIEVEMENTS.length} Unlocked
        </Text>
      </View>

      {/* Next achievement progress */}
      {nextAchievement && (
        <View style={[styles.progressContainer, compact && styles.progressContainerCompact]}>
          <Text style={[styles.progressLabel, compact && styles.progressLabelCompact]}>
            Next: {nextAchievement.title}
          </Text>
          <Text style={[styles.progressTime, compact && styles.progressTimeCompact]}>
            {formatPracticeTime(secondsUntilNext)} remaining
          </Text>
        </View>
      )}

      {/* Badge grid */}
      <View style={[styles.grid, compact && styles.gridCompact]}>
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedAchievementIds.includes(achievement.id)}
            compact={compact}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 16,
    // Inset effect
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.8)',
  },
  containerCompact: {
    padding: 12,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  titleCompact: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
  },
  subtitleCompact: {
    fontSize: 10,
  },
  progressContainer: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainerCompact: {
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  progressLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.charcoal,
  },
  progressLabelCompact: {
    fontSize: 10,
  },
  progressTime: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.vermilion,
  },
  progressTimeCompact: {
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  gridCompact: {
    gap: 8,
  },
});
