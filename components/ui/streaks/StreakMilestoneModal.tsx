import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Flame, Snowflake } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { StreakFlame } from './StreakFlame';

interface StreakMilestoneModalProps {
  visible: boolean;
  streakDays: number;
  freezeEarned?: boolean;
  onClose: () => void;
}

// Streak milestone thresholds
const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365];

/**
 * Celebration modal for reaching streak milestones
 */
export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  visible,
  streakDays,
  freezeEarned = false,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Determine the milestone reached
  const milestoneReached = STREAK_MILESTONES.find(m => streakDays === m);
  const isMilestone = !!milestoneReached;

  useEffect(() => {
    if (visible) {
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

      // Pulse animation for flame
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, scaleAnim, opacityAnim, pulseAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  // Get streak level colors
  const getStreakColor = () => {
    if (streakDays >= 100) return '#9B59B6'; // Purple - Inferno
    if (streakDays >= 31) return '#3498DB'; // Blue - Blaze
    if (streakDays >= 8) return '#E74C3C'; // Red - Flame
    return Colors.vermilion; // Orange - Ember
  };

  const streakColor = getStreakColor();
  const headerText = isMilestone
    ? `${streakDays} DAY STREAK!`
    : `${streakDays} DAYS AND COUNTING!`;

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
          <View style={[styles.glow, { backgroundColor: streakColor }]} />

          {/* Content */}
          <LinearGradient
            colors={[Colors.ink, '#1a1a1a']}
            style={styles.content}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Header */}
            <Text style={[styles.headerText, { color: streakColor }]}>
              {headerText}
            </Text>

            {/* Animated Flame */}
            <Animated.View
              style={[
                styles.flameContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <StreakFlame streakDays={streakDays} size={120} animated />
            </Animated.View>

            {/* Streak info */}
            <View style={styles.infoContainer}>
              <Text style={styles.streakNumber}>{streakDays}</Text>
              <Text style={styles.streakLabel}>consecutive days</Text>
            </View>

            {/* Freeze earned badge */}
            {freezeEarned && (
              <View style={styles.freezeBadge}>
                <Snowflake size={16} color="#00D4FF" />
                <Text style={styles.freezeText}>Streak Freeze Earned!</Text>
              </View>
            )}

            {/* Motivational message */}
            <Text style={styles.motivationText}>
              {getStreakMessage(streakDays)}
            </Text>

            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[streakColor, darkenColor(streakColor, 0.2)]}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Flame size={16} color={Colors.softWhite} />
                <Text style={styles.closeButtonText}>KEEP IT BURNING!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Get motivational message based on streak length
 */
function getStreakMessage(days: number): string {
  if (days >= 365) return "A full year! You're a legend!";
  if (days >= 180) return 'Half a year of dedication!';
  if (days >= 90) return "Three months strong! You're unstoppable!";
  if (days >= 60) return 'Two months of consistent practice!';
  if (days >= 30) return "A whole month! You're building great habits!";
  if (days >= 14) return 'Two weeks in! Keep the momentum going!';
  if (days >= 7) return "First week complete! You're on fire!";
  return 'Every day counts. Keep practicing!';
}

/**
 * Helper to darken a hex color
 */
function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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
    maxWidth: 340,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    bottom: -30,
    borderRadius: 40,
    opacity: 0.3,
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
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  flameContainer: {
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakNumber: {
    fontFamily: 'LexendDecaBold',
    fontSize: 48,
    color: Colors.softWhite,
  },
  streakLabel: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    marginTop: -4,
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  freezeText: {
    fontFamily: 'LexendDecaMedium',
    fontSize: 12,
    color: '#00D4FF',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
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
