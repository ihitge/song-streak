/**
 * PracticePlayerModal Component
 *
 * Full-screen modal for audio practice with:
 * - File picker for MP3/WAV files
 * - Pitch-preserved speed control
 * - A-B loop repeat
 * - Practice notes
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Upload,
  Music,
  FileAudio,
  StickyNote,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
import { usePracticePlayer } from '@/hooks/usePracticePlayer';
import { PlaybackControls } from './PlaybackControls';

interface PracticePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  /** Optional initial notes text */
  initialNotes?: string;
  /** Callback when notes change */
  onNotesChange?: (notes: string) => void;
  /** Song title for display */
  songTitle?: string;
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PracticePlayerModal: React.FC<PracticePlayerModalProps> = ({
  visible,
  onClose,
  initialNotes = '',
  onNotesChange,
  songTitle,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { playSound } = useClickSound();
  const player = usePracticePlayer();

  const [notes, setNotes] = useState(initialNotes);
  const [showNotes, setShowNotes] = useState(false);

  // Sync notes with prop
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Animation on visibility change
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  // Cleanup on close
  useEffect(() => {
    if (!visible) {
      player.unload();
    }
  }, [visible]);

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    // Save notes before closing
    if (onNotesChange && notes !== initialNotes) {
      onNotesChange(notes);
    }
    onClose();
  };

  const handlePickFile = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();

    const file = await player.pickFile();
    if (file) {
      await player.loadFile(file);
    }
  };

  const handlePlayPause = useCallback(() => {
    player.togglePlayPause();
  }, [player]);

  const handleSeek = useCallback(
    (positionMs: number) => {
      player.seekTo(positionMs);
    },
    [player]
  );

  const handleRateChange = useCallback(
    (rate: number) => {
      player.setRate(rate);
    },
    [player]
  );

  const handleSetLoopStart = useCallback(() => {
    if (player.status) {
      player.setLoopRegion({ startMs: player.status.positionMs });
    }
  }, [player]);

  const handleSetLoopEnd = useCallback(() => {
    if (player.status) {
      player.setLoopRegion({ endMs: player.status.positionMs });
    }
  }, [player]);

  const handleClearLoop = useCallback(() => {
    player.clearLoopRegion();
  }, [player]);

  const handleToggleLoop = useCallback(() => {
    player.setLoopRegion({ enabled: !player.loopRegion.enabled });
  }, [player]);

  const handleToggleNotes = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setShowNotes(!showNotes);
  };

  const handleNotesBlur = () => {
    if (onNotesChange && notes !== initialNotes) {
      onNotesChange(notes);
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
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Music size={20} color={Colors.vermilion} />
              <Text style={styles.headerTitle}>
                {songTitle || 'PRACTICE PLAYER'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={Colors.graphite} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* File Picker / Audio Info */}
            <View style={styles.fileSection}>
              {!player.audioFile ? (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickFile}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[Colors.charcoal, '#1a1a1a']}
                    style={styles.uploadButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Upload size={32} color={Colors.vermilion} />
                    <Text style={styles.uploadText}>TAP TO SELECT AUDIO</Text>
                    <Text style={styles.uploadSubtext}>MP3, WAV, M4A, AIFF</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.fileInfo}>
                  <View style={styles.fileIconContainer}>
                    <FileAudio size={24} color={Colors.vermilion} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {player.audioFile.name}
                    </Text>
                    <Text style={styles.fileSize}>
                      {formatFileSize(player.audioFile.size)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeFileButton}
                    onPress={handlePickFile}
                  >
                    <Text style={styles.changeFileText}>CHANGE</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Playback Controls */}
            {player.audioFile && (
              <View style={styles.controlsSection}>
                <PlaybackControls
                  status={player.status}
                  loopRegion={player.loopRegion}
                  isLoading={player.state === 'loading'}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onRateChange={handleRateChange}
                  onSetLoopStart={handleSetLoopStart}
                  onSetLoopEnd={handleSetLoopEnd}
                  onClearLoop={handleClearLoop}
                  onToggleLoop={handleToggleLoop}
                />
              </View>
            )}

            {/* Error Display */}
            {player.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{player.error}</Text>
              </View>
            )}

            {/* Notes Section */}
            <View style={styles.notesSection}>
              <TouchableOpacity
                style={styles.notesHeader}
                onPress={handleToggleNotes}
                activeOpacity={0.7}
              >
                <StickyNote size={16} color={Colors.warmGray} />
                <Text style={styles.notesLabel}>PRACTICE NOTES</Text>
                <Text style={styles.notesToggle}>
                  {showNotes ? 'HIDE' : 'SHOW'}
                </Text>
              </TouchableOpacity>

              {showNotes && (
                <View style={styles.notesInputContainer}>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    onBlur={handleNotesBlur}
                    placeholder="Add practice notes, reminders, or tips..."
                    placeholderTextColor={Colors.graphite}
                    multiline
                    textAlignVertical="top"
                    scrollEnabled
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.alloy,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  fileSection: {},
  uploadButton: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonGradient: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 14,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  uploadSubtext: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.alloy,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 13,
    color: Colors.ink,
  },
  fileSize: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.graphite,
  },
  changeFileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.charcoal,
    borderRadius: 6,
  },
  changeFileText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  controlsSection: {
    backgroundColor: Colors.softWhite,
    borderRadius: 12,
    padding: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    borderLeftColor: 'rgba(0,0,0,0.05)',
    borderBottomColor: 'rgba(255,255,255,0.8)',
    borderRightColor: 'rgba(255,255,255,0.8)',
  },
  errorContainer: {
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.vermilion,
  },
  errorText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 12,
    color: Colors.vermilion,
  },
  notesSection: {
    gap: 8,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesLabel: {
    flex: 1,
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 1.5,
  },
  notesToggle: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.vermilion,
    letterSpacing: 1,
  },
  notesInputContainer: {
    backgroundColor: Colors.alloy,
    borderRadius: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftColor: 'rgba(0,0,0,0.1)',
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderRightColor: 'rgba(255,255,255,0.5)',
  },
  notesInput: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 14,
    color: Colors.ink,
    padding: 12,
    minHeight: 100,
    maxHeight: 200,
  },
});
