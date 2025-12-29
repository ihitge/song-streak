import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { Colors } from '@/constants/Colors';
import { useStreakData } from '@/hooks/useStreakData';
import { useStreakCalendar } from '@/hooks/useStreakCalendar';
import { useGlobalStats } from '@/hooks/useGlobalStats';
import { useMilestones } from '@/hooks/useMilestones';

import { StreakFlame } from '@/components/ui/streaks/StreakFlame';
import { StreakStats } from '@/components/ui/streaks/StreakStats';
import { StreakFreezeIndicator } from '@/components/ui/streaks/StreakFreezeIndicator';
import { DailyGoalProgress } from '@/components/ui/streaks/DailyGoalProgress';
import { DailyGoalSelector } from '@/components/ui/streaks/DailyGoalSelector';
import { StreakCalendar } from '@/components/ui/streaks/StreakCalendar';

import { StatsDashboard } from '@/components/ui/milestones/StatsDashboard';
import { TrophyCase } from '@/components/ui/milestones/TrophyCase';

import { DailyGoalMinutes } from '@/types/streak';
import { LifetimeMilestone, ALL_MILESTONES } from '@/types/milestones';

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

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <PageHeader />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingPlaceholder} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader />

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
        {/* Streak Flame Section */}
        <View style={styles.flameSection}>
          <StreakFlame
            streakDays={streakData?.current_streak ?? 0}
            size={100}
            animated={isActive}
          />

          <StreakStats
            currentStreak={streakData?.current_streak ?? 0}
            longestStreak={streakData?.longest_streak ?? 0}
            flameLevel={flameLevel}
            isActive={isActive}
          />

          <StreakFreezeIndicator
            available={streakData?.streak_freezes_available ?? 0}
            size={20}
          />
        </View>

        {/* Daily Goal Progress */}
        <View style={styles.section}>
          <DailyGoalProgress
            currentMinutes={todayProgress?.total_minutes ?? 0}
            goalMinutes={streakData?.daily_goal_minutes ?? 30}
            goalMet={todayGoalMet}
          />
        </View>

        {/* Daily Goal Selector */}
        <View style={styles.section}>
          <DailyGoalSelector
            selectedMinutes={(streakData?.daily_goal_minutes ?? 30) as DailyGoalMinutes}
            onSelect={handleGoalChange}
          />
        </View>

        {/* Stats Dashboard */}
        {stats && (
          <View style={styles.section}>
            <StatsDashboard
              stats={stats}
              totalMilestones={ALL_MILESTONES.length}
              unlockedMilestones={unlockedIds.length}
            />
          </View>
        )}

        {/* Trophy Case */}
        {stats && (
          <View style={styles.section}>
            <TrophyCase
              stats={stats}
              unlockedIds={unlockedIds}
              onTrophyPress={handleTrophyPress}
            />
          </View>
        )}

        {/* Streak Calendar */}
        <View style={styles.section}>
          <StreakCalendar
            currentMonth={currentMonth}
            calendarData={calendarData}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            dailyGoalMinutes={streakData?.daily_goal_minutes ?? 30}
          />
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  loadingPlaceholder: {
    height: 300,
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    opacity: 0.3,
  },
  flameSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  section: {
    // Each section gets automatic gap from content container
  },
  bottomPadding: {
    height: 40,
  },
});
