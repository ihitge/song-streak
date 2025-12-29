import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { LifetimeMilestone, MILESTONE_TIER_COLORS } from '@/types/milestones';
import { Trophy } from './Trophy';
import { useClickSound } from '@/hooks/useClickSound';

interface MilestoneModalProps {
  visible: boolean;
  milestones: LifetimeMilestone[];
  onClose: () => void;
}

/**
 * Celebration modal shown when user unlocks new lifetime milestones (trophies)
 */
export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  visible,
  milestones,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const { playSound } = useClickSound();

  useEffect(() => {
    if (visible && milestones.length > 0) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
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
      ]).start();

      // Shine animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      shineAnim.setValue(0);
    }
  }, [visible, milestones.length, scaleAnim, opacityAnim, shineAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  if (!visible || milestones.length === 0) return null;

  // Get the highest tier for the glow effect
  const tierOrder: Record<string, number> = {
    bronze: 0,
    silver: 1,
    gold: 2,
    platinum: 3,
    diamond: 4,
  };

  const highestTier = milestones.reduce((highest, m) => {
    return tierOrder[m.tier] > tierOrder[highest] ? m.tier : highest;
  }, milestones[0].tier);

  const tierColors = MILESTONE_TIER_COLORS[highestTier];

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
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: tierColors.primary,
                opacity: shineAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.4],
                }),
              },
            ]}
          />

          {/* Content */}
          <LinearGradient
            colors={[Colors.ink, '#1a1a1a']}
            style={styles.content}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Header */}
            <Text style={[styles.headerText, { color: tierColors.primary }]}>
              {milestones.length === 1 ? 'TROPHY UNLOCKED!' : 'TROPHIES UNLOCKED!'}
            </Text>

            {/* Trophies */}
            <View style={styles.trophiesContainer}>
              {milestones.map((milestone) => (
                <View key={milestone.id} style={styles.trophyWrapper}>
                  <Trophy
                    milestone={milestone}
                    unlocked={true}
                    isNew={true}
                  />
                  <Text style={styles.description}>{milestone.description}</Text>
                </View>
              ))}
            </View>

            {/* Motivational message */}
            <Text style={styles.motivationText}>
              {getMotivationalMessage(milestones[0])}
            </Text>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={tierColors.gradient}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    highestTier === 'diamond' && { color: Colors.ink },
                  ]}
                >
                  CONTINUE
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Get a motivational message based on the milestone category
 */
function getMotivationalMessage(milestone: LifetimeMilestone): string {
  switch (milestone.category) {
    case 'time':
      return 'Your dedication is paying off!';
    case 'songs':
      return 'Your repertoire is growing!';
    case 'streak':
      return 'Consistency is the key to mastery!';
    case 'genre':
      return 'Exploring new horizons!';
    default:
      return 'Keep up the great work!';
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderRadius: 40,
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
  headerText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  trophiesContainer: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  trophyWrapper: {
    alignItems: 'center',
    gap: 12,
  },
  description: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 13,
    color: Colors.graphite,
    textAlign: 'center',
    maxWidth: 220,
  },
  motivationText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 14,
    color: Colors.softWhite,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  closeButton: {
    width: '100%',
    shadowColor: '#000',
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
