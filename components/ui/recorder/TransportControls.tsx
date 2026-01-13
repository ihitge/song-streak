/**
 * TransportControls Component
 *
 * 3-button transport for the reel-to-reel recorder.
 * Primary button matches FAB style (64×64px, solid color, white ring).
 * Buttons: RESET | RECORD/STOP/PLAY (primary) | FAST-FORWARD
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Rewind, Circle, Square, Play, FastForward, RotateCcw, Pause } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { TransportButton, RecorderState } from '@/types/voiceMemo';

interface TransportControlsProps {
  /** Current recorder state */
  state: RecorderState;
  /** Has a recording to play */
  hasRecording?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Called when a transport button is pressed */
  onPress: (button: TransportButton) => void;
  /** Compact mode */
  compact?: boolean;
}

/**
 * Transport Controls for Voice Recorder
 *
 * 3-button layout:
 * - Left: Rewind (when playing) or Reset
 * - Center: Record/Stop/Play (context-aware, FAB style)
 * - Right: Fast Forward
 */
export const TransportControls: React.FC<TransportControlsProps> = ({
  state,
  hasRecording = false,
  disabled = false,
  onPress,
  compact = false,
}) => {

  // Get primary button configuration based on state
  const getPrimaryConfig = () => {
    if (state === 'recording') {
      return {
        id: 'stop' as TransportButton,
        icon: Square,
        label: 'Stop Recording',
        backgroundColor: Colors.vermilion,
        iconFill: true,
      };
    }
    if (state === 'playing') {
      return {
        id: 'stop' as TransportButton,
        icon: Pause,
        label: 'Pause',
        backgroundColor: Colors.graphite,
        iconFill: false,
      };
    }
    if (hasRecording) {
      return {
        id: 'play' as TransportButton,
        icon: Play,
        label: 'Play',
        backgroundColor: Colors.moss,
        iconFill: false,
      };
    }
    return {
      id: 'record' as TransportButton,
      icon: Circle,
      label: 'Record',
      backgroundColor: Colors.vermilion,
      iconFill: true,
    };
  };

  const primaryConfig = getPrimaryConfig();
  const isRecording = state === 'recording';

  // Handle button presses
  const handleLeftPress = useCallback(async () => {
    if (disabled) return;
    if (!hasRecording && state !== 'playing') return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(state === 'playing' ? 'rewind' : 'stop');
  }, [disabled, hasRecording, state, onPress]);

  const handlePrimaryPress = useCallback(async () => {
    if (disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(primaryConfig.id);
  }, [disabled, primaryConfig.id, onPress]);

  const handleRightPress = useCallback(async () => {
    if (disabled || !hasRecording || state === 'recording') return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress('fastforward');
  }, [disabled, hasRecording, state, onPress]);

  // Button disabled states
  const leftDisabled = disabled || (!hasRecording && state !== 'recording');
  const rightDisabled = disabled || !hasRecording || state === 'recording';

  // Icon sizes
  const primaryIconSize = compact ? 24 : 28;
  const secondaryIconSize = compact ? 16 : 20;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Left button - Rewind (when playing) or Reset */}
      <TouchableOpacity
        style={[styles.secondaryButton, leftDisabled && styles.buttonDisabled]}
        onPress={handleLeftPress}
        activeOpacity={0.8}
        disabled={leftDisabled}
        accessibilityLabel={state === 'playing' ? 'Rewind' : 'Reset'}
        accessibilityRole="button"
      >
        <View style={[styles.secondaryButtonInner, compact && styles.secondaryButtonInnerCompact]}>
          {state === 'playing' ? (
            <Rewind size={secondaryIconSize} color={leftDisabled ? Colors.warmGray : Colors.graphite} />
          ) : (
            <RotateCcw size={secondaryIconSize} color={leftDisabled ? Colors.warmGray : Colors.graphite} />
          )}
        </View>
      </TouchableOpacity>

      {/* Primary button - Record/Stop/Play (FAB style) */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          compact && styles.primaryButtonCompact,
          { backgroundColor: primaryConfig.backgroundColor },
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePrimaryPress}
        activeOpacity={0.9}
        disabled={disabled}
        accessibilityLabel={primaryConfig.label}
        accessibilityRole="button"
      >
        <primaryConfig.icon
          size={primaryIconSize}
          color={Colors.softWhite}
          fill={primaryConfig.iconFill ? Colors.softWhite : 'transparent'}
          style={primaryConfig.id === 'play' ? { marginLeft: compact ? 2 : 3 } : undefined}
        />
      </TouchableOpacity>

      {/* Right button - Fast Forward */}
      <TouchableOpacity
        style={[styles.secondaryButton, rightDisabled && styles.buttonDisabled]}
        onPress={handleRightPress}
        activeOpacity={0.8}
        disabled={rightDisabled}
        accessibilityLabel="Fast Forward"
        accessibilityRole="button"
      >
        <View style={[styles.secondaryButtonInner, compact && styles.secondaryButtonInnerCompact]}>
          <FastForward size={secondaryIconSize} color={rightDisabled ? Colors.warmGray : Colors.graphite} />
        </View>
      </TouchableOpacity>
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
  // Primary button - FAB style (64×64, solid color, white ring)
  primaryButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    // White ring effect (matches FAB)
    borderWidth: 2,
    borderColor: '#fff',
    // Shadow (matches FAB)
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  primaryButtonCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  // Secondary buttons (beveled style)
  secondaryButton: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default TransportControls;
