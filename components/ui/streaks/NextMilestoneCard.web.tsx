import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CalendarCheck,
  CalendarDays,
  Brain,
  Calendar,
  Gem,
  CalendarRange,
  Hourglass,
  Trophy,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import {
  LifetimeMilestone,
  MILESTONE_TIER_COLORS,
  STREAK_MILESTONES,
} from '@/types/milestones';

interface NextMilestoneCardProps {
  milestone: LifetimeMilestone | null;
  currentStreak: number;
  progress: number; // 0-100
}

// Icon mapping for streak milestones
const STREAK_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'calendar-check': CalendarCheck,
  'calendar-days': CalendarDays,
  brain: Brain,
  calendar: Calendar,
  gem: Gem,
  'calendar-range': CalendarRange,
  hourglass: Hourglass,
  trophy: Trophy,
};

/**
 * Web fallback for NextMilestoneCard
 * Uses LinearGradient instead of Skia for gradient effects
 */
export const NextMilestoneCard: React.FC<NextMilestoneCardProps> = ({
  milestone,
  currentStreak,
  progress,
}) => {
  // Handle no next milestone (all unlocked!)
  if (!milestone) {
    return (
      <View style={styles.container}>
        <View style={styles.allUnlockedContainer}>
          <Trophy size={32} color="#FFD700" />
          <Text style={styles.allUnlockedText}>All Streak Milestones Unlocked!</Text>
          <Text style={styles.allUnlockedSubtext}>
            You've mastered the art of consistency
          </Text>
        </View>
      </View>
    );
  }

  const tierColors = MILESTONE_TIER_COLORS[milestone.tier];
  const IconComponent = STREAK_ICON_MAP[milestone.icon] || Trophy;
  const daysRemaining = milestone.threshold - currentStreak;
  const isNearing = progress >= 80;

  return (
    <View style={styles.container}>
      {/* Header with icon and title */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {/* Glow effect when nearing completion */}
          {isNearing && (
            <View
              style={[
                styles.iconGlow,
                { backgroundColor: `${tierColors.primary}40` },
              ]}
            />
          )}
          {/* Icon background with gradient */}
          <LinearGradient
            colors={tierColors.gradient as [string, string, ...string[]]}
            style={styles.iconBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconComponent
              size={20}
              color={milestone.tier === 'diamond' ? '#0E273C' : Colors.softWhite}
              strokeWidth={2}
            />
          </LinearGradient>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.nextLabel}>NEXT MILESTONE</Text>
          <Text style={styles.title}>{milestone.title}</Text>
          <Text style={styles.threshold}>{milestone.threshold} days</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: tierColors.primary,
              },
            ]}
          />
          {/* Glow overlay when nearing */}
          {isNearing && (
            <View
              style={[
                styles.progressGlow,
                {
                  width: `${progress}%`,
                  shadowColor: tierColors.primary,
                },
              ]}
            />
          )}
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.currentValue}>{currentStreak} days</Text>
          <Text style={[styles.remainingValue, isNearing && { color: tierColors.primary }]}>
            {daysRemaining} more to go!
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Helper function to get the next streak milestone for a user
 */
export function getNextStreakMilestone(
  currentStreak: number,
  unlockedIds: string[]
): { milestone: LifetimeMilestone | null; progress: number } {
  // Find the first streak milestone not yet unlocked
  const sortedMilestones = [...STREAK_MILESTONES].sort(
    (a, b) => a.threshold - b.threshold
  );

  for (const milestone of sortedMilestones) {
    if (!unlockedIds.includes(milestone.id)) {
      const progress = Math.min(100, Math.round((currentStreak / milestone.threshold) * 100));
      return { milestone, progress };
    }
  }

  // All milestones unlocked
  return { milestone: null, progress: 100 };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 16,
    // Inset effect
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 14,
    opacity: 0.6,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  nextLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.vermilion,
    letterSpacing: 2,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.softWhite,
    marginTop: 2,
  },
  threshold: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: Colors.graphite,
    marginTop: 2,
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentValue: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: Colors.graphite,
  },
  remainingValue: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.warmGray,
  },
  // All unlocked state
  allUnlockedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  allUnlockedText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
  allUnlockedSubtext: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: Colors.graphite,
    textAlign: 'center',
  },
});
