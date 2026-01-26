/**
 * VoiceMemoModal Component
 *
 * Modal containing the reel-to-reel voice recorder and memo list.
 * Can be triggered from anywhere in the app.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Mic, List } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useVoiceMemos } from '@/hooks/useVoiceMemos';
import { ReelToReelRecorder } from '@/components/ui/recorder';
import { VoiceMemosList } from '@/components/ui/recorder/VoiceMemosList';
import { VoiceMemoWithMeta } from '@/types/voiceMemo';
import { GangSwitch } from '@/components/ui/filters/GangSwitch';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { useStyledAlert } from '@/hooks/useStyledAlert';

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

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nativePlayerRef = useRef<AudioPlayer | null>(null);
  const nativePlaybackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { showError } = useStyledAlert();

  const {
    memos,
    isLoading,
    isUploading,
    refresh,
    uploadMemo,
    deleteMemo,
    shareToBand,
    getSignedUrl,
  } = useVoiceMemos({ bandId, includeShared: true });

  // Cleanup native player
  const cleanupNativePlayer = useCallback(() => {
    if (nativePlaybackTimerRef.current) {
      clearInterval(nativePlaybackTimerRef.current);
      nativePlaybackTimerRef.current = null;
    }
    if (nativePlayerRef.current) {
      try {
        nativePlayerRef.current.remove();
      } catch (e) {
        // Ignore cleanup errors
      }
      nativePlayerRef.current = null;
    }
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!visible) {
      // Cleanup when modal closes
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } else {
        cleanupNativePlayer();
      }
      setPlayingMemoId(null);
    }
  }, [visible, cleanupNativePlayer]);

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
        if (Platform.OS === 'web') {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
          }
        } else {
          cleanupNativePlayer();
        }
        setPlayingMemoId(null);
      }
    }
  }, [deleteMemo, playingMemoId, cleanupNativePlayer]);

  // Handle play/pause
  const handlePlay = useCallback(async (memo: VoiceMemoWithMeta) => {
    // If same memo, toggle pause/play
    if (playingMemoId === memo.id) {
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
        }
      } else {
        if (nativePlayerRef.current) {
          if (nativePlayerRef.current.playing) {
            nativePlayerRef.current.pause();
          } else {
            nativePlayerRef.current.play();
          }
        }
      }
      return;
    }

    // Stop current playback
    if (Platform.OS === 'web') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    } else {
      cleanupNativePlayer();
    }

    // Get signed URL
    const url = await getSignedUrl(memo.id);
    if (!url) {
      showError('Playback Error', 'Could not load audio file.');
      return;
    }

    // Play audio
    if (Platform.OS === 'web') {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => {
        setPlayingMemoId(null);
      };
      audioRef.current.onerror = () => {
        showError('Playback Error', 'Could not play audio file.');
        setPlayingMemoId(null);
      };
      audioRef.current.play();
      setPlayingMemoId(memo.id);
    } else {
      // Native playback using expo-audio
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'duckOthers',
        });

        const player = createAudioPlayer({ uri: url });
        nativePlayerRef.current = player;
        player.play();
        setPlayingMemoId(memo.id);

        // Monitor playback for completion
        nativePlaybackTimerRef.current = setInterval(() => {
          if (nativePlayerRef.current) {
            const currentTime = nativePlayerRef.current.currentTime || 0;
            const duration = nativePlayerRef.current.duration || 0;
            const isPlaying = nativePlayerRef.current.playing;

            if (!isPlaying && currentTime >= duration - 0.1 && duration > 0) {
              cleanupNativePlayer();
              setPlayingMemoId(null);
            }
          }
        }, 250);
      } catch (err) {
        console.error('[VoiceMemoModal] Native playback error:', err);
        showError('Playback Error', 'Could not play audio file.');
        cleanupNativePlayer();
      }
    }
  }, [playingMemoId, getSignedUrl, showError, cleanupNativePlayer]);

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
