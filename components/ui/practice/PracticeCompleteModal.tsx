import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PracticeCompleteModalProps {
  visible: boolean;
  seconds: number;
  onClose: () => void;
}

/**
 * Modal shown when practice session is logged (no new achievements)
 * Styled to match the Industrial Play aesthetic
 */
export const PracticeCompleteModal: React.FC<PracticeCompleteModalProps> = ({
  visible,
  seconds,
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Skip animation if reduced motion preferred (iOS/Android accessibility)
      if (prefersReducedMotion) {
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);
      } else {
        // Animate in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim, prefersReducedMotion]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

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
          {/* Content */}
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Check size={32} color={Colors.moss} strokeWidth={3} />
              </View>
            </View>

            {/* Header */}
            <Text style={styles.headerText}>PRACTICE LOGGED</Text>

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Clock size={20} color={Colors.graphite} />
              <Text style={styles.timeText}>
                {minutes > 0 ? `${minutes}m ` : ''}{remainingSeconds}s
              </Text>
            </View>

            <Text style={styles.messageText}>
              Great work! Keep practicing to earn achievements.
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.vermilion, Colors.vermilionDark]}
                style={styles.closeButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.closeButtonText}>AWESOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    maxWidth: 320,
  },
  content: {
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    // Bevel effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(65, 123, 90, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    // Recessed effect
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  headerText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.moss,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.alloy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    // Recessed effect
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  timeText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 24,
    color: Colors.ink,
  },
  messageText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 13,
    color: Colors.graphite,
    textAlign: 'center',
    marginBottom: 24,
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
    paddingVertical: 16,
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
