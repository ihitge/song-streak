import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useNavButtonSound } from '@/hooks/useNavButtonSound';

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onComplete?: (seconds: number) => void;
  sessionSeconds: number;
  compact?: boolean;
  showComplete?: boolean;  // Whether to show the complete/log button
}

/**
 * Transport Controls for Metronome
 *
 * Play/Pause, Reset, and Complete buttons following PracticeTimer styling.
 * Matches Industrial Play aesthetic with beveled buttons.
 */
export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  onPlayPause,
  onReset,
  onComplete,
  sessionSeconds,
  compact = false,
  showComplete = true,
}) => {
  const { playSound } = useNavButtonSound();

  /**
   * Handle play/pause button press
   */
  const handlePlayPause = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();
    onPlayPause();
  }, [onPlayPause, playSound]);

  /**
   * Handle reset button press
   */
  const handleReset = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    onReset();
  }, [onReset, playSound]);

  /**
   * Handle complete button press
   */
  const handleComplete = useCallback(async () => {
    if (sessionSeconds === 0 || !onComplete) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await playSound();
    onComplete(sessionSeconds);
  }, [sessionSeconds, onComplete, playSound]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Reset button */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleReset}
        activeOpacity={0.8}
      >
        <View style={[styles.secondaryButtonInner, compact && styles.secondaryButtonInnerCompact]}>
          <RotateCcw size={compact ? 16 : 20} color={Colors.graphite} />
        </View>
      </TouchableOpacity>

      {/* Play/Pause button (primary) */}
      <TouchableOpacity
        style={styles.primaryButtonContainer}
        onPress={handlePlayPause}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isPlaying ? ['#666', '#444'] : [Colors.vermilion, '#d04620']}
          style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {isPlaying ? (
            <Pause size={compact ? 24 : 32} color={Colors.softWhite} />
          ) : (
            <Play
              size={compact ? 24 : 32}
              color={Colors.softWhite}
              style={{ marginLeft: compact ? 2 : 4 }}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Complete/Log button */}
      {showComplete && onComplete && (
        <TouchableOpacity
          style={[styles.secondaryButton, sessionSeconds === 0 && styles.buttonDisabled]}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={sessionSeconds === 0}
        >
          <View
            style={[
              styles.secondaryButtonInner,
              compact && styles.secondaryButtonInnerCompact,
              sessionSeconds > 0 && styles.completeButtonActive,
            ]}
          >
            <Check size={compact ? 16 : 20} color={sessionSeconds > 0 ? Colors.moss : Colors.graphite} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  containerCompact: {
    gap: 16,
  },
  primaryButtonContainer: {
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  primaryButtonCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  secondaryButton: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  secondaryButtonInnerCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  completeButtonActive: {
    borderColor: Colors.moss,
    borderWidth: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
