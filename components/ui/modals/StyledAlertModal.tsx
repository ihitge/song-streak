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
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';

export type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface StyledAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  buttons?: AlertButton[];
  onClose: () => void;
}

const getIconForType = (type: AlertType) => {
  switch (type) {
    case 'error':
      return <AlertCircle size={32} color={Colors.vermilion} strokeWidth={2.5} />;
    case 'success':
      return <CheckCircle size={32} color={Colors.moss} strokeWidth={2.5} />;
    case 'warning':
      return <AlertTriangle size={32} color="#D4A017" strokeWidth={2.5} />;
    case 'info':
    default:
      return <Info size={32} color={Colors.deepSpaceBlue} strokeWidth={2.5} />;
  }
};

const getHeaderColorForType = (type: AlertType) => {
  switch (type) {
    case 'error':
      return Colors.vermilion;
    case 'success':
      return Colors.moss;
    case 'warning':
      return '#D4A017';
    case 'info':
    default:
      return Colors.deepSpaceBlue;
  }
};

const getButtonColorsForStyle = (style?: 'default' | 'cancel' | 'destructive'): [string, string] => {
  switch (style) {
    case 'destructive':
      return [Colors.vermilion, '#d04620'];
    case 'cancel':
      return [Colors.graphite, '#666666'];
    default:
      return [Colors.vermilion, '#d04620'];
  }
};

/**
 * Styled alert modal matching the Industrial Play aesthetic
 * Replaces native Alert.alert with consistent app styling
 */
export const StyledAlertModal: React.FC<StyledAlertModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK' }],
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { playSound } = useClickSound();

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback based on type
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'warning') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

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
    } else {
      // Reset animations
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible, type, scaleAnim, opacityAnim]);

  const handleButtonPress = async (button: AlertButton) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    button.onPress?.();
    onClose();
  };

  if (!visible) return null;

  const headerColor = getHeaderColorForType(type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${headerColor}15` }]}>
                {getIconForType(type)}
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.titleText, { color: headerColor }]}>
              {title.toUpperCase()}
            </Text>

            {/* Message */}
            <Text style={styles.messageText}>{message}</Text>

            {/* Buttons */}
            <View style={[
              styles.buttonContainer,
              buttons.length > 1 && styles.buttonContainerMultiple,
            ]}>
              {buttons.map((button, index) => {
                const buttonColors = getButtonColorsForStyle(button.style);
                const isCancel = button.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      buttons.length > 1 && styles.buttonMultiple,
                      isCancel && styles.buttonCancel,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                    accessibilityLabel={button.text}
                    accessibilityRole="button"
                    accessibilityHint={isCancel ? 'Dismiss this alert' : `Confirm: ${button.text}`}
                  >
                    {isCancel ? (
                      <View style={styles.cancelButtonInner}>
                        <Text style={styles.cancelButtonText}>{button.text.toUpperCase()}</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={buttonColors}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        <Text style={styles.buttonText}>{button.text.toUpperCase()}</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
  titleText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 12,
  },
  messageText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonContainerMultiple: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonMultiple: {
    flex: 1,
  },
  buttonCancel: {
    shadowColor: Colors.graphite,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    // Bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  buttonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
  cancelButtonInner: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.alloy,
    // Recessed bevel
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  cancelButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.graphite,
    letterSpacing: 2,
  },
});
