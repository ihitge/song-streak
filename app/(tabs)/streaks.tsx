import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { Colors } from '@/constants/Colors';
import { useStreakQuery } from '@/hooks/queries/useStreakQuery';
import { useStreakCalendar } from '@/hooks/useStreakCalendar';
import {
  TodayProgressSkeleton,
  StreakStatsSkeleton,
  NextMilestoneSkeleton,
} from '@/components/ui/skeleton';

// New components
import { TodayProgressHero } from '@/components/ui/streaks/TodayProgressHero';
import { StreakQuickStats } from '@/components/ui/streaks/StreakQuickStats';
import { NextMilestoneCard, getNextStreakMilestone } from '@/components/ui/streaks/NextMilestoneCard';

// Existing components (updated with dark variant)
import { StreakCalendar } from '@/components/ui/streaks/StreakCalendar';
import { DailyGoalSelector } from '@/components/ui/streaks/DailyGoalSelector';
import { TrophyCase } from '@/components/ui/milestones/TrophyCase';

import { DailyGoalMinutes } from '@/types/streak';
import { LifetimeMilestone } from '@/types/milestones';

/**
 * Streaks Screen - Redesigned
 *
 * Layout follows the "Industrial Play" aesthetic with:
 * - matteFog header + ink (dark) content area
 * - Today's progress as hero element
 * - Collapsible trophy case
 * - Dark theme calendar and controls
 */
export default function StreaksScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Combined streak data with caching
  const {
    streakData,
    todayProgress,
    flameLevel,
    todayGoalMet,
    isActive,
    stats,
    unlockedIds,
    isLoading,
    updateDailyGoal,
    refresh: refreshStreak,
  } = useStreakQuery();

  // Calendar data (kept separate - doesn't need caching)
  const {
    currentMonth,
    calendarData,
    goToPreviousMonth,
    goToNextMonth,
    refresh: refreshCalendar,
  } = useStreakCalendar();

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshStreak(),
      refreshCalendar(),
    ]);
    setRefreshing(false);
  };

  // Handle daily goal change
  const handleGoalChange = (minutes: DailyGoalMinutes) => {
    updateDailyGoal(minutes);
  };

  // Handle trophy press (could open modal in future)
  const handleTrophyPress = (milestone: LifetimeMilestone) => {
    // TODO: Open trophy detail modal
    console.log('Trophy pressed:', milestone.title);
  };

  // Get next streak milestone
  const { milestone: nextMilestone, progress: milestoneProgress } = getNextStreakMilestone(
    streakData?.current_streak ?? 0,
    unlockedIds
  );

  // Show skeletons only during initial load (no cached data)
  // Once we have data, show it immediately even during background refresh

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Dark device casing */}
      <DeviceCasing title="STREAKS">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.vermilion}
            />
          }
        >
          {/* 1. HERO: Today's Progress */}
          {isLoading && !streakData ? (
            <TodayProgressSkeleton variant="dark" />
          ) : (
            <TodayProgressHero
              currentMinutes={todayProgress?.total_minutes ?? 0}
              goalMinutes={streakData?.daily_goal_minutes ?? 30}
              goalMet={todayGoalMet}
              streakDays={streakData?.current_streak ?? 0}
              isActive={isActive}
            />
          )}

          {/* 2. Quick Stats Row */}
          {isLoading && !streakData ? (
            <StreakStatsSkeleton variant="dark" />
          ) : (
            <StreakQuickStats
              currentStreak={streakData?.current_streak ?? 0}
              longestStreak={streakData?.longest_streak ?? 0}
              freezesAvailable={streakData?.streak_freezes_available ?? 0}
              flameLevel={flameLevel}
              isActive={isActive}
            />
          )}

          {/* 3. Next Milestone Card */}
          {isLoading && !streakData ? (
            <NextMilestoneSkeleton variant="dark" />
          ) : (
            <NextMilestoneCard
              milestone={nextMilestone}
              currentStreak={streakData?.current_streak ?? 0}
              progress={milestoneProgress}
            />
          )}

          {/* 4. Trophy Case (collapsible) */}
          {stats && (
            <TrophyCase
              stats={stats}
              unlockedIds={unlockedIds}
              onTrophyPress={handleTrophyPress}
              variant="dark"
              collapsible
              compact
            />
          )}

          {/* 5. Streak Calendar */}
          <StreakCalendar
            currentMonth={currentMonth}
            calendarData={calendarData}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            dailyGoalMinutes={streakData?.daily_goal_minutes ?? 30}
            variant="dark"
          />

          {/* 6. Daily Goal Selector */}
          <DailyGoalSelector
            selectedMinutes={(streakData?.daily_goal_minutes ?? 30) as DailyGoalMinutes}
            onSelect={handleGoalChange}
            variant="dark"
          />

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </DeviceCasing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
