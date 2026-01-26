/**
 * Ideas Screen - Voice Memo Recorder & Library
 *
 * Capture musical ideas with the reel-to-reel voice recorder.
 * Features:
 * - Skeuomorphic tape recorder interface
 * - Record, save, and name voice memos
 * - Browse saved memos in library view
 * - Play back recordings with secure URLs
 * - Share memos with band members
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Mic, Library } from 'lucide-react-native';
import { PageHeader } from '@/components/ui/PageHeader';
import { ReelToReelRecorder, VoiceMemosList } from '@/components/ui/recorder';
import { GangSwitch } from '@/components/ui/filters';
import { ShareToBandModal } from '@/components/ui/modals';
import { Colors } from '@/constants/Colors';
import { DeviceCasing } from '@/components/ui/DeviceCasing';
import { useVoiceMemos } from '@/hooks/useVoiceMemos';
import { useVoiceMemosQuery } from '@/hooks/queries/useVoiceMemosQuery';
import { useBands } from '@/hooks/useBands';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { VoiceMemoWithMeta } from '@/types/voiceMemo';

// Import expo-audio for native playback
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

type ViewMode = 'record' | 'library';

const VIEW_OPTIONS = [
  { value: 'record' as ViewMode, label: 'RECORD', icon: Mic },
  { value: 'library' as ViewMode, label: 'LIBRARY', icon: Library },
];

export default function IdeasScreen() {
  const [viewMode, setViewMode] = useState<ViewMode | null>('record');
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedMemoForShare, setSelectedMemoForShare] = useState<VoiceMemoWithMeta | null>(null);

  // Web audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Native audio player ref
  const nativePlayerRef = useRef<AudioPlayer | null>(null);
  const nativePlaybackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { showError, showSuccess, showConfirm } = useStyledAlert();
  const { bands } = useBands();

  // Use React Query for cached memo data (prevents tab flicker)
  const {
    memos,
    isLoading: memosLoading,
    refetch: refetchMemos,
    invalidate: invalidateMemos,
  } = useVoiceMemosQuery({ includeShared: true });

  // Use original hook for mutations (upload, delete, share)
  const {
    uploadMemo,
    deleteMemo,
    shareToBand,
    unshareMemo,
    getSignedUrl,
    isUploading: hookUploading,
    uploadProgress: hookProgress,
  } = useVoiceMemos({ includeShared: true });

  // Sync upload state from hook
  useEffect(() => {
    setIsUploading(hookUploading);
    setUploadProgress(hookProgress);
  }, [hookUploading, hookProgress]);

  // Handle save from recorder
  const handleSave = useCallback(async (
    blob: Blob,
    duration: number,
    title: string,
    bandId: string | null
  ) => {
    console.log('[Ideas] Saving recording:', title, 'duration:', duration, 'bandId:', bandId);

    const memo = await uploadMemo(blob, duration, title);

    if (memo) {
      // If band was selected, share to band
      if (bandId) {
        await shareToBand(memo.id, bandId);
      }
      // Invalidate cache to show new memo
      invalidateMemos();
      showSuccess('Saved', 'Your song idea has been saved!');
    }
  }, [uploadMemo, shareToBand, invalidateMemos, showSuccess]);

  /**
   * Cleanup native player
   */
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

  // Handle memo playback
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
        // Native toggle
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

    // Create audio element (web) or use expo-audio (native)
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
        console.log('[Ideas] Starting native playback for URL:', url);

        // Configure audio mode for playback
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: 'duckOthers',
        });

        // Create player with the signed URL
        const player = createAudioPlayer({ uri: url });
        nativePlayerRef.current = player;

        // Start playback
        player.play();
        setPlayingMemoId(memo.id);

        // Monitor playback for completion
        nativePlaybackTimerRef.current = setInterval(() => {
          if (nativePlayerRef.current) {
            const currentTime = nativePlayerRef.current.currentTime || 0;
            const duration = nativePlayerRef.current.duration || 0;
            const isPlaying = nativePlayerRef.current.playing;

            // Check if playback ended
            if (!isPlaying && currentTime >= duration - 0.1 && duration > 0) {
              console.log('[Ideas] Native playback ended');
              cleanupNativePlayer();
              setPlayingMemoId(null);
            }
          }
        }, 250);

        console.log('[Ideas] Native playback started');
      } catch (err) {
        console.error('[Ideas] Native playback error:', err);
        showError('Playback Error', 'Could not play audio file.');
        cleanupNativePlayer();
      }
    }
  }, [playingMemoId, getSignedUrl, showError, cleanupNativePlayer]);

  // Handle memo share (show band picker modal)
  const handleShare = useCallback((memo: VoiceMemoWithMeta) => {
    setSelectedMemoForShare(memo);
    setShareModalVisible(true);
  }, []);

  // Handle share to band from modal
  const handleShareToBand = useCallback(async (bandId: string) => {
    if (!selectedMemoForShare) return;
    const success = await shareToBand(selectedMemoForShare.id, bandId);
    if (success) {
      invalidateMemos();
      showSuccess('Shared', `Recording shared with band!`);
    }
  }, [selectedMemoForShare, shareToBand, invalidateMemos, showSuccess]);

  // Handle unshare from modal
  const handleUnshare = useCallback(async () => {
    if (!selectedMemoForShare) return;
    const success = await unshareMemo(selectedMemoForShare.id);
    if (success) {
      invalidateMemos();
      showSuccess('Unshared', 'Recording is now personal only.');
    }
  }, [selectedMemoForShare, unshareMemo, invalidateMemos, showSuccess]);

  // Handle memo delete
  const handleDelete = useCallback((memo: VoiceMemoWithMeta) => {
    showConfirm(
      'Delete Recording',
      `Are you sure you want to delete "${memo.title || 'Untitled Memo'}"?`,
      async () => {
        const success = await deleteMemo(memo.id);
        if (success) {
          invalidateMemos();
          showSuccess('Deleted', 'Recording has been deleted.');
          // Stop playback if this memo was playing
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
      },
      'Delete',
      'Cancel',
      'error'
    );
  }, [deleteMemo, invalidateMemos, playingMemoId, showConfirm, showSuccess, cleanupNativePlayer]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } else {
        // Cleanup native player
        if (nativePlaybackTimerRef.current) {
          clearInterval(nativePlaybackTimerRef.current);
        }
        if (nativePlayerRef.current) {
          try {
            nativePlayerRef.current.remove();
          } catch (e) {
            // Ignore
          }
        }
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* Content based on view mode */}
      {viewMode === 'record' ? (
        <DeviceCasing title="SOUND RECORDER">
          {/* Content wrapper with padding matching other pages */}
          <View style={styles.contentWrapper}>
            {/* View Toggle */}
            <View style={styles.toggleContainer}>
              <GangSwitch
                label="View Mode"
                value={viewMode}
                options={VIEW_OPTIONS}
                onChange={(value) => setViewMode(value ?? 'record')}
                showIcons
                allowDeselect={false}
              />
            </View>

            {/* Recorder content */}
            <View style={styles.recorderContent}>
              <ReelToReelRecorder
                fullWidth
                title=""
                enableSaveFlow
                bands={bands}
                onSave={handleSave}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
              />
            </View>
          </View>
        </DeviceCasing>
      ) : (
        <DeviceCasing title="IDEA LIBRARY">
          {/* Content wrapper with padding matching other pages */}
          <View style={styles.contentWrapper}>
            {/* View Toggle */}
            <View style={styles.toggleContainer}>
              <GangSwitch
                label="View Mode"
                value={viewMode}
                options={VIEW_OPTIONS}
                onChange={(value) => setViewMode(value ?? 'record')}
                showIcons
                allowDeselect={false}
              />
            </View>

            {/* Library list */}
            <View style={styles.libraryContent}>
              <VoiceMemosList
                memos={memos}
                isLoading={memosLoading}
                onRefresh={refetchMemos}
                onPlay={handlePlay}
                onShare={handleShare}
                onDelete={handleDelete}
                playingMemoId={playingMemoId}
                emptyMessage="No voice memos yet.\nRecord your first song idea!"
              />
            </View>
          </View>
        </DeviceCasing>
      )}

      {/* Share to Band Modal */}
      <ShareToBandModal
        visible={shareModalVisible}
        onClose={() => {
          setShareModalVisible(false);
          setSelectedMemoForShare(null);
        }}
        bands={bands}
        currentBandId={selectedMemoForShare?.band_id ?? null}
        onShare={handleShareToBand}
        onUnshare={handleUnshare}
        memoTitle={selectedMemoForShare?.title ?? 'Untitled Memo'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  toggleContainer: {
    marginBottom: 16,
  },
  recorderContent: {
    flex: 1,
    alignItems: 'center',
  },
  libraryContent: {
    flex: 1,
  },
});
