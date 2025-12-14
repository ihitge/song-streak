import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Styles';
import { useClickSound } from '@/hooks/useClickSound';
import { BPM_MIN, BPM_MAX } from '@/types/metronome';

interface BPMDisplayProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => number | null;
  isPlaying?: boolean;
  compact?: boolean;
  readonly?: boolean;  // For song-specific mode where BPM comes from song
}

/**
 * BPM Display with tap tempo and swipe adjustment
 *
 * Features:
 * - Large, tappable display for tap tempo
 * - Vertical swipe/pan to adjust BPM
 * - Visual feedback on tap
 * - Follows Industrial Play aesthetic
 */
export const BPMDisplay: React.FC<BPMDisplayProps> = ({
  bpm,
  onBpmChange,
  onTapTempo,
  isPlaying = false,
  compact = false,
  readonly = false,
}) => {
  const { playSound } = useClickSound();
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);
  const accumulatedDelta = useRef(0);

  /**
   * Flash effect on tap
   */
  const flashTap = useCallback(() => {
    flashOpacity.setValue(1);
    Animated.timing(flashOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [flashOpacity]);

  /**
   * Handle tap for tap tempo
   */
  const handleTap = useCallback(async () => {
    if (readonly) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playSound();
    flashTap();

    const calculatedBpm = onTapTempo();
    if (calculatedBpm !== null) {
      // BPM was calculated from taps
    }
  }, [onTapTempo, playSound, flashTap, readonly]);

  /**
   * Pan responder for swipe-to-adjust BPM
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !readonly,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical movement
        return !readonly && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (_, gestureState) => {
        lastY.current = gestureState.y0;
        accumulatedDelta.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (readonly) return;

        const deltaY = lastY.current - gestureState.moveY;
        lastY.current = gestureState.moveY;

        // Accumulate delta and change BPM every 5px
        accumulatedDelta.current += deltaY;
        const bpmChange = Math.floor(accumulatedDelta.current / 5);

        if (bpmChange !== 0) {
          const newBpm = Math.min(BPM_MAX, Math.max(BPM_MIN, bpm + bpmChange));
          if (newBpm !== bpm) {
            onBpmChange(newBpm);
            Haptics.selectionAsync();
          }
          accumulatedDelta.current = accumulatedDelta.current % 5;
        }
      },
      onPanResponderRelease: () => {
        accumulatedDelta.current = 0;
      },
    })
  ).current;

  /**
   * Increment/decrement buttons for fine adjustment
   */
  const handleIncrement = useCallback(async () => {
    if (readonly) return;
    await Haptics.selectionAsync();
    await playSound();
    onBpmChange(Math.min(BPM_MAX, bpm + 1));
  }, [bpm, onBpmChange, playSound, readonly]);

  const handleDecrement = useCallback(async () => {
    if (readonly) return;
    await Haptics.selectionAsync();
    await playSound();
    onBpmChange(Math.max(BPM_MIN, bpm - 1));
  }, [bpm, onBpmChange, playSound, readonly]);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.controlRow}>
        {/* Decrement button */}
        {!readonly && (
          <TouchableOpacity
            style={[styles.adjustButton, compact && styles.adjustButtonCompact]}
            onPress={handleDecrement}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustButtonText}>−</Text>
          </TouchableOpacity>
        )}

        {/* BPM Display (tappable for tap tempo) */}
        <TouchableOpacity
          style={[
            styles.bpmContainer,
            compact && styles.bpmContainerCompact,
            isPlaying && styles.bpmContainerPlaying,
          ]}
          onPress={handleTap}
          activeOpacity={readonly ? 1 : 0.8}
          {...(readonly ? {} : panResponder.panHandlers)}
        >
          {/* Flash overlay */}
          <Animated.View
            style={[
              styles.flashOverlay,
              { opacity: flashOpacity },
            ]}
          />

          {/* BPM value */}
          <Text style={[styles.bpmValue, compact && styles.bpmValueCompact]}>
            {bpm}
          </Text>
          <Text style={[styles.bpmUnit, compact && styles.bpmUnitCompact]}>
            BPM
          </Text>
        </TouchableOpacity>

        {/* Increment button */}
        {!readonly && (
          <TouchableOpacity
            style={[styles.adjustButton, compact && styles.adjustButtonCompact]}
            onPress={handleIncrement}
            activeOpacity={0.7}
          >
            <Text style={styles.adjustButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tap tempo hint - centered below BPM display */}
      {!readonly && (
        <Text style={[styles.tapHint, compact && styles.tapHintCompact]}>
          TAP TO SET TEMPO
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,  // Reduced from 8
  },
  containerCompact: {
    gap: 3,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,  // Reduced from 12
  },
  adjustButton: {
    width: 28,  // Reduced from 40
    height: 28,  // Reduced from 40
    borderRadius: 14,  // Reduced from 20
    backgroundColor: Colors.alloy,
    justifyContent: 'center',
    alignItems: 'center',
    // Bevel effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 1,  // Reduced from 2
    borderBottomColor: 'rgba(0,0,0,0.15)',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  adjustButtonCompact: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  adjustButtonText: {
    fontFamily: 'LexendDecaBold',
    fontSize: 17,  // Reduced from 24
    color: Colors.charcoal,
    marginTop: -1,
  },
  bpmContainer: {
    width: 84,  // Reduced from 120
    height: 56,  // Reduced from 80
    backgroundColor: Colors.ink,
    borderRadius: 8,  // Reduced from 12
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Inset effect
    borderTopWidth: 1,  // Reduced from 2
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  bpmContainerCompact: {
    width: 70,
    height: 42,
    borderRadius: 6,
  },
  bpmContainerPlaying: {
    borderColor: Colors.vermilion,
    borderWidth: 1,  // Reduced from 2
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.vermilion,
  },
  bpmValue: {
    fontFamily: 'LexendDecaBold',
    fontSize: 25,  // Reduced from 36
    color: Colors.softWhite,
    letterSpacing: 1,
  },
  bpmValueCompact: {
    fontSize: 20,
  },
  bpmUnit: {
    fontFamily: 'LexendDecaSemiBold',
    fontSize: 7,  // Reduced from 10
    color: Colors.graphite,
    letterSpacing: 1.5,
    marginTop: -3,
  },
  bpmUnitCompact: {
    fontSize: 6,
    marginTop: -2,
  },
  tapHint: {
    ...Typography.label,
    color: Colors.vermilion,
    textAlign: 'center',
    marginTop: 3,
  },
  tapHintCompact: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.vermilion,
    textAlign: 'center',
    marginTop: 2,
  },
});
