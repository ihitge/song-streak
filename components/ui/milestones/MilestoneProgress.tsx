import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LifetimeMilestone, formatMilestoneThreshold, MILESTONE_TIER_COLORS } from '@/types/milestones';

interface MilestoneProgressProps {
  milestone: LifetimeMilestone;
  currentValue: number;
  progress: number; // 0-100
}

/**
 * Progress bar toward next milestone
 */
export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  milestone,
  currentValue,
  progress,
}) => {
  const tierColors = MILESTONE_TIER_COLORS[milestone.tier];
  const isComplete = progress >= 100;
  const isNearing = progress >= 90 && progress < 100;

  // Format current value based on category
  const formatCurrentValue = () => {
    switch (milestone.category) {
      case 'time':
        const hours = Math.floor(currentValue / 3600);
        const mins = Math.floor((currentValue % 3600) / 60);
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
      case 'songs':
        return `${currentValue} song${currentValue !== 1 ? 's' : ''}`;
      case 'streak':
        return `${currentValue} day${currentValue !== 1 ? 's' : ''}`;
      case 'genre':
        return `${currentValue} songs`;
      default:
        return String(currentValue);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{milestone.title}</Text>
        <Text style={[styles.percentage, isComplete && styles.percentageComplete]}>
          {isComplete ? 'Complete!' : `${progress}%`}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, progress)}%`,
              backgroundColor: isComplete
                ? Colors.moss
                : isNearing
                ? tierColors.primary
                : Colors.vermilion,
            },
          ]}
        />
        {/* Glow effect when nearing */}
        {isNearing && (
          <View
            style={[
              styles.glowFill,
              {
                width: `${progress}%`,
                backgroundColor: tierColors.primary,
              },
            ]}
          />
        )}
      </View>

      {/* Progress text */}
      <View style={styles.progressRow}>
        <Text style={styles.currentValue}>{formatCurrentValue()}</Text>
        <Text style={styles.targetValue}>/ {formatMilestoneThreshold(milestone)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 14,
    color: Colors.softWhite,
  },
  percentage: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.vermilion,
  },
  percentageComplete: {
    color: Colors.moss,
  },
  track: {
    height: 8,
    backgroundColor: Colors.charcoal,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  glowFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
    opacity: 0.3,
    // @ts-ignore - web shadow
    filter: 'blur(4px)',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  currentValue: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: Colors.graphite,
  },
  targetValue: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.warmGray,
  },
});
