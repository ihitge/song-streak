import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { Colors } from '@/constants/Colors';
import { useStreakData } from '@/hooks/useStreakData';
import { useStreakCalendar } from '@/hooks/useStreakCalendar';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { useMilestones } from '@/hooks/useMilestones';

// New components
import { TodayProgressHero } from '@/components/ui/streaks/TodayProgressHero';
import { StreakQuickStats } from '@/components/ui/streaks/StreakQuickStats';
import { NextMilestoneCard, getNextStreakMilestone } from '@/components/ui/streaks/NextMilestoneCard';

// Existing components (updated with dark variant)
import { StreakCalendar } from '@/components/ui/streaks/StreakCalendar';
import { DailyGoalSelector } from '@/components/ui/streaks/DailyGoalSelector';
import { TrophyCase } from '@/components/ui/milestones/TrophyCase';

import { DailyGoalMinutes } from '@/types/streak';
import { LifetimeMilestone, ALL_MILESTONES } from '@/types/milestones';

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

  // Streak data
  const {
    streakData,
    todayProgress,
    isLoading: streakLoading,
    flameLevel,
    todayGoalMet,
    isActive,
    updateDailyGoal,
    refresh: refreshStreak,
  } = useStreakData();

  // Calendar data
  const {
    currentMonth,
    calendarData,
    goToPreviousMonth,
    goToNextMonth,
    refresh: refreshCalendar,
  } = useStreakCalendar();

  // Global stats
  const {
    stats,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useGlobalStats();

  // Milestones
  const {
    unlockedIds,
    isLoading: milestonesLoading,
    refresh: refreshMilestones,
  } = useMilestones();

  const isLoading = streakLoading || statsLoading || milestonesLoading;

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshStreak(),
      refreshCalendar(),
      refreshStats(),
      refreshMilestones(),
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

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <PageHeader />
        <DeviceCasing title="STREAKS">
          <View style={styles.loadingPlaceholder} />
        </DeviceCasing>
      </View>
    );
  }

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
          <TodayProgressHero
            currentMinutes={todayProgress?.total_minutes ?? 0}
            goalMinutes={streakData?.daily_goal_minutes ?? 30}
            goalMet={todayGoalMet}
            streakDays={streakData?.current_streak ?? 0}
            isActive={isActive}
          />

          {/* 2. Quick Stats Row */}
          <StreakQuickStats
            currentStreak={streakData?.current_streak ?? 0}
            longestStreak={streakData?.longest_streak ?? 0}
            freezesAvailable={streakData?.streak_freezes_available ?? 0}
            flameLevel={flameLevel}
            isActive={isActive}
          />

          {/* 3. Next Milestone Card */}
          <NextMilestoneCard
            milestone={nextMilestone}
            currentStreak={streakData?.current_streak ?? 0}
            progress={milestoneProgress}
          />

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
    backgroundColor: Colors.matteFog,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  loadingPlaceholder: {
    flex: 1,
    backgroundColor: Colors.deepSpaceBlue,
    margin: 16,
    borderRadius: 12,
    opacity: 0.5,
  },
  bottomPadding: {
    height: 40,
  },
});
