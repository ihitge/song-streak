import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Achievement, TIER_COLORS } from '@/types/practice';
import { AchievementBadge } from './AchievementBadge';
import { useClickSound } from '@/hooks/useClickSound';

interface AchievementModalProps {
  visible: boolean;
  achievements: Achievement[];
  onClose: () => void;
}

/**
 * Celebration modal shown when user unlocks new achievements
 */
export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  achievements,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { playSound } = useClickSound();

  useEffect(() => {
    if (visible && achievements.length > 0) {
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
    } else {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible, achievements.length, scaleAnim, opacityAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onClose();
  };

  if (!visible || achievements.length === 0) return null;

  // Get the highest tier color for the glow
  const highestTier = achievements.reduce((highest, a) => {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    return tierOrder.indexOf(a.tier) > tierOrder.indexOf(highest)
      ? a.tier
      : highest;
  }, achievements[0].tier);
  const glowColor = TIER_COLORS[highestTier];

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
          <View style={[styles.glow, { backgroundColor: glowColor }]} />

          {/* Content */}
          <LinearGradient
            colors={[Colors.ink, '#1a1a1a']}
            style={styles.content}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Header */}
            <Text style={styles.headerText}>
              {achievements.length === 1 ? 'ACHIEVEMENT UNLOCKED!' : 'ACHIEVEMENTS UNLOCKED!'}
            </Text>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={styles.badgeWrapper}>
                  <AchievementBadge
                    achievement={achievement}
                    unlocked={true}
                  />
                  <Text style={styles.description}>{achievement.description}</Text>
                </View>
              ))}
            </View>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.vermilion, '#d04620']}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.closeButtonText}>AWESOME!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
    maxWidth: 340,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 32,
    opacity: 0.3,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    // Bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  headerText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.vermilion,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  badgesContainer: {
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  badgeWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  description: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.graphite,
    textAlign: 'center',
    maxWidth: 200,
  },
  closeButton: {
    width: '100%',
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    // Bevel
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
