import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { DailyPracticeLog } from '@/types/streak';
import {
  generateCalendarGrid,
  isInMonth,
  isToday,
  formatMonth,
} from '@/hooks/useStreakCalendar';

interface StreakCalendarProps {
  currentMonth: Date;
  calendarData: Map<string, DailyPracticeLog>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  dailyGoalMinutes: number;
  variant?: 'light' | 'dark';
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * GitHub-style contribution calendar for streak visualization
 */
export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentMonth,
  calendarData,
  onPreviousMonth,
  onNextMonth,
  dailyGoalMinutes,
  variant = 'dark',
}) => {
  const weeks = generateCalendarGrid(currentMonth);
  const isDark = variant === 'dark';

  const handleNavigation = useCallback(async (direction: 'prev' | 'next') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    direction === 'prev' ? onPreviousMonth() : onNextMonth();
  }, [onPreviousMonth, onNextMonth]);

  // Get intensity level for a day (0-4)
  const getDayIntensity = useCallback((log: DailyPracticeLog | undefined): number => {
    if (!log || log.total_minutes === 0) return 0;
    if (log.goal_met) return 4; // Full intensity when goal met
    const ratio = log.total_minutes / dailyGoalMinutes;
    if (ratio >= 0.75) return 3;
    if (ratio >= 0.5) return 2;
    if (ratio >= 0.25) return 1;
    return 1;
  }, [dailyGoalMinutes]);

  // Get color based on intensity
  const getIntensityColor = useCallback((intensity: number, isFreezeDay: boolean): string => {
    if (isFreezeDay) return '#00D4FF40'; // Light cyan for freeze days
    switch (intensity) {
      case 0: return 'transparent';
      case 1: return `${Colors.vermilion}40`;
      case 2: return `${Colors.vermilion}70`;
      case 3: return `${Colors.vermilion}A0`;
      case 4: return Colors.moss; // Green for goal met
      default: return 'transparent';
    }
  }, []);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Month navigation header */}
      <View style={styles.header}>
        <Pressable
          style={styles.navButton}
          onPress={() => handleNavigation('prev')}
        >
          <ChevronLeft size={20} color={Colors.graphite} />
        </Pressable>

        <Text style={styles.monthLabel}>{formatMonth(currentMonth)}</Text>

        <Pressable
          style={styles.navButton}
          onPress={() => handleNavigation('next')}
        >
          <ChevronRight size={20} color={Colors.graphite} />
        </Pressable>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              const dateStr = date.toISOString().split('T')[0];
              const log = calendarData.get(dateStr);
              const inMonth = isInMonth(date, currentMonth);
              const today = isToday(date);
              const intensity = getDayIntensity(log);
              const isFreezeDay = log?.streak_freeze_used ?? false;

              return (
                <View
                  key={dayIndex}
                  style={[
                    styles.dayCell,
                    isDark && styles.dayCellDark,
                    !inMonth && styles.dayCellOutsideMonth,
                    today && styles.dayCellToday,
                  ]}
                >
                  {/* Practice intensity fill */}
                  <View
                    style={[
                      styles.dayFill,
                      {
                        backgroundColor: getIntensityColor(intensity, isFreezeDay),
                      },
                    ]}
                  />

                  {/* Day number */}
                  <Text
                    style={[
                      styles.dayNumber,
                      !inMonth && styles.dayNumberOutside,
                      today && styles.dayNumberToday,
                      intensity === 4 && styles.dayNumberGoalMet,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={styles.legendSquares}>
          {[0, 1, 2, 3, 4].map((level) => (
            <View
              key={level}
              style={[
                styles.legendSquare,
                { backgroundColor: getIntensityColor(level, false) || '#333' },
              ]}
            />
          ))}
        </View>
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};

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
  containerDark: {
    backgroundColor: Colors.charcoal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  monthLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 16,
    color: Colors.softWhite,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dayCellDark: {
    backgroundColor: '#0a1520',
  },
  dayCellOutsideMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: Colors.vermilion,
  },
  dayFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  dayNumber: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    zIndex: 1,
  },
  dayNumberOutside: {
    color: Colors.warmGray,
  },
  dayNumberToday: {
    color: Colors.softWhite,
    fontFamily: 'LexendDecaBold',
  },
  dayNumberGoalMet: {
    color: Colors.softWhite,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  legendLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 10,
    color: Colors.warmGray,
  },
  legendSquares: {
    flexDirection: 'row',
    gap: 3,
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
