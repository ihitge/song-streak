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
import { useBands } from '@/hooks/useBands';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { VoiceMemoWithMeta } from '@/types/voiceMemo';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { showError, showSuccess, showConfirm } = useStyledAlert();
  const { bands } = useBands();
  const {
    memos,
    isLoading: memosLoading,
    refresh: refreshMemos,
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
      showSuccess('Saved', 'Your song idea has been saved!');
    }
  }, [uploadMemo, shareToBand, showSuccess]);

  // Handle memo playback
  const handlePlay = useCallback(async (memo: VoiceMemoWithMeta) => {
    // If same memo, toggle pause/play
    if (playingMemoId === memo.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
      return;
    }

    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
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
      // For native, we'd use expo-audio - simplified for now
      console.log('[Ideas] Native playback not yet implemented');
      showError('Coming Soon', 'Native audio playback is being implemented.');
    }
  }, [playingMemoId, getSignedUrl, showError]);

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
      showSuccess('Shared', `Recording shared with band!`);
    }
  }, [selectedMemoForShare, shareToBand, showSuccess]);

  // Handle unshare from modal
  const handleUnshare = useCallback(async () => {
    if (!selectedMemoForShare) return;
    const success = await unshareMemo(selectedMemoForShare.id);
    if (success) {
      showSuccess('Unshared', 'Recording is now personal only.');
    }
  }, [selectedMemoForShare, unshareMemo, showSuccess]);

  // Handle memo delete
  const handleDelete = useCallback((memo: VoiceMemoWithMeta) => {
    showConfirm(
      'Delete Recording',
      `Are you sure you want to delete "${memo.title || 'Untitled Memo'}"?`,
      async () => {
        const success = await deleteMemo(memo.id);
        if (success) {
          showSuccess('Deleted', 'Recording has been deleted.');
          // Stop playback if this memo was playing
          if (playingMemoId === memo.id) {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
            }
            setPlayingMemoId(null);
          }
        }
      },
      'Delete',
      'Cancel',
      'error'
    );
  }, [deleteMemo, playingMemoId, showConfirm, showSuccess]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <PageHeader />

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <GangSwitch
          label="VIEW"
          value={viewMode}
          options={VIEW_OPTIONS}
          onChange={(value) => setViewMode(value ?? 'record')}
          showIcons
          allowDeselect={false}
        />
      </View>

      {/* Content based on view mode */}
      {viewMode === 'record' ? (
        <DeviceCasing title="SOUND RECORDER">
          <ReelToReelRecorder
            fullWidth
            title=""
            enableSaveFlow
            bands={bands}
            onSave={handleSave}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </DeviceCasing>
      ) : (
        <View style={styles.libraryContainer}>
          <VoiceMemosList
            memos={memos}
            isLoading={memosLoading}
            onRefresh={refreshMemos}
            onPlay={handlePlay}
            onShare={handleShare}
            onDelete={handleDelete}
            playingMemoId={playingMemoId}
            emptyMessage="No voice memos yet.\nRecord your first song idea!"
          />
        </View>
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
  toggleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  libraryContainer: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
});
