import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface JoinBandModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (joinCode: string) => Promise<boolean>;
}

/**
 * Modal for joining a band via join code with Industrial Play styling
 */
export const JoinBandModal: React.FC<JoinBandModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setJoinCode('');
      setError(null);
      setIsSubmitting(false);

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
  }, [visible, scaleAnim, opacityAnim]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleCodeChange = (text: string) => {
    // Auto-uppercase, strip non-alphanumeric, max 6 chars
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    setJoinCode(cleaned);
    setError(null);
  };

  const handleSubmit = async () => {
    if (joinCode.length !== 6 || isSubmitting) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit(joinCode);
      if (success) {
        onClose();
      } else {
        setError('Invalid code or already a member');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError('Failed to join band');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format code for display (ABC-123)
  const displayCode = joinCode.length > 3
    ? `${joinCode.slice(0, 3)}-${joinCode.slice(3)}`
    : joinCode;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Content */}
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <X size={24} color={Colors.graphite} />
                  </TouchableOpacity>
                  <Text style={styles.headerText}>JOIN BAND</Text>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <Text style={styles.label}>JOIN CODE</Text>
                  <View style={[
                    styles.inputContainer,
                    error && styles.inputContainerError,
                  ]}>
                    <TextInput
                      style={styles.input}
                      value={displayCode}
                      onChangeText={handleCodeChange}
                      placeholder="ABC-123"
                      placeholderTextColor={Colors.graphite}
                      autoFocus
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={7} // Account for dash
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                  <Text style={styles.hint}>
                    Enter the 6-character code shared by a band member
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (joinCode.length !== 6 || isSubmitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={joinCode.length !== 6 || isSubmitting}
                >
                  <LinearGradient
                    colors={
                      joinCode.length === 6 && !isSubmitting
                        ? [Colors.vermilion, '#d04620']
                        : [Colors.graphite, '#666666']
                    }
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'JOINING...' : 'JOIN BAND'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    padding: 20,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  headerText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 32,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'LexendDecaBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    // Recessed bevel (light top-left, dark bottom-right)
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  inputContainerError: {
    borderColor: Colors.vermilion,
    borderWidth: 1,
  },
  input: {
    fontFamily: 'LexendDecaBold',
    fontSize: 24,
    color: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
    textAlign: 'center',
    letterSpacing: 4,
  },
  errorText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.vermilion,
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
    marginTop: 12,
    textAlign: 'center',
  },
  submitButton: {
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowColor: Colors.graphite,
    shadowOpacity: 0.1,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    // Bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  submitButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    letterSpacing: 2,
  },
});
