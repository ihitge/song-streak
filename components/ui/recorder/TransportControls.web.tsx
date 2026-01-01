/**
 * TransportControls Web Component
 *
 * CSS-based fallback for the transport controls on web.
 * Matches the native Skia version visually using CSS gradients and shadows.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Rewind, Circle, Square, Play, FastForward } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useClickSound } from '@/hooks/useClickSound';
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

// Button configuration
const BUTTONS: {
  id: TransportButton;
  icon: typeof Rewind;
  label: string;
}[] = [
  { id: 'rewind', icon: Rewind, label: 'Rewind' },
  { id: 'record', icon: Circle, label: 'Record' },
  { id: 'stop', icon: Square, label: 'Stop' },
  { id: 'play', icon: Play, label: 'Play' },
  { id: 'fastforward', icon: FastForward, label: 'Fast Forward' },
];

const BUTTON_SIZE = 48;
const BUTTON_SIZE_COMPACT = 38;
const WELL_HEIGHT = 60;
const WELL_HEIGHT_COMPACT = 48;
const BORDER_RADIUS = 4;

export const TransportControls: React.FC<TransportControlsProps> = ({
  state,
  hasRecording = false,
  disabled = false,
  onPress,
  compact = false,
}) => {
  const [wellWidth, setWellWidth] = useState(280);
  const { playSound } = useClickSound();

  const buttonSize = compact ? BUTTON_SIZE_COMPACT : BUTTON_SIZE;
  const wellHeight = compact ? WELL_HEIGHT_COMPACT : WELL_HEIGHT;

  const handleLayout = (event: LayoutChangeEvent) => {
    setWellWidth(event.nativeEvent.layout.width);
  };

  const handlePress = async (buttonId: TransportButton) => {
    if (disabled) return;

    // Don't allow certain actions based on state
    if (buttonId === 'play' && !hasRecording) return;
    if (buttonId === 'rewind' && !hasRecording) return;
    if (buttonId === 'fastforward' && !hasRecording) return;
    if (buttonId === 'record' && state === 'recording') return;
    if (buttonId === 'record' && state === 'playing') return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await playSound();
    onPress(buttonId);
  };

  // Determine button states
  const getButtonState = (buttonId: TransportButton): {
    isActive: boolean;
    isDisabled: boolean;
    glowColor: string | null;
  } => {
    switch (buttonId) {
      case 'record':
        return {
          isActive: state === 'recording',
          isDisabled: disabled || state === 'playing',
          glowColor: state === 'recording' ? Colors.vermilion : null,
        };
      case 'play':
        return {
          isActive: state === 'playing',
          isDisabled: disabled || !hasRecording || state === 'recording',
          glowColor: state === 'playing' ? Colors.moss : null,
        };
      case 'stop':
        return {
          isActive: false,
          isDisabled: disabled || (state !== 'recording' && state !== 'playing'),
          glowColor: null,
        };
      case 'rewind':
      case 'fastforward':
        return {
          isActive: false,
          isDisabled: disabled || !hasRecording || state === 'recording',
          glowColor: null,
        };
      default:
        return { isActive: false, isDisabled: disabled, glowColor: null };
    }
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Housing well */}
      <View
        style={[styles.wellContainer, { height: wellHeight }]}
        onLayout={handleLayout}
      >
        {/* CSS well background */}
        <View style={styles.wellBackground} />

        {/* Buttons row */}
        <View style={styles.buttonsRow}>
          {BUTTONS.map((button) => {
            const { isActive, isDisabled, glowColor } = getButtonState(button.id);
            const IconComponent = button.icon;

            // Special styling for record button (filled when active)
            const isRecordButton = button.id === 'record';

            return (
              <Pressable
                key={button.id}
                onPress={() => handlePress(button.id)}
                disabled={isDisabled}
                style={[
                  styles.buttonWrapper,
                  { width: buttonSize, height: buttonSize },
                ]}
                accessibilityLabel={button.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: isDisabled }}
                accessibilityHint={`${button.label} transport control`}
              >
                {/* Button cap (CSS version) */}
                <View
                  style={[
                    styles.buttonCap,
                    { width: buttonSize, height: buttonSize },
                    isActive ? styles.buttonCapActive : styles.buttonCapRaised,
                  ]}
                >
                  {/* Icon */}
                  <View style={styles.iconContainer}>
                    <IconComponent
                      size={compact ? 16 : 20}
                      color={
                        isDisabled
                          ? Colors.graphite
                          : isActive
                            ? Colors.softWhite
                            : isRecordButton
                              ? Colors.vermilion
                              : Colors.charcoal
                      }
                      fill={isRecordButton && isActive ? Colors.vermilion : 'transparent'}
                      strokeWidth={isRecordButton ? 2.5 : 2}
                    />
                  </View>

                  {/* Active glow indicator */}
                  {glowColor && (
                    <View
                      style={[
                        styles.glowIndicator,
                        { backgroundColor: glowColor, shadowColor: glowColor },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerCompact: {},
  wellContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  wellBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.ink,
    borderRadius: 8,
    // Inset shadow simulation
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    // Inner border for depth
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  buttonsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCap: {
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonCapRaised: {
    backgroundColor: Colors.softWhite,
    // Raised appearance with CSS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Top highlight
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.9)',
    // Gradient simulation via border
    borderBottomWidth: 1,
    borderBottomColor: '#d4d4d4',
  },
  buttonCapActive: {
    backgroundColor: Colors.charcoal,
    // Pressed appearance with CSS
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    // Inset border
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  glowIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default TransportControls;
