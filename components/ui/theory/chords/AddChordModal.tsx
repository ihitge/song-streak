/**
 * AddChordModal - Modal for manually adding a chord
 * Follows CreateBandModal pattern with Industrial Play styling
 */

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
import { X, Music } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';

interface AddChordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (chordName: string) => Promise<void>;
  existingChords?: string[];
}

/**
 * Modal for adding a chord manually
 */
export const AddChordModal: React.FC<AddChordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  existingChords = [],
}) => {
  const [chordName, setChordName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setChordName('');
      setIsSubmitting(false);
      setError(null);

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

  const handleChordChange = (text: string) => {
    setChordName(text);
    setError(null);
  };

  const validateChord = (): boolean => {
    const trimmed = chordName.trim();

    if (!trimmed) {
      setError('Please enter a chord name');
      return false;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = existingChords.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError('This chord already exists');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!validateChord()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsSubmitting(true);
    try {
      await onSubmit(chordName.trim());
      onClose();
    } catch (error) {
      console.error('Error adding chord:', error);
      setError('Failed to add chord');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  <View style={styles.headerTitleContainer}>
                    <Music size={16} color={Colors.vermilion} strokeWidth={2.5} />
                    <Text style={styles.headerText}>ADD CHORD</Text>
                  </View>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <Text style={styles.label}>CHORD NAME</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      error && styles.inputContainerError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={chordName}
                      onChangeText={handleChordChange}
                      placeholder="e.g., Am, C#m7, Fsus4..."
                      placeholderTextColor={Colors.graphite}
                      autoFocus
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                  {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!chordName.trim() || isSubmitting) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={!chordName.trim() || isSubmitting}
                >
                  <LinearGradient
                    colors={
                      chordName.trim() && !isSubmitting
                        ? [Colors.vermilion, '#d04620']
                        : [Colors.graphite, '#666666']
                    }
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'ADDING...' : 'ADD CHORD'}
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderTopColor: Colors.vermilion,
    borderLeftColor: Colors.vermilion,
    borderBottomColor: Colors.vermilion,
    borderRightColor: Colors.vermilion,
  },
  input: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 16,
    color: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.vermilion,
    marginTop: 8,
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

export default AddChordModal;
