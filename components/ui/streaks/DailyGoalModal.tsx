import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Check, Target, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface DailyGoalModalProps {
  visible: boolean;
  goalMinutes?: number;
  practiceMinutes?: number;
  currentStreak: number;
  onClose: () => void;
}

/**
 * Celebration modal shown when user meets their daily practice goal
 */
export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  visible,
  goalMinutes = 30,
  practiceMinutes = 0,
  currentStreak,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Animate check mark
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 150,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      checkAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim, checkAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  const extraMinutes = practiceMinutes - goalMinutes;
  const showExtra = extraMinutes > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Glow effect */}
          <View style={styles.glow} />

          {/* Content */}
          <LinearGradient
            colors={[Colors.ink, '#1a1a1a']}
            style={styles.content}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Animated check circle */}
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  transform: [{ scale: checkAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[Colors.moss, '#2D5A3F']}
                style={styles.checkCircleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Check size={40} color={Colors.softWhite} strokeWidth={3} />
              </LinearGradient>
            </Animated.View>

            {/* Header */}
            <Text style={styles.headerText}>DAILY GOAL MET!</Text>

            {/* Goal info */}
            <View style={styles.goalInfo}>
              <Target size={16} color={Colors.graphite} />
              <Text style={styles.goalText}>
                {goalMinutes} minute goal achieved
              </Text>
            </View>

            {/* Extra practice badge */}
            {showExtra && (
              <View style={styles.extraBadge}>
                <Zap size={14} color={Colors.vermilion} />
                <Text style={styles.extraText}>
                  +{extraMinutes} extra {extraMinutes === 1 ? 'minute' : 'minutes'}!
                </Text>
              </View>
            )}

            {/* Streak info */}
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>

            {/* Motivational message */}
            <Text style={styles.motivationText}>
              {getMotivationalMessage(currentStreak, showExtra)}
            </Text>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.moss, '#2D5A3F']}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.closeButtonText}>GREAT JOB!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Get motivational message based on context
 */
function getMotivationalMessage(streak: number, hasExtra: boolean): string {
  if (hasExtra) {
    return 'Going above and beyond!';
  }
  if (streak === 1) {
    return "Great start! Come back tomorrow to build your streak.";
  }
  if (streak < 7) {
    return `${7 - streak} more days until your first week!`;
  }
  if (streak === 7) {
    return "One week down! You're building momentum!";
  }
  return 'Consistency is the key to mastery!';
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -25,
    left: -25,
    right: -25,
    bottom: -25,
    borderRadius: 36,
    backgroundColor: Colors.moss,
    opacity: 0.25,
  },
  content: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  checkCircle: {
    marginBottom: 20,
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  checkCircleGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.moss,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  goalText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
  },
  extraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(238, 108, 77, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  extraText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: Colors.vermilion,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 12,
  },
  streakNumber: {
    fontFamily: 'LexendDecaBold',
    fontSize: 32,
    color: Colors.vermilion,
  },
  streakLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
  },
  motivationText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 13,
    color: Colors.softWhite,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
    lineHeight: 20,
  },
  closeButton: {
    width: '100%',
    shadowColor: Colors.moss,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  closeButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
});
