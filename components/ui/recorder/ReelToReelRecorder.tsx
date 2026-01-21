/**
 * ReelToReelRecorder Component
 *
 * Voice recorder with unified single reel graphic.
 * Features a glowing reel that spins during recording/playback.
 * Includes inline save panel for naming and sharing recordings.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Share2, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { SHADOWS, BEVELS } from '@/constants/Styles';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { TransportButton } from '@/types/voiceMemo';
import { BandWithMemberCount } from '@/types/band';

// Sub-components
import { TapeReel } from './TapeReel';
import { VUMeterDisplay } from '@/components/ui/practice/VUMeterDisplay';
import { TransportControls } from './TransportControls';
import { SaveRecordingPanel } from './SaveRecordingPanel';
import { MicrophonePermissionPrompt } from '@/components/ui/MicrophonePermissionPrompt';

interface ReelToReelRecorderProps {
  /** Called when a recording is completed and saved */
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  /** Called when share button is pressed (with audio blob) */
  onShare?: (blob: Blob) => void;
  /** Called when delete button is pressed */
  onDelete?: () => void;
  /** Compact mode */
  compact?: boolean;
  /** Full-width mode - removes card styling, matches metronome/tuner design */
  fullWidth?: boolean;
  /** Custom title */
  title?: string;
  /** Show transport controls (default true) */
  showTransport?: boolean;
  /** Enable save panel flow (shows save UI after recording stops) */
  enableSaveFlow?: boolean;
  /** Available bands for sharing (required if enableSaveFlow is true) */
  bands?: BandWithMemberCount[];
  /** Called when recording is saved with title and optional band */
  onSave?: (blob: Blob, duration: number, title: string, bandId: string | null) => Promise<void>;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
}

// Layout constants
const REEL_SIZE = 140;
const REEL_SIZE_COMPACT = 100;
const REEL_SIZE_FULLWIDTH = 120;

