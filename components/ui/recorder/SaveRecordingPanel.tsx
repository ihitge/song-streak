/**
 * SaveRecordingPanel Component
 *
 * Inline save panel shown after recording stops.
 * Allows user to name recording and optionally share to a band.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Save, X, Users, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { BandWithMemberCount } from '@/types/band';

interface SaveRecordingPanelProps {
  /** Whether the panel is visible */
  visible: boolean;
  /** Available bands to share with */
  bands: BandWithMemberCount[];
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Upload progress (0-100) */
  uploadProgress: number;
  /** Called when save is pressed */
  onSave: (title: string, bandId: string | null) => void;
  /** Called when discard is pressed */
  onDiscard: () => void;
}

export const SaveRecordingPanel: React.FC<SaveRecordingPanelProps> = ({
  visible,
  bands,
  isUploading,
  uploadProgress,
  onSave,
  onDiscard,
}) => {
  const [title, setTitle] = useState('');
  const [selectedBandId, setSelectedBandId] = useState<string | null>(null);
  const [showBandPicker, setShowBandPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate panel in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start(() => {
        // Focus input after animation
        setTimeout(() => inputRef.current?.focus(), 100);
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Reset state when hidden
        setTitle('');
        setSelectedBandId(null);
        setShowBandPicker(false);
      });
    }
  }, [visible, slideAnim]);

  const handleSave = async () => {
    if (isUploading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    onSave(title.trim() || 'Untitled', selectedBandId);
  };

  const handleDiscard = async () => {
    if (isUploading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onDiscard();
  };

  const handleBandPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBandPicker(!showBandPicker);
  };

  const handleBandSelect = async (bandId: string | null) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBandId(bandId);
    setShowBandPicker(false);
  };

  const selectedBand = bands.find((b) => b.id === selectedBandId);

  if (!visible) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {/* Title Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>TITLE</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Song Idea..."
          placeholderTextColor={Colors.warmGray}
          maxLength={100}
          editable={!isUploading}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
      </View>

      {/* Band Selector (only show if user has bands) */}
      {bands.length > 0 && (
        <View style={styles.bandSection}>
          <Text style={styles.label}>SHARE WITH</Text>
          <Pressable
            onPress={handleBandPress}
            style={[styles.bandSelector, isUploading && styles.disabled]}
            disabled={isUploading}
          >
            <Users size={16} color={selectedBandId ? Colors.charcoal : Colors.graphite} />
            <Text style={[styles.bandText, selectedBandId && styles.bandTextSelected]}>
              {selectedBand ? selectedBand.name : 'Personal Only'}
            </Text>
            <ChevronDown
              size={16}
              color={Colors.graphite}
              style={{ transform: [{ rotate: showBandPicker ? '180deg' : '0deg' }] }}
            />
          </Pressable>

          {/* Band Picker Dropdown */}
          {showBandPicker && (
            <View style={styles.bandDropdown}>
              {/* Personal option */}
              <Pressable
                onPress={() => handleBandSelect(null)}
                style={[styles.bandOption, !selectedBandId && styles.bandOptionSelected]}
              >
                <Text style={[styles.bandOptionText, !selectedBandId && styles.bandOptionTextSelected]}>
                  Personal Only
                </Text>
              </Pressable>

              {/* Band options */}
              {bands.map((band) => (
                <Pressable
                  key={band.id}
                  onPress={() => handleBandSelect(band.id)}
                  style={[styles.bandOption, selectedBandId === band.id && styles.bandOptionSelected]}
                >
                  <Text
                    style={[
                      styles.bandOptionText,
                      selectedBandId === band.id && styles.bandOptionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {band.name}
                  </Text>
                  <Text style={styles.bandMemberCount}>{band.member_count} members</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.uploadProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>Saving... {uploadProgress}%</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleDiscard}
          style={[styles.button, styles.discardButton, isUploading && styles.disabled]}
          disabled={isUploading}
        >
          <X size={18} color={Colors.graphite} />
          <Text style={styles.discardButtonText}>DISCARD</Text>
        </Pressable>

        <Pressable
          onPress={handleSave}
          style={[styles.button, styles.saveButton, isUploading && styles.disabled]}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={Colors.softWhite} />
          ) : (
            <>
              <Save size={18} color={Colors.softWhite} />
              <Text style={styles.saveButtonText}>SAVE</Text>
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    // Inner glow
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    gap: 6,
  },
  label: {
    ...Typography.label,
    color: Colors.vermilion,
  },
  input: {
    backgroundColor: Colors.ink,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'LexendDecaRegular',
    fontSize: 16,
    color: Colors.softWhite,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bandSection: {
    gap: 6,
  },
  bandSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  bandText: {
    flex: 1,
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.graphite,
  },
  bandTextSelected: {
    color: Colors.charcoal,
    fontFamily: 'LexendDecaBold',
  },
  bandDropdown: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  bandOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  bandOptionSelected: {
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
  },
  bandOptionText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.charcoal,
    flex: 1,
  },
  bandOptionTextSelected: {
    fontFamily: 'LexendDecaBold',
    color: Colors.vermilion,
  },
  bandMemberCount: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
  },
  uploadProgress: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.ink,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.moss,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.warmGray,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    // Bevel
    borderTopWidth: 1,
    borderBottomWidth: 2,
  },
  discardButton: {
    backgroundColor: Colors.alloy,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  discardButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.graphite,
  },
  saveButton: {
    backgroundColor: Colors.vermilion,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  saveButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 1,
    color: Colors.softWhite,
  },
});

export default SaveRecordingPanel;
