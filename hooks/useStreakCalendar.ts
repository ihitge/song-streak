import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import { DailyPracticeLog } from '@/types/streak';

interface MonthSummary {
  daysGoalMet: number;
  totalMinutes: number;
  totalDaysPracticed: number;
}

interface UseStreakCalendarReturn {
  // State
  currentMonth: Date;
  calendarData: Map<string, DailyPracticeLog>;
  isLoading: boolean;
  error: string | null;

  // Navigation
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;

  // Helpers
  getDayData: (date: Date) => DailyPracticeLog | null;
  getMonthSummary: () => MonthSummary;

  // Refresh
  refresh: () => Promise<void>;
}

/**
 * Hook to manage calendar data for streak visualization
 * Fetches and caches daily practice logs for the visible month
 */
export function useStreakCalendar(): UseStreakCalendarReturn {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [calendarData, setCalendarData] = useState<Map<string, DailyPracticeLog>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get date range for current month (with buffer for display)
  const getMonthRange = useCallback((month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // Start from first day of month (or earlier for calendar display)
    const startDate = new Date(year, monthIndex, 1);
    // Adjust to start of week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // End at last day of month (or later for calendar display)
    const endDate = new Date(year, monthIndex + 1, 0);
    // Adjust to end of week (Saturday)
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  }, []);

  // Load calendar data for current month
  const loadCalendarData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { start, end } = getMonthRange(currentMonth);

      const { data, error: queryError } = await supabase
        .from('daily_practice_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('practice_date', start)
        .lte('practice_date', end)
        .order('practice_date', { ascending: true });

      if (queryError) throw queryError;

      // Build map from date string to log
      const dataMap = new Map<string, DailyPracticeLog>();
      data?.forEach((log) => {
        dataMap.set(log.practice_date, log);
      });

      setCalendarData(dataMap);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, getMonthRange]);

  // Load data when month changes
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  // Get data for a specific date
  const getDayData = useCallback((date: Date): DailyPracticeLog | null => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarData.get(dateStr) || null;
  }, [calendarData]);

  // Calculate month summary
  const getMonthSummary = useCallback((): MonthSummary => {
    const year = currentMonth.getFullYear();
    const monthIndex = currentMonth.getMonth();

    let daysGoalMet = 0;
    let totalMinutes = 0;
    let totalDaysPracticed = 0;

    calendarData.forEach((log, dateStr) => {
      const logDate = new Date(dateStr);
      // Only count logs from the current month
      if (logDate.getFullYear() === year && logDate.getMonth() === monthIndex) {
        if (log.total_minutes > 0) {
          totalDaysPracticed++;
          totalMinutes += log.total_minutes;
        }
        if (log.goal_met) {
          daysGoalMet++;
        }
      }
    });

    return { daysGoalMet, totalMinutes, totalDaysPracticed };
  }, [calendarData, currentMonth]);

  return {
    currentMonth,
    calendarData,
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getDayData,
    getMonthSummary,
    refresh: loadCalendarData,
  };
}

/**
 * Generate calendar grid for a month
 * Returns array of weeks, each containing 7 days
 */
export function generateCalendarGrid(month: Date): Date[][] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // First day of month
  const firstDay = new Date(year, monthIndex, 1);
  // Last day of month
  const lastDay = new Date(year, monthIndex + 1, 0);

  // Start from Sunday of the first week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // End at Saturday of the last week
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const weeks: Date[][] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/**
 * Check if a date is in the given month
 */
export function isInMonth(date: Date, month: Date): boolean {
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Format month for display
 */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
