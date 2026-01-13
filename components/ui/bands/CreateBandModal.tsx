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

interface CreateBandModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

/**
 * Modal for creating a new band with Industrial Play styling
 */
export const CreateBandModal: React.FC<CreateBandModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [bandName, setBandName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setBandName('');
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

  const handleSubmit = async () => {
    if (!bandName.trim() || isSubmitting) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsSubmitting(true);
    try {
      await onSubmit(bandName.trim());
      onClose();
    } catch (error) {
      console.error('Error creating band:', error);
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
        accessibilityViewIsModal={true}
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
                  <Text style={styles.headerText}>CREATE BAND</Text>
                  <View style={styles.headerSpacer} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                  <Text style={styles.label}>BAND NAME</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={bandName}
                      onChangeText={setBandName}
                      placeholder="Enter band name..."
                      placeholderTextColor={Colors.graphite}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!bandName.trim() || isSubmitting) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={!bandName.trim() || isSubmitting}
                >
                  <LinearGradient
                    colors={
                      bandName.trim() && !isSubmitting
                        ? [Colors.vermilion, '#d04620']
                        : [Colors.graphite, '#666666']
                    }
                    style={styles.submitButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'CREATING...' : 'CREATE BAND'}
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
  input: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 16,
    color: Colors.ink,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