export const ReelToReelRecorder: React.FC<ReelToReelRecorderProps> = ({
  onRecordingComplete,
  onShare,
  onDelete,
  compact = false,
  fullWidth = false,
  title = 'VOICE MEMO',
  showTransport = true,
  enableSaveFlow = false,
  bands = [],
  onSave,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const { showWarning, showError } = useStyledAlert();
  const [showSavePanel, setShowSavePanel] = useState(false);

  const {
    state,
    recording,
    playback,
    hasRecording,
    hasPermission,
    permissionStatus,
    requestPermission,
    startRecording,
    stopRecording,
    play,
    stop,
    rewind,
    fastForward,
    reset,
    audioBlob,
  } = useVoiceRecorder({
    onRecordingComplete,
    onError: (error) => {
      console.error('[ReelToReelRecorder] Error:', error);
    },
    onAudioLevel: (left, right) => {
      // Audio levels are handled by the hook's recording state
    },
  });

  // Note: Permission UI is now handled inline by MicrophonePermissionPrompt component
  // instead of showing an alert that feels like a dead-end

  // Handle transport button presses
  const handleTransportPress = useCallback((button: TransportButton) => {
    switch (button) {
      case 'record':
        if (permissionStatus !== 'granted') {
          requestPermission().then((granted) => {
            if (granted) {
              startRecording();
            }
          });
        } else {
          startRecording();
        }
        break;
      case 'stop':
        if (state === 'recording') {
          stopRecording();
        } else if (state === 'playing') {
          stop();
        }
        break;
      case 'play':
        if (hasRecording && state !== 'playing') {
          play();
        }
        break;
      case 'rewind':
        rewind();
        break;
      case 'fastforward':
        fastForward();
        break;
    }
  }, [
    state,
    hasRecording,
    permissionStatus,
    requestPermission,
    startRecording,
    stopRecording,
    play,
    stop,
    rewind,
    fastForward,
  ]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (audioBlob && onShare) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onShare(audioBlob);
    }
  }, [audioBlob, onShare]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    reset();
    setShowSavePanel(false);
    onDelete?.();
  }, [reset, onDelete]);

  // Show save panel when recording stops (if save flow is enabled)
  useEffect(() => {
    if (enableSaveFlow && state === 'stopped' && hasRecording && audioBlob) {
      setShowSavePanel(true);
    }
  }, [enableSaveFlow, state, hasRecording, audioBlob]);

  // Handle save from save panel
  const handleSaveRecording = useCallback(async (saveTitle: string, bandId: string | null) => {
    if (!audioBlob || !onSave) return;

    try {
      await onSave(audioBlob, recording.elapsedSeconds, saveTitle, bandId);
      // Reset recorder after successful save
      reset();
      setShowSavePanel(false);
    } catch (error) {
      console.error('[ReelToReelRecorder] Save error:', error);
      showError('Save Failed', 'Could not save recording. Please try again.');
    }
  }, [audioBlob, recording.elapsedSeconds, onSave, reset, showError]);

  // Handle discard from save panel
  const handleDiscardRecording = useCallback(() => {
    reset();
    setShowSavePanel(false);
  }, [reset]);

  const reelSize = compact ? REEL_SIZE_COMPACT : fullWidth ? REEL_SIZE_FULLWIDTH : REEL_SIZE;
  const isSpinning = state === 'recording' || state === 'playing';

  return (
    <View style={[
      styles.housing,
      compact && styles.housingCompact,
      fullWidth && styles.housingFullWidth,
    ]}>
      {/* Main content section - flex: 1 in fullWidth mode */}
      <View style={[styles.mainContent, fullWidth && styles.mainContentFullWidth]}>
        {/* Header with title and screws - only show when NOT fullWidth (DeviceCasing provides title) */}
        {!fullWidth && (
          <View style={styles.header}>
            <View style={styles.screw} />
            <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
            <View style={styles.screw} />
          </View>
        )}

        {/* Single centered reel */}
        <View style={[
          styles.reelContainer,
          compact && styles.reelContainerCompact,
          fullWidth && styles.reelContainerFullWidth,
        ]}>
          <TapeReel
            size={reelSize}
            isSpinning={isSpinning}
            isRecording={state === 'recording'}
          />
        </View>

        {/* VU Meter - using unified VUMeterDisplay component */}
        <VUMeterDisplay
          mode="recording"
          audioLevel={recording.audioLevelLeft}
          isRecording={state === 'recording'}
          isPlaying={state === 'playing'}
          compact={compact}
          embedded
          showTimeDisplay={false}
        />
      </View>

      {/* Transport controls - pinned at bottom in fullWidth mode */}
      {showTransport && permissionStatus === 'granted' && (
        <View style={[
          styles.transportContainer,
          compact && styles.transportContainerCompact,
          fullWidth && styles.transportContainerFullWidth,
        ]}>
          <TransportControls
            state={state}
            hasRecording={hasRecording}
            onPress={handleTransportPress}
            compact={compact}
          />
        </View>
      )}

      {/* Permission prompt - shown when mic access needed, replaces transport */}
      {showTransport && permissionStatus !== 'granted' && (
        <View style={[
          styles.permissionContainer,
          compact && styles.permissionContainerCompact,
          fullWidth && styles.permissionContainerFullWidth,
        ]}>
          <MicrophonePermissionPrompt
            permissionStatus={permissionStatus}
            onRequestPermission={requestPermission}
            featureName="the voice recorder"
            compact={compact}
          />
        </View>
      )}

      {/* Save Recording Panel (when save flow is enabled) */}
      {enableSaveFlow && (
        <SaveRecordingPanel
          visible={showSavePanel}
          bands={bands}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onSave={handleSaveRecording}
          onDiscard={handleDiscardRecording}
        />
      )}

      {/* Action buttons (when recording exists and NOT using save flow) - beveled style matching metronome */}
      {!enableSaveFlow && hasRecording && state !== 'recording' && (
        <View style={[styles.actionButtons, compact && styles.actionButtonsCompact]}>
          {onShare && (
            <Pressable
              onPress={handleShare}
              style={[styles.secondaryButton, compact && styles.secondaryButtonCompact]}
              accessibilityLabel="Share recording"
              accessibilityRole="button"
            >
              <Share2 size={compact ? 16 : 18} color={Colors.graphite} />
              <Text style={[styles.actionButtonText, compact && styles.actionButtonTextCompact]}>
                SHARE
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDelete}
            style={[styles.secondaryButton, styles.deleteButton, compact && styles.secondaryButtonCompact]}
            accessibilityLabel="Delete recording"
            accessibilityRole="button"
          >
            <Trash2 size={compact ? 16 : 18} color={Colors.vermilion} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText, compact && styles.actionButtonTextCompact]}>
              DELETE
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  housing: {
    backgroundColor: Colors.ink,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    // Outer bevel
    ...BEVELS.housing,
    // Shadow
    ...SHADOWS.housing,
  },
  housingCompact: {
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  housingFullWidth: {
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  mainContent: {
    alignItems: 'center',
  },
  mainContentFullWidth: {
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  screw: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.warmGray,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.vermilion,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 10,
    letterSpacing: 2,
  },
  reelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  reelContainerCompact: {
    marginBottom: 16,
  },
  reelContainerFullWidth: {
    marginTop: 8,
    marginBottom: 20,
  },
  transportContainer: {
    marginBottom: 20,
  },
  transportContainerCompact: {
    marginBottom: 14,
  },
  transportContainerFullWidth: {
    paddingTop: 16,
    paddingBottom: 24,
    marginBottom: 0,
  },
  permissionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  permissionContainerCompact: {
    paddingVertical: 12,
  },
  permissionContainerFullWidth: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  actionButtonsCompact: {
    marginTop: 12,
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: Colors.alloy,
    // Bevel effect matching metronome
    ...BEVELS.raised,
    // Shadow
    ...SHADOWS.button,
  },
  secondaryButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  deleteButton: {
    borderColor: Colors.vermilion,
    borderWidth: 1,
  },
  actionButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.graphite,
  },
  actionButtonTextCompact: {
    fontSize: 9,
  },
  deleteButtonText: {
    color: Colors.vermilion,
  },
});

export default ReelToReelRecorder;
