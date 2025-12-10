import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, RotateCcw, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { RamsTapeCounterDisplay } from './RamsTapeCounterDisplay';
import { useClickSound } from '@/hooks/useClickSound';

interface PracticeTimerProps {
  songTitle?: string;
  onComplete?: (seconds: number) => void;
  compact?: boolean; // For embedded contexts (smaller layout)
}

/**
 * Practice timer with skeuomorphic tape counter display
 * Includes play/pause/reset controls following Industrial Play design
 */
export const PracticeTimer: React.FC<PracticeTimerProps> = ({
  songTitle,
  onComplete,
  compact = false,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playSound } = useClickSound();

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handlePlayPause = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();
    setIsRunning((prev) => !prev);
  }, [playSound]);

  const handleReset = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    setIsRunning(false);
    setSeconds(0);
  }, [playSound]);

  const handleComplete = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await playSound();
    setIsRunning(false);
    onComplete?.(seconds);
  }, [playSound, onComplete, seconds]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Song title (if provided and not compact) */}
      {songTitle && !compact && (
        <View style={styles.songHeader}>
          <Text style={styles.nowPracticing}>NOW PRACTICING</Text>
          <Text style={styles.songTitle} numberOfLines={2}>
            {songTitle}
          </Text>
        </View>
      )}

      {/* Tape counter display */}
      <RamsTapeCounterDisplay seconds={seconds} compact={compact} />

      {/* Control buttons */}
      <View style={[styles.controls, compact && styles.controlsCompact]}>
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
            colors={isRunning ? ['#666', '#444'] : [Colors.vermilion, '#d04620']}
            style={[styles.primaryButton, compact && styles.primaryButtonCompact]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {isRunning ? (
              <Pause size={compact ? 24 : 32} color={Colors.softWhite} />
            ) : (
              <Play size={compact ? 24 : 32} color={Colors.softWhite} style={{ marginLeft: compact ? 2 : 4 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Complete button - only show if onComplete provided or not compact */}
        {!compact && (
          <TouchableOpacity
            style={[styles.secondaryButton, seconds === 0 && styles.buttonDisabled]}
            onPress={handleComplete}
            activeOpacity={0.8}
            disabled={seconds === 0}
          >
            <View style={[styles.secondaryButtonInner, seconds > 0 && styles.completeButtonActive]}>
              <Check size={20} color={seconds > 0 ? Colors.moss : Colors.graphite} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Status indicator */}
      <View style={[styles.statusContainer, compact && styles.statusContainerCompact]}>
        <View style={[styles.statusLed, isRunning && styles.statusLedActive]} />
        <Text style={[styles.statusText, compact && styles.statusTextCompact]}>
          {isRunning ? 'RECORDING' : seconds > 0 ? 'PAUSED' : 'READY'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 32,
    paddingVertical: 24,
  },
  containerCompact: {
    gap: 16,
    paddingVertical: 8,
  },
  songHeader: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 24,
  },
  nowPracticing: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.warmGray,
    letterSpacing: 2,
  },
  songTitle: {
    fontFamily: 'LexendDecaBold',
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  controlsCompact: {
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.alloy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    // Inset effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  statusContainerCompact: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.graphite,
  },
  statusLedActive: {
    backgroundColor: Colors.vermilion,
    shadowColor: Colors.vermilion,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  statusText: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 10,
    color: Colors.graphite,
    letterSpacing: 2,
  },
  statusTextCompact: {
    fontSize: 9,
    letterSpacing: 1.5,
  },
});
