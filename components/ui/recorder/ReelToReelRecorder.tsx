/**
 * ReelToReelRecorder Component
 *
 * Voice recorder with unified single reel graphic.
 * Features a glowing reel that spins during recording/playback.
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Share2, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { TransportButton } from '@/types/voiceMemo';

// Sub-components
import { TapeReel } from './TapeReel';
import { VUMeterDisplay } from '@/components/ui/practice/VUMeterDisplay';
import { TransportControls } from './TransportControls';

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
}

// Layout constants
const REEL_SIZE = 140;
const REEL_SIZE_COMPACT = 100;

export const ReelToReelRecorder: React.FC<ReelToReelRecorderProps> = ({
  onRecordingComplete,
  onShare,
  onDelete,
  compact = false,
  fullWidth = false,
  title = 'VOICE MEMO',
  showTransport = true,
}) => {
  const { showWarning } = useStyledAlert();

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

  // Show permission warning via styled alert
  useEffect(() => {
    if (permissionStatus === 'denied') {
      showWarning(
        'Microphone Access Required',
        'Please enable microphone access in settings to use the voice recorder.'
      );
    }
  }, [permissionStatus, showWarning]);

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
    onDelete?.();
  }, [reset, onDelete]);

  const reelSize = compact ? REEL_SIZE_COMPACT : REEL_SIZE;
  const isSpinning = state === 'recording' || state === 'playing';

  return (
    <View style={[
      styles.housing,
      compact && styles.housingCompact,
      fullWidth && styles.housingFullWidth,
    ]}>
      {/* Main content section - flex: 1 in fullWidth mode */}
      <View style={[styles.mainContent, fullWidth && styles.mainContentFullWidth]}>
        {/* Header with title and screws */}
        <View style={styles.header}>
          <View style={styles.screw} />
          <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
          <View style={styles.screw} />
        </View>

        {/* Single centered reel */}
        <View style={[styles.reelContainer, compact && styles.reelContainerCompact]}>
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
      {showTransport && (
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

      {/* Action buttons (when recording exists) - beveled style matching metronome */}
      {hasRecording && state !== 'recording' && (
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.4)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  housingCompact: {
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  housingFullWidth: {
    flex: 1,
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  mainContent: {
    alignItems: 'center',
  },
  mainContentFullWidth: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  reelContainerCompact: {
    marginBottom: 14,
  },
  transportContainer: {
    marginBottom: 20,
  },
  transportContainerCompact: {
    marginBottom: 14,
  },
  transportContainerFullWidth: {
    paddingVertical: 24,
    marginBottom: 0,
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
