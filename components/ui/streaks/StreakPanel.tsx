import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useStreakData } from '@/hooks/useStreakData';
import { useStreakCalendar } from '@/hooks/useStreakCalendar';
import { DailyGoalMinutes } from '@/types/streak';

import { StreakFlame } from './StreakFlame';
import { StreakStats } from './StreakStats';
import { StreakFreezeIndicator } from './StreakFreezeIndicator';
import { DailyGoalProgress } from './DailyGoalProgress';
import { DailyGoalSelector } from './DailyGoalSelector';
import { StreakCalendar } from './StreakCalendar';

interface StreakPanelProps {
  showCalendar?: boolean;
  compact?: boolean;
}

/**
 * Main composite component for streak display
 * Combines flame, stats, progress, and calendar
 */
export const StreakPanel: React.FC<StreakPanelProps> = ({
  showCalendar = true,
  compact = false,
}) => {
  const {
    streakData,
    todayProgress,
    isLoading,
    flameLevel,
    dailyGoalProgress,
    todayGoalMet,
    isActive,
    updateDailyGoal,
  } = useStreakData();

  const {
    currentMonth,
    calendarData,
    goToPreviousMonth,
    goToNextMonth,
  } = useStreakCalendar();

  if (isLoading || !streakData) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  const handleGoalChange = (minutes: DailyGoalMinutes) => {
    updateDailyGoal(minutes);
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Flame & Stats Section */}
      <View style={styles.flameSection}>
        <StreakFlame
          streakDays={streakData.current_streak}
          size={compact ? 60 : 100}
          animated={isActive}
        />

        <StreakStats
          currentStreak={streakData.current_streak}
          longestStreak={streakData.longest_streak}
          flameLevel={flameLevel}
          isActive={isActive}
        />

        {/* Streak Freezes */}
        <View style={styles.freezeSection}>
          <StreakFreezeIndicator
            available={streakData.streak_freezes_available}
            size={compact ? 16 : 20}
          />
        </View>
      </View>

      {!compact && (
        <>
          {/* Daily Goal Progress */}
          <View style={styles.progressSection}>
            <DailyGoalProgress
              currentMinutes={todayProgress?.total_minutes ?? 0}
              goalMinutes={streakData.daily_goal_minutes}
              goalMet={todayGoalMet}
            />
          </View>

          {/* Daily Goal Selector */}
          <View style={styles.selectorSection}>
            <DailyGoalSelector
              selectedMinutes={streakData.daily_goal_minutes as DailyGoalMinutes}
              onSelect={handleGoalChange}
            />
          </View>

          {/* Calendar */}
          {showCalendar && (
            <View style={styles.calendarSection}>
              <StreakCalendar
                currentMonth={currentMonth}
                calendarData={calendarData}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                dailyGoalMinutes={streakData.daily_goal_minutes}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  containerCompact: {
    gap: 12,
  },
  loadingPlaceholder: {
    height: 200,
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    opacity: 0.5,
  },
  flameSection: {
    alignItems: 'center',
    gap: 8,
  },
  freezeSection: {
    marginTop: 4,
  },
  progressSection: {
    paddingHorizontal: 4,
  },
  selectorSection: {
    paddingHorizontal: 4,
  },
  calendarSection: {
    marginTop: 8,
  },
});
