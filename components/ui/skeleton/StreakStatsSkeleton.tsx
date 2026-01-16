/**
 * StreakStatsSkeleton Component
 *
 * Skeleton placeholder matching the StreakQuickStats 3-column layout.
 * Used for loading states in the Streaks tab.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SkeletonBox } from './SkeletonBox';
import { SkeletonText } from './SkeletonText';
import { SkeletonVariant } from './SkeletonBase';

interface StreakStatsSkeletonProps {
  /**
   * Variant for different backgrounds
   */
  variant?: SkeletonVariant;
}

export const StreakStatsSkeleton: React.FC<StreakStatsSkeletonProps> = ({
  variant = 'dark',
}) => {
  return (
    <View style={styles.container}>
      {/* Primary stat (Day Streak) */}
      <View style={styles.primaryStat}>
        <SkeletonBox
          width={28}
          height={28}
          borderRadius={6}
          variant={variant}
        />
        <SkeletonText
          width={50}
          size="xl"
          variant={variant}
          style={styles.valueMargin}
        />
        <SkeletonText
          width={70}
          size="xs"
          variant={variant}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Secondary stat (Best) */}
      <View style={styles.secondaryStat}>
        <SkeletonBox
          width={18}
          height={18}
          borderRadius={4}
          variant={variant}
        />
        <SkeletonText
          width={30}
          size="lg"
          variant={variant}
          style={styles.valueMargin}
        />
        <SkeletonText
          width={32}
          size="xs"
          variant={variant}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Secondary stat (Freeze) */}
      <View style={styles.secondaryStat}>
        <SkeletonBox
          width={18}
          height={18}
          borderRadius={4}
          variant={variant}
        />
        <SkeletonText
          width={20}
          size="lg"
          variant={variant}
          style={styles.valueMargin}
        />
        <SkeletonText
          width={40}
          size="xs"
          variant={variant}
        />
      </View>
    </View>
  );
};

/**
 * TodayProgressHero skeleton - circular progress placeholder
 */
export const TodayProgressSkeleton: React.FC<{
  variant?: SkeletonVariant;
}> = ({ variant = 'dark' }) => {
  return (
    <View style={styles.heroContainer}>
      {/* Circular progress placeholder */}
      <SkeletonBox
        width={180}
        height={180}
        circle
        variant={variant}
      />
      {/* Label below */}
      <SkeletonText
        width={120}
        size="sm"
        variant={variant}
        style={styles.heroLabel}
      />
    </View>
  );
};

/**
 * NextMilestoneCard skeleton
 */
export const NextMilestoneSkeleton: React.FC<{
  variant?: SkeletonVariant;
}> = ({ variant = 'dark' }) => {
  return (
    <View style={styles.milestoneContainer}>
      <View style={styles.milestoneRow}>
        <SkeletonBox
          width={40}
          height={40}
          borderRadius={8}
          variant={variant}
        />
        <View style={styles.milestoneInfo}>
          <SkeletonText width="60%" size="lg" variant={variant} />
          <SkeletonText width="80%" size="sm" variant={variant} style={{ marginTop: 4 }} />
        </View>
      </View>
      {/* Progress bar */}
      <SkeletonBox
        width="100%"
        height={8}
        borderRadius={4}
        variant={variant}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // StreakQuickStats skeleton
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
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
  secondaryStat: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  valueMargin: {
    marginTop: 4,
    marginBottom: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // TodayProgressHero skeleton
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  heroLabel: {
    marginTop: 8,
  },

  // NextMilestone skeleton
  milestoneContainer: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneInfo: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    marginTop: 16,
  },
});

export default StreakStatsSkeleton;
