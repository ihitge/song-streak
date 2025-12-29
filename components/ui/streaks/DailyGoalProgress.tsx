import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface DailyGoalProgressProps {
  currentMinutes: number;
  goalMinutes: number;
  goalMet: boolean;
}

/**
 * Progress bar showing today's practice toward daily goal
 */
export const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
  currentMinutes,
  goalMinutes,
  goalMet,
}) => {
  const progress = Math.min(100, Math.round((currentMinutes / goalMinutes) * 100));

  // Color based on progress
  const getProgressColor = () => {
    if (goalMet) return Colors.moss; // Green when goal met
    if (progress > 0) return Colors.vermilion; // Orange while progressing
    return Colors.graphite; // Gray when empty
  };

  return (
    <View style={styles.container}>
      {/* Progress bar track */}
      <View style={styles.track}>
        {/* Progress fill */}
        <View
          style={[
            styles.fill,
            {
              width: `${progress}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
        {/* Inner bevel effect */}
        <View style={styles.innerBevel} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.progressText}>
          {currentMinutes} / {goalMinutes} min
        </Text>
        <Text
          style={[
            styles.percentText,
            goalMet && styles.goalMetText,
          ]}
        >
          {goalMet ? 'Goal Met!' : `${progress}%`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  track: {
    height: 12,
    backgroundColor: Colors.charcoal,
    borderRadius: 6,
    overflow: 'hidden',
    // Inset shadow for recessed look
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    borderTopColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  innerBevel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 13,
    color: Colors.graphite,
  },
  percentText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 13,
    color: Colors.warmGray,
  },
  goalMetText: {
    color: Colors.moss,
  },
});
