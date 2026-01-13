import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { DAILY_GOAL_OPTIONS, DailyGoalMinutes } from '@/types/streak';

interface DailyGoalSelectorProps {
  selectedMinutes: DailyGoalMinutes;
  onSelect: (minutes: DailyGoalMinutes) => void;
  disabled?: boolean;
  variant?: 'light' | 'dark';
}

/**
 * GangSwitch-style selector for daily practice goal
 */
export const DailyGoalSelector: React.FC<DailyGoalSelectorProps> = ({
  selectedMinutes,
  onSelect,
  disabled = false,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  const handleSelect = async (minutes: DailyGoalMinutes) => {
    if (disabled || minutes === selectedMinutes) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(minutes);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark && styles.labelDark]}>Daily Goal</Text>
      <View style={[styles.optionsContainer, isDark && styles.optionsContainerDark]}>
        {DAILY_GOAL_OPTIONS.map((option) => {
          const isSelected = option.value === selectedMinutes;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => handleSelect(option.value)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 9,
    color: Colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  labelDark: {
    color: Colors.graphite,
  },
  optionsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.charcoal,
    borderRadius: 8,
    padding: 4,
    // Inset shadow
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionsContainerDark: {
    backgroundColor: Colors.charcoal,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: Colors.vermilion,
    // Raised effect
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 14,
    color: Colors.graphite,
  },
  optionTextSelected: {
    color: Colors.softWhite,
  },
});
