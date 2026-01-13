/**
 * PlaybackControls Component
 *
 * Transport controls for the practice player:
 * - Play/Pause button
 * - Progress bar with seek
 * - Speed control slider
 * - A-B loop markers
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { Play, Pause, RotateCcw, Repeat } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import type { PlaybackStatus, LoopRegion } from '@/types/practicePlayer';
import { PLAYBACK_RATES } from '@/types/practicePlayer';

interface PlaybackControlsProps {
  status: PlaybackStatus | null;
  loopRegion: LoopRegion;
  isLoading: boolean;
  onPlayPause: () => void;
  onSeek: (positionMs: number) => void;
  onRateChange: (rate: number) => void;
  onSetLoopStart: () => void;
  onSetLoopEnd: () => void;
  onClearLoop: () => void;
  onToggleLoop: () => void;
}

/**
 * Format milliseconds as MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get display text for playback rate
 */
function formatRate(rate: number): string {
  if (rate === 1.0) return '1×';
  return `${rate.toFixed(2).replace(/\.?0+$/, '')}×`;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  status,
  loopRegion,
  isLoading,
  onPlayPause,
  onSeek,
  onRateChange,
  onSetLoopStart,
  onSetLoopEnd,
  onClearLoop,
  onToggleLoop,
}) => {

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlayPause();
  };

  const handleSeekStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSeekComplete = useCallback(
    (value: number) => {
      if (status) {
        const positionMs = value * status.durationMs;
        onSeek(positionMs);
      }
    },
    [status, onSeek]
  );

  const handleRateChange = useCallback(
    async (value: number) => {
      // Snap to nearest rate
      const nearestRate = PLAYBACK_RATES.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      onRateChange(nearestRate);
    },
    [onRateChange]
  );

  const handleLoopAction = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const progress = status && status.durationMs > 0
    ? status.positionMs / status.durationMs
    : 0;

  const currentRate = status?.rate ?? 1.0;

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        {/* Time Display */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(status?.positionMs ?? 0)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(status?.durationMs ?? 0)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onSlidingStart={handleSeekStart}
            onSlidingComplete={handleSeekComplete}
            minimumTrackTintColor={Colors.vermilion}
            maximumTrackTintColor={Colors.alloy}
            thumbTintColor={Colors.vermilion}
            disabled={isLoading || !status}
          />

          {/* Loop Region Indicators */}
          {loopRegion.enabled && status && status.durationMs > 0 && (
            <View style={styles.loopOverlay} pointerEvents="none">
              <View
                style={[
                  styles.loopMarker,
                  styles.loopStart,
                  { left: `${(loopRegion.startMs / status.durationMs) * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.loopMarker,
                  styles.loopEnd,
                  { left: `${(loopRegion.endMs / status.durationMs) * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.loopRegionHighlight,
                  {
                    left: `${(loopRegion.startMs / status.durationMs) * 100}%`,
                    width: `${((loopRegion.endMs - loopRegion.startMs) / status.durationMs) * 100}%`,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* Transport Controls */}
      <View style={styles.transportRow}>
        {/* Loop A Button */}
        <Pressable
          style={[
            styles.smallButton,
            loopRegion.startMs > 0 && styles.smallButtonActive,
          ]}
          onPress={() => handleLoopAction(onSetLoopStart)}
        >
          <Text style={[
            styles.smallButtonText,
            loopRegion.startMs > 0 && styles.smallButtonTextActive,
          ]}>
            A
          </Text>
        </Pressable>

        {/* Play/Pause Button */}
        <Pressable
          style={styles.playButton}
          onPress={handlePlayPause}
          disabled={isLoading || !status}
        >
          <View style={styles.playButtonInner}>
            {status?.isPlaying ? (
              <Pause size={32} color={Colors.softWhite} fill={Colors.softWhite} />
            ) : (
              <Play size={32} color={Colors.softWhite} fill={Colors.softWhite} />
            )}
          </View>
        </Pressable>

        {/* Loop B Button */}
        <Pressable
          style={[
            styles.smallButton,
            loopRegion.endMs > 0 && styles.smallButtonActive,
          ]}
          onPress={() => handleLoopAction(onSetLoopEnd)}
        >
          <Text style={[
            styles.smallButtonText,
            loopRegion.endMs > 0 && styles.smallButtonTextActive,
          ]}>
            B
          </Text>
        </Pressable>
      </View>

      {/* Loop Toggle Row */}
      {(loopRegion.startMs > 0 || loopRegion.endMs > 0) && (
        <View style={styles.loopControlRow}>
          <Pressable
            style={[
              styles.loopToggleButton,
              loopRegion.enabled && styles.loopToggleButtonActive,
            ]}
            onPress={() => handleLoopAction(onToggleLoop)}
          >
            <Repeat
              size={16}
              color={loopRegion.enabled ? Colors.softWhite : Colors.graphite}
            />
            <Text style={[
              styles.loopToggleText,
              loopRegion.enabled && styles.loopToggleTextActive,
            ]}>
              LOOP {loopRegion.enabled ? 'ON' : 'OFF'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.clearLoopButton}
            onPress={() => handleLoopAction(onClearLoop)}
          >
            <RotateCcw size={14} color={Colors.graphite} />
            <Text style={styles.clearLoopText}>CLEAR</Text>
          </Pressable>
        </View>
      )}

      {/* Speed Control */}
      <View style={styles.speedSection}>
        <Text style={styles.speedLabel}>SPEED</Text>
        <View style={styles.speedSliderRow}>
          <Text style={styles.speedValue}>{formatRate(currentRate)}</Text>
          <Slider
            style={styles.speedSlider}
            minimumValue={0.5}
            maximumValue={1.5}
            step={0.05}
            value={currentRate}
            onSlidingComplete={handleRateChange}
            minimumTrackTintColor={Colors.moss}
            maximumTrackTintColor={Colors.alloy}
            thumbTintColor={Colors.moss}
            disabled={isLoading || !status}
          />
        </View>
        <View style={styles.speedLabelsRow}>
          <Text style={styles.speedLabelSmall}>0.5×</Text>
          <Text style={styles.speedLabelSmall}>1×</Text>
          <Text style={styles.speedLabelSmall}>1.5×</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  progressSection: {
    gap: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 12,
    color: Colors.graphite,
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  loopOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  loopMarker: {
    position: 'absolute',
    width: 3,
    height: 20,
    backgroundColor: Colors.vermilion,
    borderRadius: 1.5,
  },
  loopStart: {},
  loopEnd: {},
  loopRegionHighlight: {
    position: 'absolute',
    height: 8,
    backgroundColor: 'rgba(238, 108, 77, 0.2)',
    top: '50%',
    marginTop: -4,
    borderRadius: 4,
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.vermilion,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  playButtonInner: {
    marginLeft: 4, // Optical centering for play icon
  },
  smallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  smallButtonActive: {
    backgroundColor: Colors.charcoal,
  },
  smallButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.graphite,
  },
  smallButtonTextActive: {
    color: Colors.softWhite,
  },
  loopControlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loopToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.alloy,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  loopToggleButtonActive: {
    backgroundColor: Colors.moss,
  },
  loopToggleText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 11,
    color: Colors.graphite,
    letterSpacing: 1,
  },
  loopToggleTextActive: {
    color: Colors.softWhite,
  },
  clearLoopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearLoopText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 1,
  },
  speedSection: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.alloy,
  },
  speedLabel: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 1.5,
  },
  speedSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 16,
    color: Colors.moss,
    width: 50,
    textAlign: 'center',
  },
  speedSlider: {
    flex: 1,
    height: 40,
  },
  speedLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 62,
  },
  speedLabelSmall: {
    fontFamily: 'LexendDecaRegular',
    fontSize: 9,
    color: Colors.graphite,
  },
});
