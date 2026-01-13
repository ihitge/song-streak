/**
 * VoiceMemoModal Component
 *
 * Modal containing the reel-to-reel voice recorder and memo list.
 * Can be triggered from anywhere in the app.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { X, Mic, List } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useVoiceMemos } from '@/hooks/useVoiceMemos';
import { ReelToReelRecorder } from '@/components/ui/recorder';
import { VoiceMemosList } from '@/components/ui/recorder/VoiceMemosList';
import { VoiceMemoWithMeta } from '@/types/voiceMemo';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';

interface VoiceMemoModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Optional band ID to filter/share memos */
  bandId?: string | null;
}

type ViewMode = 'record' | 'library';

const VIEW_OPTIONS = [
  { value: 'record' as ViewMode, label: 'RECORD', icon: Mic },
  { value: 'library' as ViewMode, label: 'LIBRARY', icon: List },
];

export const VoiceMemoModal: React.FC<VoiceMemoModalProps> = ({
  visible,
  onClose,
  bandId = null,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('record');
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);

  const {
    memos,
    isLoading,
    isUploading,
    refresh,
    uploadMemo,
    deleteMemo,
    shareToBand,
  } = useVoiceMemos({ bandId, includeShared: true });

  // Handle recording complete
  const handleRecordingComplete = useCallback(async (blob: Blob, duration: number) => {
    console.log('[VoiceMemoModal] Recording complete:', duration, 'seconds');
    // Upload will happen when save is triggered
    const memo = await uploadMemo(blob, duration);
    if (memo) {
      // Switch to library view to see the new memo
      setViewMode('library');
    }
  }, [uploadMemo]);

  // Handle share
  const handleShare = useCallback((memo: VoiceMemoWithMeta) => {
    // TODO: Open share picker modal
    console.log('[VoiceMemoModal] Share memo:', memo.id);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (memo: VoiceMemoWithMeta) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await deleteMemo(memo.id);
    if (success) {
      // If we were playing this memo, stop
      if (playingMemoId === memo.id) {
        setPlayingMemoId(null);
      }
    }
  }, [deleteMemo, playingMemoId]);

  // Handle play/pause
  const handlePlay = useCallback((memo: VoiceMemoWithMeta) => {
    if (playingMemoId === memo.id) {
      // Toggle off
      setPlayingMemoId(null);
    } else {
      // Play this memo
      setPlayingMemoId(memo.id);
      // TODO: Actually play the audio using signed URL
    }
  }, [playingMemoId]);

  // Handle close
  const handleClose = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlayingMemoId(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>VOICE MEMOS</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityLabel="Close voice memo modal"
            accessibilityRole="button"
            accessibilityHint="Returns to previous screen"
          >
            <X size={24} color={Colors.graphite} accessibilityElementsHidden />
          </Pressable>
        </View>

        {/* View mode toggle */}
        <View style={styles.toggleContainer}>
          <GangSwitch
            label=""
            value={viewMode}
            options={VIEW_OPTIONS}
            onChange={(value) => value && setViewMode(value)}
            showIcons
            allowDeselect={false}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {viewMode === 'record' ? (
            <ScrollView
              contentContainerStyle={styles.recorderContainer}
              showsVerticalScrollIndicator={false}
            >
              <ReelToReelRecorder
                onRecordingComplete={handleRecordingComplete}
                onShare={(blob) => {
                  // Will be called when share button in recorder is pressed
                  console.log('[VoiceMemoModal] Share from recorder');
                }}
                onDelete={() => {
                  // Reset recorder
                  console.log('[VoiceMemoModal] Delete from recorder');
                }}
              />
            </ScrollView>
          ) : (
            <VoiceMemosList
              memos={memos}
              isLoading={isLoading}
              onRefresh={refresh}
              onPlay={handlePlay}
              onShare={handleShare}
              onDelete={handleDelete}
              playingMemoId={playingMemoId}
            />
          )}
        </View>

        {/* Upload indicator */}
        {isUploading && (
          <View style={styles.uploadingBanner}>
            <Text style={styles.uploadingText}>Saving memo...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.matteFog,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    letterSpacing: 3,
    color: Colors.ink,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.alloy,
  },
  toggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  recorderContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  uploadingBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.charcoal,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  uploadingText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    color: Colors.softWhite,
    letterSpacing: 1,
  },
});

export default VoiceMemoModal;
