/**
 * ReelToReelRecorder Component
 *
 * Full skeuomorphic reel-to-reel tape recorder for voice memos.
 * Combines all recorder sub-components into a cohesive interface.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Mic, MicOff, Share2, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import {
  TransportButton,
  PlaybackSpeed,
  MAX_RECORDING_SECONDS,
} from '@/types/voiceMemo';

// Sub-components
import { TapeReel } from './TapeReel';
import { TapePath } from './TapePath';
import { RecorderVUMeter } from './RecorderVUMeter';
import { TapeCounter } from './TapeCounter';
import { SpeedSelector } from './SpeedSelector';
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
  /** Custom title */
  title?: string;
}

// Layout constants
const REEL_SIZE = 70;
const REEL_SIZE_COMPACT = 55;
const REEL_GAP = 80;
const REEL_GAP_COMPACT = 60;

export const ReelToReelRecorder: React.FC<ReelToReelRecorderProps> = ({
  onRecordingComplete,
  onShare,
  onDelete,
  compact = false,
  title = 'VOICE MEMO',
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>('normal');

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
    setSpeed,
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

  // Sync playback speed with hook
  useEffect(() => {
    setSpeed(playbackSpeed);
  }, [playbackSpeed, setSpeed]);

  // Calculate tape amounts based on state
  const [supplyTape, setSupplyTape] = useState(0.8);
  const [takeupTape, setTakeupTape] = useState(0.2);

  useEffect(() => {
    if (state === 'recording') {
      // During recording, tape moves from supply to takeup
      const progress = recording.elapsedSeconds / MAX_RECORDING_SECONDS;
      setSupplyTape(0.8 - progress * 0.6);
      setTakeupTape(0.2 + progress * 0.6);
    } else if (state === 'playing') {
      // During playback, simulate tape movement
      const progress = playback.currentTime / playback.duration;
      setSupplyTape(0.8 - progress * 0.6);
      setTakeupTape(0.2 + progress * 0.6);
    } else if (!hasRecording) {
      // Reset to initial state
      setSupplyTape(0.8);
      setTakeupTape(0.2);
    }
  }, [state, recording.elapsedSeconds, playback.currentTime, playback.duration, hasRecording]);

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
  const reelGap = compact ? REEL_GAP_COMPACT : REEL_GAP;
  const isSpinning = state === 'recording' || state === 'playing';

  // Elapsed time for display
  const elapsedSeconds = state === 'recording'
    ? recording.elapsedSeconds
    : state === 'playing'
      ? playback.currentTime
      : hasRecording
        ? playback.duration
        : 0;

  return (
    <View style={[styles.housing, compact && styles.housingCompact]}>
      {/* Header with title and screws */}
      <View style={styles.header}>
        <View style={styles.screw} />
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <View style={styles.screw} />
      </View>

      {/* Microphone permission indicator */}
      {permissionStatus === 'denied' && (
        <View style={styles.permissionWarning}>
          <MicOff size={14} color={Colors.vermilion} />
          <Text style={styles.permissionText}>Microphone access denied</Text>
        </View>
      )}

      {/* Reels section */}
      <View style={[styles.reelsContainer, compact && styles.reelsContainerCompact]}>
        {/* Supply reel (left) */}
        <View style={styles.reelWrapper}>
          <TapeReel
            size={reelSize}
            isSpinning={isSpinning}
            direction="supply"
            speed={playbackSpeed}
            isRecording={state === 'recording'}
            tapeAmount={supplyTape}
          />
          <Text style={[styles.reelLabel, compact && styles.reelLabelCompact]}>SUPPLY</Text>
        </View>

        {/* Tape path */}
        <TapePath
          width={reelGap + reelSize}
          height={reelSize / 2}
          isMoving={isSpinning}
          speed={playbackSpeed}
          direction="forward"
          leftReelX={reelSize / 2}
          rightReelX={reelSize / 2 + reelGap}
          reelY={reelSize / 4}
          tapeRadius={reelSize * 0.35}
        />

        {/* Takeup reel (right) */}
        <View style={styles.reelWrapper}>
          <TapeReel
            size={reelSize}
            isSpinning={isSpinning}
            direction="takeup"
            speed={playbackSpeed}
            isRecording={state === 'recording'}
            tapeAmount={takeupTape}
          />
          <Text style={[styles.reelLabel, compact && styles.reelLabelCompact]}>TAKE-UP</Text>
        </View>
      </View>

      {/* VU Meter */}
      <View style={[styles.vuMeterContainer, compact && styles.vuMeterContainerCompact]}>
        <RecorderVUMeter
          levelLeft={recording.audioLevelLeft}
          levelRight={recording.audioLevelRight}
          isRecording={state === 'recording'}
          isPlaying={state === 'playing'}
          compact={compact}
        />
      </View>

      {/* Transport controls */}
      <View style={[styles.transportContainer, compact && styles.transportContainerCompact]}>
        <TransportControls
          state={state}
          hasRecording={hasRecording}
          onPress={handleTransportPress}
          compact={compact}
        />
      </View>

      {/* Bottom controls: Speed + Counter */}
      <View style={[styles.bottomControls, compact && styles.bottomControlsCompact]}>
        <View style={styles.speedContainer}>
          <SpeedSelector
            value={playbackSpeed}
            onChange={setPlaybackSpeed}
            disabled={state === 'recording'}
            compact={compact}
          />
        </View>

        <View style={styles.counterContainer}>
          <TapeCounter
            elapsedSeconds={Math.floor(elapsedSeconds)}
            totalSeconds={MAX_RECORDING_SECONDS}
            showTotal={true}
            compact={compact}
          />
        </View>
      </View>

      {/* Action buttons (when recording exists) */}
      {hasRecording && state !== 'recording' && (
        <View style={[styles.actionButtons, compact && styles.actionButtonsCompact]}>
          {onShare && (
            <Pressable
              onPress={handleShare}
              style={styles.actionButton}
              accessibilityLabel="Share recording"
              accessibilityRole="button"
            >
              <Share2 size={compact ? 16 : 18} color={Colors.softWhite} />
              <Text style={[styles.actionButtonText, compact && styles.actionButtonTextCompact]}>
                SHARE
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDelete}
            style={[styles.actionButton, styles.actionButtonDestructive]}
            accessibilityLabel="Delete recording"
            accessibilityRole="button"
          >
            <Trash2 size={compact ? 16 : 18} color={Colors.softWhite} />
            <Text style={[styles.actionButtonText, compact && styles.actionButtonTextCompact]}>
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
    backgroundColor: Colors.matteFog,
    borderRadius: 16,
    padding: 20,
    // Outer bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    // Shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  housingCompact: {
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  screw: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.graphite,
  },
  title: {
    fontFamily: 'LexendDecaBold',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.graphite,
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 10,
    letterSpacing: 2,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(238, 108, 77, 0.1)',
    borderRadius: 6,
    marginBottom: 12,
  },
  permissionText: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 11,
    color: Colors.vermilion,
  },
  reelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: REEL_GAP,
    marginBottom: 20,
    position: 'relative',
  },
  reelsContainerCompact: {
    gap: REEL_GAP_COMPACT,
    marginBottom: 14,
  },
  reelWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  reelLabel: {
    fontFamily: 'LexendDecaBold',
    fontSize: 8,
    letterSpacing: 1,
    color: Colors.graphite,
  },
  reelLabelCompact: {
    fontSize: 7,
  },
  vuMeterContainer: {
    marginBottom: 16,
  },
  vuMeterContainerCompact: {
    marginBottom: 10,
  },
  transportContainer: {
    marginBottom: 16,
  },
  transportContainerCompact: {
    marginBottom: 10,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bottomControlsCompact: {
    gap: 8,
  },
  speedContainer: {
    flex: 1,
  },
  counterContainer: {
    flex: 1.2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButtonsCompact: {
    marginTop: 10,
    paddingTop: 10,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.deepSpaceBlue,
    borderRadius: 8,
    // Bevel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  actionButtonDestructive: {
    backgroundColor: Colors.vermilion,
  },
  actionButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.softWhite,
  },
  actionButtonTextCompact: {
    fontSize: 9,
  },
});

export default ReelToReelRecorder;
